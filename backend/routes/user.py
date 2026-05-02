from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models import User
from schemas import ActivityUpdate, UserCreate, UserResponse

router = APIRouter(prefix="/api/user", tags=["users"])


def _recalculate_readiness(user: User) -> float:
    """Compute readiness score from individual activity flags."""
    score = 0.0
    if user.resume_visited:
        score += 30
    if user.interview_visited:
        score += 30
    if user.aptitude_accuracy > 0:
        score += 20
    if user.streak_days > 0:
        score += 20
    return score


@router.get("/{email}", response_model=UserResponse)
def get_user(email: str, db: Session = Depends(get_db)):
    """Retrieve a user by their email address."""
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with email '{email}' not found",
        )
    return user


@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(payload: UserCreate, db: Session = Depends(get_db)):
    """Create a new user. If the email already exists, return the existing user."""
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        return existing

    new_user = User(
        email=payload.email,
        name=payload.name,
        avatar_url=payload.avatar_url,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@router.patch("/activity", response_model=UserResponse)
def update_activity(payload: ActivityUpdate, db: Session = Depends(get_db)):
    """Update a user's activity flags, streak, and readiness score."""
    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with email '{payload.email}' not found",
        )

    # --- Update the relevant activity field ---
    if payload.action == "resume_visited":
        user.resume_visited = True
    elif payload.action == "interview_visited":
        user.interview_visited = True
    elif payload.action == "aptitude_score":
        if payload.value is not None:
            user.aptitude_accuracy = payload.value

    # --- Streak logic ---
    today = date.today()
    if user.last_active_date != today:
        if user.last_active_date and (today - user.last_active_date).days == 1:
            # Consecutive day — extend streak
            user.streak_days += 1
        elif user.last_active_date and (today - user.last_active_date).days > 1:
            # Streak broken — reset to 1
            user.streak_days = 1
        else:
            # First ever activity
            user.streak_days = 1
        user.last_active_date = today

    # --- Recalculate readiness score ---
    user.readiness_score = _recalculate_readiness(user)

    db.commit()
    db.refresh(user)
    return user
