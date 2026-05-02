from datetime import date, datetime
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, EmailStr


class UserCreate(BaseModel):
    """Schema for creating a new user."""
    email: str
    name: str
    avatar_url: Optional[str] = None


class UserResponse(BaseModel):
    """Schema for returning user data."""
    model_config = ConfigDict(from_attributes=True)

    id: str
    email: str
    name: str
    avatar_url: Optional[str] = None
    is_pro: bool = False
    resume_visited: bool = False
    interview_visited: bool = False
    aptitude_accuracy: float = 0.0
    streak_days: int = 0
    last_active_date: Optional[date] = None
    readiness_score: float = 0.0
    created_at: datetime


class ActivityUpdate(BaseModel):
    """Schema for updating user activity (readiness tracking)."""
    email: str
    action: Literal["resume_visited", "interview_visited", "aptitude_score"]
    value: Optional[float] = None
