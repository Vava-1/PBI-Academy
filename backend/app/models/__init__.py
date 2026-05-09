"""Database models for PBI application."""
from app.models.base import Base
from app.models.user import User, Referral
from app.models.course import Course, Module, Lesson, Enrollment, Assignment
from app.models.mock_exam import MockExam, ExamSection, MockExamAttempt, AIGradedResponse, AIFeedback
from app.models.ai import AIAnalytics, AITutorSession, Quiz, QuizAttempt
from app.models.gamification import GamificationMetrics, Achievement, UserAchievement, Reward, RewardsRedemption
from app.models.subscription import Subscription
from app.models.live import LiveSession, LiveAttendance
from app.models.message import Message, MessageThread, NotificationPreference

__all__ = [
    "Base",
    "User",
    "Referral",
    "Course",
    "Module",
    "Lesson",
    "Enrollment",
    "Assignment",
    "MockExam",
    "ExamSection",
    "MockExamAttempt",
    "AIGradedResponse",
    "AIFeedback",
    "AIAnalytics",
    "AITutorSession",
    "Quiz",
    "QuizAttempt",
    "GamificationMetrics",
    "Achievement",
    "UserAchievement",
    "Reward",
    "RewardsRedemption",
    "Subscription",
    "LiveSession",
    "LiveAttendance",
    "Message",
    "MessageThread",
    "NotificationPreference"
]
