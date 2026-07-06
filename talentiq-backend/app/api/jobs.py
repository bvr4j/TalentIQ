"""
Jobs API — /api/jobs/*
Full CRUD for job postings.
"""

import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.user import User
from app.models.job import Job
from app.schemas.job import JobCreate, JobUpdate, JobOut
from app.utils.dependencies import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/jobs", tags=["jobs"])


@router.get("", response_model=list[JobOut])
def list_jobs(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[JobOut]:
    """List all jobs for the current recruiter."""
    jobs = (
        db.query(Job)
        .filter(Job.user_id == current_user.id)
        .order_by(Job.created_at.desc())
        .all()
    )
    result = []
    for job in jobs:
        out = JobOut.model_validate(job)
        out.candidate_count = len(job.candidates) if job.candidates else 0
        result.append(out)
    return result


@router.post("", response_model=JobOut, status_code=status.HTTP_201_CREATED)
def create_job(
    body: JobCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> JobOut:
    """Create a new job posting."""
    job = Job(
        user_id=current_user.id,
        title=body.title,
        department=body.department,
        description=body.description,
        required_skills=body.required_skills,
        preferred_skills=body.preferred_skills,
        experience_level=body.experience_level,
        location=body.location,
        salary=body.salary,
        employment_type=body.employment_type,
        status=body.status,
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    logger.info("[jobs] Created job: %s by %s", job.id, current_user.email)
    out = JobOut.model_validate(job)
    out.candidate_count = 0
    return out


@router.get("/{job_id}", response_model=JobOut)
def get_job(
    job_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> JobOut:
    """Get a specific job by ID."""
    job = _get_job_or_404(job_id, current_user.id, db)
    out = JobOut.model_validate(job)
    out.candidate_count = len(job.candidates) if job.candidates else 0
    return out


@router.put("/{job_id}", response_model=JobOut)
def update_job(
    job_id: str,
    body: JobUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> JobOut:
    """Update a job posting."""
    job = _get_job_or_404(job_id, current_user.id, db)

    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(job, field, value)

    db.commit()
    db.refresh(job)
    out = JobOut.model_validate(job)
    out.candidate_count = len(job.candidates) if job.candidates else 0
    return out


@router.delete("/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_job(
    job_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    """Delete a job posting and all its candidates."""
    job = _get_job_or_404(job_id, current_user.id, db)
    db.delete(job)
    db.commit()
    logger.info("[jobs] Deleted job: %s", job_id)


def _get_job_or_404(job_id: str, user_id: str, db: Session) -> Job:
    job = db.query(Job).filter(Job.id == job_id, Job.user_id == user_id).first()
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
    return job
