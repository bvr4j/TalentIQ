"""
Candidate and analysis schemas.
"""

from datetime import datetime
from pydantic import BaseModel


class SkillOut(BaseModel):
    skill: str
    proficiency: str | None

    model_config = {"from_attributes": True}


class ExperienceOut(BaseModel):
    title: str | None
    company: str | None
    duration: str | None
    description: str | None

    model_config = {"from_attributes": True}


class EducationOut(BaseModel):
    degree: str | None
    institution: str | None
    year: str | None

    model_config = {"from_attributes": True}


class ProjectOut(BaseModel):
    name: str | None
    description: str | None
    url: str | None

    model_config = {"from_attributes": True}


class GitHubProfileOut(BaseModel):
    username: str | None
    public_repos: int
    total_stars: int
    languages: list | None
    recent_activity: dict | None
    contribution_frequency: str | None
    activity_score: float

    model_config = {"from_attributes": True}


class AnalysisOut(BaseModel):
    id: str
    match_score: float
    github_score: float
    linkedin_score: float
    overall_score: float
    recommendation: str | None
    strengths: list | None
    weaknesses: list | None
    matched_skills: list | None
    missing_skills: list | None
    interview_questions: dict | None
    reasoning: str | None
    experience_match: str | None
    education_match: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


class CandidateOut(BaseModel):
    id: str
    job_id: str | None
    name: str | None
    email: str | None
    phone: str | None
    github_url: str | None
    linkedin_url: str | None
    status: str
    created_at: datetime
    skills: list[SkillOut] = []
    experience: list[ExperienceOut] = []
    education: list[EducationOut] = []
    projects: list[ProjectOut] = []
    analysis: AnalysisOut | None = None
    github_profile: GitHubProfileOut | None = None

    model_config = {"from_attributes": True}


class CandidateListItem(BaseModel):
    id: str
    name: str | None
    email: str | None
    status: str
    job_id: str | None
    overall_score: float | None = None
    recommendation: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class UploadResponse(BaseModel):
    candidate_id: str
    name: str | None
    status: str
    message: str
    analysis: AnalysisOut | None = None
