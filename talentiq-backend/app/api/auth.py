"""
Auth API — /api/auth/*
Handles registration, login, logout, token refresh, and current user.
"""

import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.user import User
from app.models.settings import UserSettings
from app.schemas.auth import UserRegister, UserLogin, TokenResponse, UserOut, MessageResponse, RefreshRequest
from app.services.auth_service import (
    hash_password, verify_password,
    create_access_token, create_refresh_token,
    get_user_id_from_token,
)
from app.utils.dependencies import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(body: UserRegister, db: Session = Depends(get_db)) -> TokenResponse:
    """Create a new recruiter account."""
    # Check if email already exists
    existing = db.query(User).filter(User.email == body.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    user = User(
        name=body.name,
        email=body.email,
        hashed_password=hash_password(body.password),
        company=body.company,
    )
    db.add(user)
    db.flush()  # Get user.id before commit

    # Create default settings
    settings_row = UserSettings(
        user_id=user.id,
        preferences={"autoScore": True, "instantAlerts": True, "weeklyDigest": False, "smartShortlists": True},
        notifications={"email": True, "inApp": True, "newCandidates": True, "jobAlerts": False},
        appearance={"theme": "Midnight", "accent": "Blue", "density": "Balanced"},
    )
    db.add(settings_row)
    db.commit()
    db.refresh(user)

    logger.info("[auth] New user registered: %s", user.email)

    return TokenResponse(
        access_token=create_access_token(user.id),
        refresh_token=create_refresh_token(user.id),
        user=UserOut.model_validate(user),
    )


@router.post("/login", response_model=TokenResponse)
def login(body: UserLogin, db: Session = Depends(get_db)) -> TokenResponse:
    """Authenticate and return JWT tokens."""
    user = db.query(User).filter(User.email == body.email, User.is_active == True).first()  # noqa: E712

    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    logger.info("[auth] User logged in: %s", user.email)

    return TokenResponse(
        access_token=create_access_token(user.id),
        refresh_token=create_refresh_token(user.id),
        user=UserOut.model_validate(user),
    )


@router.post("/refresh", response_model=TokenResponse)
def refresh_token(body: RefreshRequest, db: Session = Depends(get_db)) -> TokenResponse:
    """Issue a new access token using a valid refresh token."""
    try:
        user_id = get_user_id_from_token(body.refresh_token)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid refresh token: {exc}",
        ) from exc

    user = db.query(User).filter(User.id == user_id, User.is_active == True).first()  # noqa: E712
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    return TokenResponse(
        access_token=create_access_token(user.id),
        refresh_token=create_refresh_token(user.id),
        user=UserOut.model_validate(user),
    )


@router.post("/logout", response_model=MessageResponse)
def logout(current_user: User = Depends(get_current_user)) -> MessageResponse:
    """Logout — client should discard the token."""
    logger.info("[auth] User logged out: %s", current_user.email)
    return MessageResponse(message="Logged out successfully.")


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)) -> UserOut:
    """Get the currently authenticated user's profile."""
    return UserOut.model_validate(current_user)
