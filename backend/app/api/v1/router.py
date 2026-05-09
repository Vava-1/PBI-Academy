"""Main API router."""
from fastapi import APIRouter

from app.api.v1.endpoints import auth, users, courses, mock_exams, gamification, subscriptions, live_sessions, messages
from app.api.v1.ai import router as ai_router

api_router = APIRouter()

# Core endpoints
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(courses.router, prefix="/courses", tags=["Courses"])
api_router.include_router(mock_exams.router, prefix="/exams", tags=["Mock Exams"])
api_router.include_router(gamification.router, prefix="/gamification", tags=["Gamification"])
api_router.include_router(subscriptions.router, prefix="/subscriptions", tags=["Subscriptions"])
api_router.include_router(live_sessions.router, prefix="/live", tags=["Live Sessions"])
api_router.include_router(messages.router, prefix="/messages", tags=["Messages"])

# AI endpoints
api_router.include_router(ai_router, prefix="/ai", tags=["AI Services"])
