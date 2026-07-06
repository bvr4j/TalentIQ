"""
Auth schemas — registration, login, tokens.
"""

from pydantic import BaseModel, EmailStr, field_validator
import re


class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    company: str | None = None

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Name cannot be empty")
        return v.strip()


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: "UserOut"


class RefreshRequest(BaseModel):
    refresh_token: str


class UserOut(BaseModel):
    id: str
    name: str
    email: str
    company: str | None
    role: str

    model_config = {"from_attributes": True}


class MessageResponse(BaseModel):
    message: str
