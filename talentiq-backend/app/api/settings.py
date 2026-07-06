"""
Settings API — /api/settings/*
Get and update user preferences.
"""

import logging
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.user import User
from app.models.settings import UserSettings
from app.schemas.settings import SettingsUpdate, SettingsOut
from app.utils.dependencies import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/settings", tags=["settings"])

DEFAULT_PREFERENCES = {"autoScore": True, "instantAlerts": True, "weeklyDigest": False, "smartShortlists": True}
DEFAULT_NOTIFICATIONS = {"email": True, "inApp": True, "newCandidates": True, "jobAlerts": False}
DEFAULT_APPEARANCE = {"theme": "Midnight", "accent": "Blue", "density": "Balanced"}


def _get_or_create_settings(user: User, db: Session) -> UserSettings:
    """Get or create settings for a user."""
    settings = db.query(UserSettings).filter(UserSettings.user_id == user.id).first()
    if not settings:
        settings = UserSettings(
            user_id=user.id,
            preferences=DEFAULT_PREFERENCES,
            notifications=DEFAULT_NOTIFICATIONS,
            appearance=DEFAULT_APPEARANCE,
        )
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings


@router.get("", response_model=SettingsOut)
def get_settings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> SettingsOut:
    """Get user settings."""
    settings = _get_or_create_settings(current_user, db)

    return SettingsOut(
        profile={
            "name": current_user.name,
            "role": current_user.role,
            "email": current_user.email,
            "company": current_user.company,
        },
        preferences=settings.preferences or DEFAULT_PREFERENCES,
        notifications=settings.notifications or DEFAULT_NOTIFICATIONS,
        appearance=settings.appearance or DEFAULT_APPEARANCE,
        updated_at=settings.updated_at,
    )


@router.put("", response_model=SettingsOut)
def update_settings(
    body: SettingsUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> SettingsOut:
    """Update user settings."""
    settings = _get_or_create_settings(current_user, db)

    if body.profile:
        profile_data = body.profile.model_dump(exclude_none=True)
        if "name" in profile_data:
            current_user.name = profile_data["name"]
        if "role" in profile_data:
            current_user.role = profile_data["role"]
        if "company" in profile_data:
            current_user.company = profile_data["company"]

    if body.preferences:
        current_prefs = dict(settings.preferences or DEFAULT_PREFERENCES)
        current_prefs.update(body.preferences.model_dump(exclude_none=True))
        settings.preferences = current_prefs

    if body.notifications:
        current_notifs = dict(settings.notifications or DEFAULT_NOTIFICATIONS)
        current_notifs.update(body.notifications.model_dump(exclude_none=True))
        settings.notifications = current_notifs

    if body.appearance:
        current_appearance = dict(settings.appearance or DEFAULT_APPEARANCE)
        current_appearance.update(body.appearance.model_dump(exclude_none=True))
        settings.appearance = current_appearance

    db.commit()
    db.refresh(current_user)
    db.refresh(settings)

    logger.info("[settings] Updated settings for: %s", current_user.email)

    return SettingsOut(
        profile={
            "name": current_user.name,
            "role": current_user.role,
            "email": current_user.email,
            "company": current_user.company,
        },
        preferences=settings.preferences,
        notifications=settings.notifications,
        appearance=settings.appearance,
        updated_at=settings.updated_at,
    )
