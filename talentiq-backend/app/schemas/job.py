"""
Job schemas.
"""

from datetime import datetime
from pydantic import BaseModel


class JobCreate(BaseModel):
    title: str
    department: str | None = None
    description: str | None = None
    required_skills: str | None = None
    preferred_skills: str | None = None
    experience_level: str | None = None
    location: str | None = None
    salary: str | None = None
    employment_type: str | None = None
    status: str = "active"


class JobUpdate(BaseModel):
    title: str | None = None
    department: str | None = None
    description: str | None = None
    required_skills: str | None = None
    preferred_skills: str | None = None
    experience_level: str | None = None
    location: str | None = None
    salary: str | None = None
    employment_type: str | None = None
    status: str | None = None


class JobOut(BaseModel):
    id: str
    user_id: str
    title: str
    department: str | None
    description: str | None
    required_skills: str | None
    preferred_skills: str | None
    experience_level: str | None
    location: str | None
    salary: str | None
    employment_type: str | None
    status: str
    created_at: datetime
    updated_at: datetime
    candidate_count: int = 0

    model_config = {"from_attributes": True}
