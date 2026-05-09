"""Pydantic schemas for API validation."""
from app.schemas.base import BaseSchema, PaginationParams, PaginatedResponse
from app.schemas.user import UserCreate, UserResponse, UserUpdate, TokenResponse
from app.schemas.course import CourseCreate, CourseResponse, CourseUpdate
from app.schemas.exam import (
    MockExamCreate, MockExamResponse, 
    ExamAttemptCreate, ExamAttemptResponse,
    GradingRequest, GradingResponse
)
from app.schemas.ai import (
    AnalyticsResponse, TutorMessage, TutorResponse,
    QuizRequest, QuizResponse
)
from app.schemas.gamification import (
    GamificationResponse, LeaderboardEntry, AchievementResponse
)

__all__ = [
    "BaseSchema",
    "PaginationParams", 
    "PaginatedResponse",
    "UserCreate",
    "UserResponse",
    "UserUpdate",
    "TokenResponse",
    "CourseCreate",
    "CourseResponse",
    "CourseUpdate",
    "MockExamCreate",
    "MockExamResponse",
    "ExamAttemptCreate",
    "ExamAttemptResponse",
    "GradingRequest",
    "GradingResponse",
    "AnalyticsResponse",
    "TutorMessage",
    "TutorResponse",
    "QuizRequest",
    "QuizResponse",
    "GamificationResponse",
    "LeaderboardEntry",
    "AchievementResponse"
]
