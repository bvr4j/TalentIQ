"""
Candidates API — /api/candidates/*
List and view candidate profiles with analysis results.
"""

import logging
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload

from app.database.session import get_db
from app.models.user import User
from app.models.candidate import Candidate
from app.schemas.candidate import CandidateOut, CandidateListItem
from app.utils.dependencies import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/candidates", tags=["candidates"])


@router.get("", response_model=list[CandidateListItem])
def list_candidates(
    job_id: str | None = Query(None, description="Filter by job ID"),
    status: str | None = Query(None, description="Filter by status"),
    limit: int = Query(50, le=200),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[CandidateListItem]:
    """List all candidates for the current user, optionally filtered."""
    query = (
        db.query(Candidate)
        .options(joinedload(Candidate.analysis))
        .filter(Candidate.user_id == current_user.id)
    )

    if job_id:
        query = query.filter(Candidate.job_id == job_id)
    if status:
        query = query.filter(Candidate.status == status)

    candidates = query.order_by(Candidate.created_at.desc()).offset(offset).limit(limit).all()

    result = []
    for c in candidates:
        item = CandidateListItem(
            id=c.id,
            name=c.name,
            email=c.email,
            status=c.status,
            job_id=c.job_id,
            overall_score=c.analysis.overall_score if c.analysis else None,
            recommendation=c.analysis.recommendation if c.analysis else None,
            created_at=c.created_at,
        )
        result.append(item)

    return result


@router.get("/{candidate_id}", response_model=CandidateOut)
def get_candidate(
    candidate_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> CandidateOut:
    """Get full candidate profile including analysis, skills, experience, etc."""
    candidate = (
        db.query(Candidate)
        .options(
            joinedload(Candidate.skills),
            joinedload(Candidate.experience),
            joinedload(Candidate.education),
            joinedload(Candidate.projects),
            joinedload(Candidate.analysis),
            joinedload(Candidate.github_profile),
        )
        .filter(Candidate.id == candidate_id, Candidate.user_id == current_user.id)
        .first()
    )

    if not candidate:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Candidate not found")

    return CandidateOut.model_validate(candidate)


@router.delete("/{candidate_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_candidate(
    candidate_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    """Remove a candidate record."""
    candidate = (
        db.query(Candidate)
        .filter(Candidate.id == candidate_id, Candidate.user_id == current_user.id)
        .first()
    )
    if not candidate:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Candidate not found")

    db.delete(candidate)
    db.commit()
    logger.info("[candidates] Deleted candidate: %s", candidate_id)
