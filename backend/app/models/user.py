from pydantic import BaseModel, Field
from typing import Optional


class SignupRequest(BaseModel):
    email: str
    password: str = Field(..., min_length=8)
    username: str = Field(..., min_length=2, max_length=50)


class LoginRequest(BaseModel):
    email: str
    password: str


class UserProfile(BaseModel):
    id: str
    username: str
    avatar_url: Optional[str] = None
    created_at: str


class UpdateProfileRequest(BaseModel):
    username: Optional[str] = Field(default=None, min_length=2, max_length=50)
    avatar_url: Optional[str] = None
