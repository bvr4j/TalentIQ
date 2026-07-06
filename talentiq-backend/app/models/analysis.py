"""
AnalysisResult and GitHubProfile models.
"""

import uuid
from datetime import datetime
from sqlalchemy import String, DateTime, Text, Float, ForeignKey, Integer, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base


class AnalysisResult(Base):
    __tablename__ = "analysis_results"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    candidate_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("candidates.id", ondelete="CASCADE"), nullable=False, unique=True, index=True
    )
    job_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("jobs.id", ondelete="SET NULL"), nullable=True
    )

    # Scores
    match_score: Mapped[float] = mapped_column(Float, default=0.0)
    github_score: Mapped[float] = mapped_column(Float, default=0.0)
    linkedin_score: Mapped[float] = mapped_column(Float, default=0.0)
    overall_score: Mapped[float] = mapped_column(Float, default=0.0)

    # Verdict
    recommendation: Mapped[str | None] = mapped_column(String(50), nullable=True)
    # Strong Hire | Hire | Consider | Reject

    # JSON fields
    strengths: Mapped[list | None] = mapped_column(JSON, nullable=True)
    weaknesses: Mapped[list | None] = mapped_column(JSON, nullable=True)
    matched_skills: Mapped[list | None] = mapped_column(JSON, nullable=True)
    missing_skills: Mapped[list | None] = mapped_column(JSON, nullable=True)
    interview_questions: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    reasoning: Mapped[str | None] = mapped_column(Text, nullable=True)
    experience_match: Mapped[str | None] = mapped_column(String(100), nullable=True)
    education_match: Mapped[str | None] = mapped_column(String(100), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    # Relationships
    candidate: Mapped["Candidate"] = relationship(  # type: ignore[name-defined]
        "Candidate", back_populates="analysis"
    )

    def __repr__(self) -> str:
        return f"<AnalysisResult candidate_id={self.candidate_id} score={self.overall_score}>"


class GitHubProfile(Base):
    __tablename__ = "github_profiles"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    candidate_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("candidates.id", ondelete="CASCADE"), nullable=False, unique=True, index=True
    )
    username: Mapped[str | None] = mapped_column(String(255), nullable=True)
    public_repos: Mapped[int] = mapped_column(Integer, default=0)
    total_stars: Mapped[int] = mapped_column(Integer, default=0)
    languages: Mapped[list | None] = mapped_column(JSON, nullable=True)
    recent_activity: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    contribution_frequency: Mapped[str | None] = mapped_column(String(100), nullable=True)
    activity_score: Mapped[float] = mapped_column(Float, default=0.0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    candidate: Mapped["Candidate"] = relationship(  # type: ignore[name-defined]
        "Candidate", back_populates="github_profile"
    )
