"""
Analytics schemas.
"""

from pydantic import BaseModel


class DashboardStats(BaseModel):
    total_candidates: int
    strong_matches: int
    active_jobs: int
    avg_match_score: float
    avg_time_to_hire_days: float | None = None


class SkillFrequency(BaseModel):
    skill: str
    count: int


class ScoreDistributionBucket(BaseModel):
    range: str          # e.g. "0-20", "21-40"
    count: int


class RecommendationCount(BaseModel):
    recommendation: str
    count: int


class JobCandidateCount(BaseModel):
    job_id: str
    job_title: str
    candidate_count: int


class AnalyticsSummary(BaseModel):
    stats: DashboardStats
    top_skills: list[SkillFrequency]
    score_distribution: list[ScoreDistributionBucket]
    recommendation_distribution: list[RecommendationCount]
    candidates_per_job: list[JobCandidateCount]
