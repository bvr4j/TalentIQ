from app.schemas.auth import UserRegister, UserLogin, TokenResponse, UserOut, MessageResponse, RefreshRequest
from app.schemas.job import JobCreate, JobUpdate, JobOut
from app.schemas.candidate import (
    CandidateOut, CandidateListItem, AnalysisOut, UploadResponse,
    SkillOut, ExperienceOut, EducationOut, ProjectOut, GitHubProfileOut
)
from app.schemas.analytics import (
    DashboardStats, AnalyticsSummary, SkillFrequency,
    ScoreDistributionBucket, RecommendationCount, JobCandidateCount
)
from app.schemas.settings import SettingsUpdate, SettingsOut

__all__ = [
    "UserRegister", "UserLogin", "TokenResponse", "UserOut", "MessageResponse", "RefreshRequest",
    "JobCreate", "JobUpdate", "JobOut",
    "CandidateOut", "CandidateListItem", "AnalysisOut", "UploadResponse",
    "SkillOut", "ExperienceOut", "EducationOut", "ProjectOut", "GitHubProfileOut",
    "DashboardStats", "AnalyticsSummary", "SkillFrequency",
    "ScoreDistributionBucket", "RecommendationCount", "JobCandidateCount",
    "SettingsUpdate", "SettingsOut",
]
