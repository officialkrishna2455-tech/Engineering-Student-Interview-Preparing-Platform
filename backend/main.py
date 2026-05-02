import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import Base, engine
from routes.user import router as user_router
from routes.resume import router as resume_router
from routes.interview import router as interview_router
from routes.gd import router as gd_router
from routes.offers import router as offers_router

app = FastAPI(
    title="CareerLaunch API",
    description="Backend API for the CareerLaunch career-readiness platform",
    version="1.0.0",
)

# ---------------------------------------------------------------------------
# Auto-create database tables on startup
# Ensures the DB schema exists even without running Alembic manually.
# This is critical for Render where the filesystem is ephemeral (SQLite)
# or when using a fresh PostgreSQL database.
# ---------------------------------------------------------------------------
import models  # noqa: F401 – ensures all models are registered with Base

Base.metadata.create_all(bind=engine)

# ---------------------------------------------------------------------------
# CORS – allow the Next.js frontend to call this API
# Supports multiple origins (comma-separated in FRONTEND_URL env var)
# ---------------------------------------------------------------------------
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")

# Support comma-separated origins for multiple allowed domains
allowed_origins = [origin.strip() for origin in frontend_url.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------
app.include_router(user_router)
app.include_router(resume_router)
app.include_router(interview_router)
app.include_router(gd_router)
app.include_router(offers_router)


@app.get("/", tags=["health"])
def health_check():
    """Simple health-check endpoint."""
    return {"status": "ok", "service": "CareerLaunch API"}
