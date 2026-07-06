"""
Settings schemas.
"""

from datetime import datetime
from pydantic import BaseModel


class ProfileSettings(BaseModel):
    name: str | None = None
    role: str | None = None
    email: str | None = None
    company: str | None = None


class AppearanceSettings(BaseModel):
    theme: str | None = None
    accent: str | None = None
    density: str | None = None


class PreferencesSettings(BaseModel):
    autoScore: bool | None = None
    instantAlerts: bool | None = None
    weeklyDigest: bool | None = None
    smartShortlists: bool | None = None


class NotificationsSettings(BaseModel):
    email: bool | None = None
    inApp: bool | None = None
    newCandidates: bool | None = None
    jobAlerts: bool | None = None


class SettingsUpdate(BaseModel):
    profile: ProfileSettings | None = None
    appearance: AppearanceSettings | None = None
    preferences: PreferencesSettings | None = None
    notifications: NotificationsSettings | None = None


class SettingsOut(BaseModel):
    profile: dict | None = None
    appearance: dict | None = None
    preferences: dict | None = None
    notifications: dict | None = None
    updated_at: datetime | None = None

    model_config = {"from_attributes": True}
