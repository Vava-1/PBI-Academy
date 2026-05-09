"""Application constants and enums."""
from enum import Enum
from typing import Dict, Any


class UserRole(str, Enum):
    STUDENT = "student"
    INSTRUCTOR = "instructor"
    ADMIN = "admin"


class CourseCategory(str, Enum):
    LANGUAGE = "language"
    TECH = "tech"
    AI = "ai"
    EXAM_PREP = "exam_prep"


class Language(str, Enum):
    ENGLISH = "english"
    FRENCH = "french"
    GERMAN = "german"
    SWAHILI = "swahili"


class ExamType(str, Enum):
    DUOLINGO = "duolingo"
    TOEFL = "toefl"
    IELTS = "ielts"
    TCF = "tcf"
    TCF_CANADA = "tcf_canada"
    TCF_QUEBEC = "tcf_quebec"
    DELF = "delf"
    DALF = "dalf"
    TEF_CANADA = "tef_canada"
    GOETHE = "goethe"
    TESTDAF = "testdaf"


class ProficiencyLevel(str, Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"


class EnrollmentStatus(str, Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    PAUSED = "paused"


class ExamSectionType(str, Enum):
    READING = "reading"
    LISTENING = "listening"
    SPEAKING = "speaking"
    WRITING = "writing"


class ResponseType(str, Enum):
    ESSAY = "essay"
    SPEAKING_AUDIO = "speaking_audio"
    WRITING_TEXT = "writing_text"


class SubscriptionPlan(str, Enum):
    FREE = "free"
    PRO = "pro"
    PREMIUM = "premium"
    STARTER_PROFESSIONAL = "starter_professional"
    ENTERPRISE = "enterprise"


class AchievementType(str, Enum):
    STREAK = "streak"
    MILESTONE = "milestone"
    SKILL = "skill"
    SOCIAL = "social"


class RewardType(str, Enum):
    DISCOUNT = "discount"
    PREMIUM_TOKENS = "premium_tokens"
    MERCHANDISE = "merchandise"


class LiveSessionType(str, Enum):
    SPEAKING_PRACTICE = "speaking_practice"
    QA = "qa"
    WORKSHOP = "workshop"


class LiveSessionStatus(str, Enum):
    UPCOMING = "upcoming"
    LIVE = "live"
    ENDED = "ended"


# Gamification Constants
STREAK_POINTS = {
    1: 10,
    7: 50,
    30: 200,
    90: 500,
    180: 1000,
    365: 2500
}

ACTIVITY_POINTS = {
    "video_watch_minute": 2,
    "quiz_completed": 20,
    "exam_completed": 100,
    "daily_login": 5,
    "streak_maintained": 15,
    "assignment_submitted": 30,
    "live_session_attended": 25
}

# Exam Configuration
EXAM_CONFIG: Dict[ExamType, Dict[str, Any]] = {
    ExamType.DUOLINGO: {
        "total_duration_minutes": 60,
        "adaptive": True,
        "sections": [
            {"type": "reading", "name": "Literacy & Comprehension"},
            {"type": "listening", "name": "Conversation & Listening"},
            {"type": "speaking", "name": "Production & Speaking"},
            {"type": "writing", "name": "Production & Writing"}
        ]
    },
    ExamType.TOEFL: {
        "total_duration_minutes": 120,
        "adaptive": False,
        "sections": [
            {"type": "reading", "name": "Reading", "duration": 35},
            {"type": "listening", "name": "Listening", "duration": 36},
            {"type": "speaking", "name": "Speaking", "duration": 16},
            {"type": "writing", "name": "Writing", "duration": 29}
        ]
    },
    ExamType.IELTS: {
        "total_duration_minutes": 170,
        "adaptive": False,
        "sections": [
            {"type": "listening", "name": "Listening", "duration": 30},
            {"type": "reading", "name": "Reading", "duration": 60},
            {"type": "writing", "name": "Writing", "duration": 60},
            {"type": "speaking", "name": "Speaking", "duration": 14}
        ]
    },
    ExamType.TCF: {
        "total_duration_minutes": 90,
        "adaptive": False,
        "sections": [
            {"type": "listening", "name": "Compréhension Orale", "duration": 25},
            {"type": "reading", "name": "Compréhension Écrite", "duration": 45},
            {"type": "speaking", "name": "Expression Orale", "duration": 12},
            {"type": "writing", "name": "Expression Écrite", "duration": 60}
        ]
    },
    ExamType.TCF_CANADA: {
        "total_duration_minutes": 120,
        "adaptive": False,
        "sections": [
            {"type": "listening", "name": "Compréhension Orale", "duration": 30},
            {"type": "reading", "name": "Compréhension Écrite", "duration": 60},
            {"type": "speaking", "name": "Expression Orale", "duration": 15},
            {"type": "writing", "name": "Expression Écrite", "duration": 60}
        ]
    },
    ExamType.TCF_QUEBEC: {
        "total_duration_minutes": 110,
        "adaptive": False,
        "sections": [
            {"type": "listening", "name": "Compréhension Orale", "duration": 30},
            {"type": "reading", "name": "Compréhension Écrite", "duration": 60},
            {"type": "speaking", "name": "Expression Orale", "duration": 15},
            {"type": "writing", "name": "Expression Écrite", "duration": 45}
        ]
    },
    ExamType.DELF: {
        "total_duration_minutes": 100,
        "adaptive": False,
        "sections": [
            {"type": "listening", "name": "Compréhension de l'oral", "duration": 25},
            {"type": "reading", "name": "Compréhension des écrits", "duration": 50},
            {"type": "writing", "name": "Production écrite", "duration": 60},
            {"type": "speaking", "name": "Production orale", "duration": 15}
        ]
    },
    ExamType.DALF: {
        "total_duration_minutes": 120,
        "adaptive": False,
        "sections": [
            {"type": "listening", "name": "Compréhension de l'oral", "duration": 30},
            {"type": "reading", "name": "Compréhension des écrits", "duration": 50},
            {"type": "writing", "name": "Production écrite", "duration": 150},
            {"type": "speaking", "name": "Production orale", "duration": 30}
        ]
    },
    ExamType.TEF_CANADA: {
        "total_duration_minutes": 155,
        "adaptive": False,
        "sections": [
            {"type": "reading", "name": "Compréhension écrite", "duration": 60},
            {"type": "listening", "name": "Compréhension orale", "duration": 40},
            {"type": "speaking", "name": "Expression orale", "duration": 15},
            {"type": "writing", "name": "Expression écrite", "duration": 60}
        ]
    },
    ExamType.GOETHE: {
        "total_duration_minutes": 110,
        "adaptive": False,
        "sections": [
            {"type": "reading", "name": "Lesen", "duration": 65},
            {"type": "listening", "name": "Hören", "duration": 30},
            {"type": "writing", "name": "Schreiben", "duration": 60},
            {"type": "speaking", "name": "Sprechen", "duration": 15}
        ]
    },
    ExamType.TESTDAF: {
        "total_duration_minutes": 190,
        "adaptive": False,
        "sections": [
            {"type": "reading", "name": "Leseverstehen", "duration": 60},
            {"type": "listening", "name": "Hörverstehen", "duration": 40},
            {"type": "writing", "name": "Schriftlicher Ausdruck", "duration": 60},
            {"type": "speaking", "name": "Mündlicher Ausdruck", "duration": 30}
        ]
    }
}

# AI Rate Limits
AI_RATE_LIMITS = {
    SubscriptionPlan.FREE: {"requests_per_minute": 5, "requests_per_day": 20},
    SubscriptionPlan.PRO: {"requests_per_minute": 20, "requests_per_day": 200},
    SubscriptionPlan.PREMIUM: {"requests_per_minute": 60, "requests_per_day": 1000}
}

# CEFR Levels
CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"]

# Subscription Features
SUBSCRIPTION_FEATURES = {
    SubscriptionPlan.FREE: {
        "ai_evaluations_per_month": 5,
        "offline_access": False,
        "mentoring_sessions": 0,
        "certificates": False,
        "priority_support": False
    },
    SubscriptionPlan.PRO: {
        "ai_evaluations_per_month": 50,
        "offline_access": True,
        "mentoring_sessions": 1,
        "certificates": True,
        "priority_support": False
    },
    SubscriptionPlan.PREMIUM: {
        "ai_evaluations_per_month": 999999,  # Unlimited
        "offline_access": True,
        "mentoring_sessions": 4,
        "certificates": True,
        "priority_support": True
    }
}
