"""
Upload API — /api/upload
Handles resume file upload, text extraction, and triggers the AI analysis pipeline.
"""

import logging
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.user import User
from app.models.job import Job
from app.models.candidate import (
    Candidate, CandidateSkill, CandidateExperience,
    CandidateEducation, CandidateProject,
)
from app.models.analysis import AnalysisResult, GitHubProfile
from app.schemas.candidate import UploadResponse
from app.agents.orchestrator import run_analysis_pipeline
from app.services.pdf_parser import extract_text_from_pdf
from app.services.docx_parser import extract_text_from_docx
from app.utils.dependencies import get_current_user
from app.utils.file_utils import is_allowed_file, get_file_extension, ensure_upload_dir, safe_filename

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/upload", tags=["upload"])

MAX_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB


@router.post("", response_model=UploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_resume(
    file: UploadFile = File(...),
    job_id: str | None = Form(None),
    github_url: str | None = Form(None),
    linkedin_url: str | None = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UploadResponse:
    """
    Upload a resume file (PDF or DOCX), extract text, run the AI pipeline,
    and persist results to the database.
    """
    # ── Validate file ─────────────────────────────────────────────────────────
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")

    if not is_allowed_file(file.filename):
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type. Only PDF and DOCX are accepted. Got: {Path(file.filename).suffix}",
        )

    content = await file.read()
    if len(content) > MAX_SIZE_BYTES:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size is 10 MB. Got {len(content) / 1024 / 1024:.1f} MB.",
        )

    # ── Save file ─────────────────────────────────────────────────────────────
    upload_dir = ensure_upload_dir()
    filename = safe_filename(file.filename, prefix=current_user.id[:8])
    file_path = upload_dir / filename

    with open(file_path, "wb") as f:
        f.write(content)

    # ── Extract text ──────────────────────────────────────────────────────────
    ext = get_file_extension(file.filename)
    if ext == ".pdf":
        resume_text = extract_text_from_pdf(str(file_path))
    else:
        resume_text = extract_text_from_docx(str(file_path))

    if not resume_text or len(resume_text.strip()) < 30:
        raise HTTPException(
            status_code=422,
            detail="Could not extract readable text from the file. Please ensure the file is not corrupted or image-only.",
        )

    # ── Resolve job ───────────────────────────────────────────────────────────
    job_dict: dict = {}
    db_job = None
    if job_id:
        db_job = db.query(Job).filter(Job.id == job_id, Job.user_id == current_user.id).first()
        if db_job:
            job_dict = {
                "id": db_job.id,
                "title": db_job.title,
                "description": db_job.description,
                "required_skills": db_job.required_skills,
                "preferred_skills": db_job.preferred_skills,
                "experience_level": db_job.experience_level,
            }

    # ── Create candidate record ───────────────────────────────────────────────
    candidate = Candidate(
        user_id=current_user.id,
        job_id=job_id if db_job else None,
        resume_path=str(file_path),
        resume_text=resume_text[:10000],  # Store first 10k chars
        github_url=github_url,
        linkedin_url=linkedin_url,
        status="pending",
    )
    db.add(candidate)
    db.commit()
    db.refresh(candidate)

    # ── Run AI pipeline ───────────────────────────────────────────────────────
    logger.info("[upload] Starting pipeline for candidate %s", candidate.id)

    try:
        result = run_analysis_pipeline(
            resume_text=resume_text,
            job=job_dict,
            github_url=github_url,
            linkedin_url=linkedin_url,
        )

        resume_data = result.get("resume_data") or {}
        matching_data = result.get("matching_data") or {}
        github_data = result.get("github_data") or {}
        linkedin_data = result.get("linkedin_data") or {}
        recommendation_data = result.get("recommendation_data") or {}
        interview_data = result.get("interview_data") or {}

        # ── Update candidate with extracted info ──────────────────────────────
        candidate.name = resume_data.get("name")
        candidate.email = resume_data.get("email")
        candidate.phone = resume_data.get("phone")
        candidate.github_url = github_url or resume_data.get("github_url")
        candidate.linkedin_url = linkedin_url or resume_data.get("linkedin_url")
        candidate.status = "analyzed"

        # ── Skills ────────────────────────────────────────────────────────────
        for skill in resume_data.get("skills", [])[:30]:
            if isinstance(skill, str) and skill.strip():
                db.add(CandidateSkill(candidate_id=candidate.id, skill=skill.strip()))

        # ── Experience ────────────────────────────────────────────────────────
        for exp in resume_data.get("experience", [])[:10]:
            if isinstance(exp, dict):
                db.add(CandidateExperience(
                    candidate_id=candidate.id,
                    title=exp.get("title"),
                    company=exp.get("company"),
                    duration=exp.get("duration"),
                    description=exp.get("description"),
                ))

        # ── Education ────────────────────────────────────────────────────────
        for edu in resume_data.get("education", [])[:5]:
            if isinstance(edu, dict):
                db.add(CandidateEducation(
                    candidate_id=candidate.id,
                    degree=edu.get("degree"),
                    institution=edu.get("institution"),
                    year=edu.get("year"),
                ))

        # ── Projects ──────────────────────────────────────────────────────────
        for proj in resume_data.get("projects", [])[:10]:
            if isinstance(proj, dict):
                db.add(CandidateProject(
                    candidate_id=candidate.id,
                    name=proj.get("name"),
                    description=proj.get("description"),
                    url=proj.get("url"),
                ))

        # ── Analysis result ────────────────────────────────────────────────────
        analysis = AnalysisResult(
            candidate_id=candidate.id,
            job_id=job_id if db_job else None,
            match_score=recommendation_data.get("match_score", matching_data.get("match_score", 0.0)),
            github_score=recommendation_data.get("github_score", github_data.get("activity_score", 0.0)),
            linkedin_score=recommendation_data.get("linkedin_score", linkedin_data.get("linkedin_score", 0.0)),
            overall_score=recommendation_data.get("overall_score", 0.0),
            recommendation=recommendation_data.get("recommendation"),
            strengths=recommendation_data.get("strengths", []),
            weaknesses=recommendation_data.get("weaknesses", []),
            matched_skills=recommendation_data.get("matched_skills", []),
            missing_skills=recommendation_data.get("missing_skills", []),
            interview_questions=interview_data,
            reasoning=recommendation_data.get("reasoning"),
            experience_match=recommendation_data.get("experience_match"),
            education_match=recommendation_data.get("education_match"),
        )
        db.add(analysis)

        # ── GitHub profile ────────────────────────────────────────────────────
        if github_data:
            gh_profile = GitHubProfile(
                candidate_id=candidate.id,
                username=github_data.get("username"),
                public_repos=github_data.get("public_repos", 0),
                total_stars=github_data.get("total_stars", 0),
                languages=github_data.get("languages"),
                recent_activity=github_data.get("recent_activity"),
                contribution_frequency=github_data.get("contribution_frequency"),
                activity_score=github_data.get("activity_score", 0.0),
            )
            db.add(gh_profile)

        db.commit()
        db.refresh(candidate)
        db.refresh(analysis)

        from app.schemas.candidate import AnalysisOut
        analysis_out = AnalysisOut.model_validate(analysis)

        return UploadResponse(
            candidate_id=candidate.id,
            name=candidate.name,
            status="analyzed",
            message="Resume analyzed successfully.",
            analysis=analysis_out,
        )

    except Exception as exc:
        logger.error("[upload] Pipeline error for candidate %s: %s", candidate.id, exc)
        # Mark candidate as errored but don't lose the record
        candidate.status = "error"
        db.commit()
        return UploadResponse(
            candidate_id=candidate.id,
            name=None,
            status="error",
            message=f"Resume uploaded but analysis failed: {exc}",
            analysis=None,
        )
