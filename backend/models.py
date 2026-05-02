import uuid
from datetime import date, datetime

from sqlalchemy import Boolean, Date, DateTime, Float, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from database import Base


class User(Base):
    """User model representing an authenticated CareerLaunch user."""

    __tablename__ = "users"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    email: Mapped[str] = mapped_column(
        String(255), unique=True, index=True, nullable=False
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    avatar_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    is_pro: Mapped[bool] = mapped_column(Boolean, default=False)
    resume_visited: Mapped[bool] = mapped_column(Boolean, default=False)
    interview_visited: Mapped[bool] = mapped_column(Boolean, default=False)
    aptitude_accuracy: Mapped[float] = mapped_column(Float, default=0.0)
    streak_days: Mapped[int] = mapped_column(Integer, default=0)
    last_active_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    readiness_score: Mapped[float] = mapped_column(Float, default=0.0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow
    )

    def __repr__(self) -> str:
        return f"<User {self.email}>"


class InterviewSession(Base):
    """Model for storing completed AI mock interview sessions."""

    __tablename__ = "interview_sessions"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    user_email: Mapped[str] = mapped_column(
        String(255), index=True, nullable=False
    )
    interview_type: Mapped[str] = mapped_column(String(50), nullable=False)
    company_type: Mapped[str] = mapped_column(String(100), nullable=False)
    score: Mapped[int] = mapped_column(Integer, default=0)
    strengths: Mapped[str | None] = mapped_column(String(2000), nullable=True)
    weaknesses: Mapped[str | None] = mapped_column(String(2000), nullable=True)
    topics_to_revise: Mapped[str | None] = mapped_column(
        String(2000), nullable=True
    )
    date: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow
    )

    def __repr__(self) -> str:
        return f"<InterviewSession {self.user_email} - {self.score}>"
