"""
Analytics API — /api/analytics/*
Dashboard metrics, skill distribution, score distribution, hiring funnel.
"""

import logging
from collections import Counter
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.user import User
from app.models.job import Job
from app.models.candidate import Candidate, CandidateSkill
from app.models.analysis import AnalysisResult
from app.schemas.analytics import (
    AnalyticsSummary, DashboardStats,
    SkillFrequency, ScoreDistributionBucket,
    RecommendationCount, JobCandidateCount,
)
from app.utils.dependencies import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("/summary", response_model=AnalyticsSummary)
def get_analytics_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> AnalyticsSummary:
    """Full analytics summary for the dashboard."""
    user_id = current_user.id

    # ── Jobs ──────────────────────────────────────────────────────────────────
    active_jobs = db.query(Job).filter(Job.user_id == user_id, Job.status == "active").count()
    jobs = db.query(Job).filter(Job.user_id == user_id).all()

    # ── Candidates ────────────────────────────────────────────────────────────
    candidates = db.query(Candidate).filter(Candidate.user_id == user_id).all()
    total_candidates = len(candidates)

    # ── Analysis results ──────────────────────────────────────────────────────
    candidate_ids = [c.id for c in candidates]
    analyses = (
        db.query(AnalysisResult)
        .filter(AnalysisResult.candidate_id.in_(candidate_ids))
        .all()
        if candidate_ids else []
    )

    scores = [a.overall_score for a in analyses if a.overall_score is not None]
    avg_score = round(sum(scores) / len(scores), 1) if scores else 0.0
    strong_matches = sum(1 for a in analyses if (a.overall_score or 0) >= 65)

    # ── Top skills ────────────────────────────────────────────────────────────
    skills = (
        db.query(CandidateSkill.skill)
        .filter(CandidateSkill.candidate_id.in_(candidate_ids))
        .all()
        if candidate_ids else []
    )
    skill_counter = Counter(s[0].lower().strip() for s in skills if s[0])
    top_skills = [
        SkillFrequency(skill=skill, count=count)
        for skill, count in skill_counter.most_common(15)
    ]

    # ── Score distribution ────────────────────────────────────────────────────
    buckets = [
        ("0-20", 0, 20),
        ("21-40", 21, 40),
        ("41-60", 41, 60),
        ("61-80", 61, 80),
        ("81-100", 81, 100),
    ]
    score_distribution = [
        ScoreDistributionBucket(
            range=label,
            count=sum(1 for s in scores if lo <= s <= hi),
        )
        for label, lo, hi in buckets
    ]

    # ── Recommendation distribution ────────────────────────────────────────────
    rec_counter = Counter(
        a.recommendation for a in analyses if a.recommendation
    )
    recommendation_distribution = [
        RecommendationCount(recommendation=rec, count=count)
        for rec, count in rec_counter.items()
    ]

    # ── Candidates per job ────────────────────────────────────────────────────
    job_counts: dict[str, int] = Counter(
        c.job_id for c in candidates if c.job_id
    )
    job_map = {j.id: j.title for j in jobs}
    candidates_per_job = [
        JobCandidateCount(
            job_id=job_id,
            job_title=job_map.get(job_id, "Unknown"),
            candidate_count=count,
        )
        for job_id, count in sorted(job_counts.items(), key=lambda x: -x[1])
    ]

    return AnalyticsSummary(
        stats=DashboardStats(
            total_candidates=total_candidates,
            strong_matches=strong_matches,
            active_jobs=active_jobs,
            avg_match_score=avg_score,
        ),
        top_skills=top_skills,
        score_distribution=score_distribution,
        recommendation_distribution=recommendation_distribution,
        candidates_per_job=candidates_per_job,
    )
