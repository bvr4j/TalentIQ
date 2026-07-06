from app.api.auth import router as auth_router
from app.api.jobs import router as jobs_router
from app.api.upload import router as upload_router
from app.api.candidates import router as candidates_router
from app.api.analytics import router as analytics_router
from app.api.settings import router as settings_router

__all__ = [
    "auth_router", "jobs_router", "upload_router",
    "candidates_router", "analytics_router", "settings_router",
]
