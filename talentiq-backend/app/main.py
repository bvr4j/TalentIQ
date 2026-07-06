"""
TalentIQ Backend — FastAPI Application Entry Point

Production-ready API with:
  - CORS for frontend on localhost:3000
  - JWT authentication
  - LangGraph AI pipeline
  - PostgreSQL via SQLAlchemy
  - Swagger UI at /docs
"""

import logging
from contextlib import asynccontextmanager
from typing import AsyncIterator

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

from app.config.settings import get_settings
from app.database.init_db import init_db
from app.utils.logger import setup_logging
from app.api.auth import router as auth_router
from app.api.jobs import router as jobs_router
from app.api.upload import router as upload_router
from app.api.candidates import router as candidates_router
from app.api.analytics import router as analytics_router
from app.api.settings import router as settings_router

# Setup logging before anything else
setup_logging()
logger = logging.getLogger(__name__)

settings = get_settings()


# ── Lifespan ───────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """Startup and shutdown events."""
    logger.info("Starting TalentIQ API v%s", settings.APP_VERSION)
    logger.info("Database: %s", settings.DATABASE_URL.split("@")[-1] if "@" in settings.DATABASE_URL else "local")

    # Create tables on startup (idempotent)
    try:
        init_db()
        logger.info("Database tables created/verified")
    except Exception as exc:
        logger.error("Database init failed: %s", exc)
        # Don't crash on DB failure — allow startup for health checks

    yield

    logger.info("TalentIQ API shutting down")


# ── App factory ────────────────────────────────────────────────────────────────

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=(
        "TalentIQ — AI-Powered Recruitment Intelligence Platform\n\n"
        "## Authentication\n"
        "Use `/api/auth/login` to get a JWT token, then pass it as `Bearer <token>` "
        "in the `Authorization` header.\n\n"
        "## Pipeline\n"
        "Upload a resume at `/api/upload` to trigger the full AI analysis pipeline: "
        "Resume Agent → Matching → GitHub → LinkedIn → Recommendation → Interview Questions."
    ),
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)


# ── CORS ───────────────────────────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Exception handlers ─────────────────────────────────────────────────────────

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    errors = [{"field": ".".join(str(loc) for loc in e["loc"]), "message": e["msg"]} for e in exc.errors()]
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": "Validation error", "errors": errors},
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.error("Unhandled exception: %s %s — %s", request.method, request.url.path, exc)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred. Please try again."},
    )


# ── Routers ────────────────────────────────────────────────────────────────────

app.include_router(auth_router)
app.include_router(jobs_router)
app.include_router(upload_router)
app.include_router(candidates_router)
app.include_router(analytics_router)
app.include_router(settings_router)


# ── Health checks ──────────────────────────────────────────────────────────────

@app.get("/", tags=["health"])
def root() -> dict:
    return {
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health", tags=["health"])
def health() -> dict:
    return {"status": "healthy", "version": settings.APP_VERSION}