"""AI-related schemas."""
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import Field

from app.schemas.base import BaseSchema, TimestampSchema, IDSchema


class IntelligenceScores(BaseSchema):
    """AI intelligence scores."""
    engagement_score: float = Field(..., ge=0, le=100)
    mastery_score: float = Field(..., ge=0, le=100)
    momentum_score: float = Field(..., ge=0, le=100)
    confidence_score: float = Field(..., ge=0, le=100)
    dropout_risk: float = Field(..., ge=0, le=100)


class AnalyticsResponse(IntelligenceScores, BaseSchema, IDSchema):
    """AI analytics response."""
    user_id: str
    calculated_at: datetime
    skill_breakdown: Dict[str, float]
    weak_areas: List[str]
    recommended_actions: List[str]
    
    class Config:
        from_attributes = True


class TutorMessage(BaseSchema):
    """Tutor chat message."""
    role: str = Field(..., pattern="^(user|assistant|system)$")
    content: str
    timestamp: Optional[datetime] = None


class TutorRequest(BaseSchema):
    """Tutor chat request."""
    message: str
    session_id: Optional[str] = None
    context_type: str = "general"
    context_id: Optional[str] = None


class TutorResponse(BaseSchema):
    """Tutor chat response."""
    session_id: str
    message: str
    suggested_questions: List[str] = []
    context_references: List[Dict[str, Any]] = []
    streaming: bool = False


class TutorSessionResponse(BaseSchema, IDSchema):
    """Tutor session response."""
    user_id: str
    started_at: datetime
    ended_at: Optional[datetime] = None
    message_count: int = 0
    context_type: str


class QuizQuestion(BaseSchema):
    """Quiz question."""
    id: str
    question_type: str
    question_text: str
    options: Optional[List[str]] = None
    correct_answer: Optional[str] = None
    difficulty: str
    explanation: Optional[str] = None


class QuizRequest(BaseSchema):
    """Adaptive quiz request."""
    course_id: Optional[str] = None
    module_id: Optional[str] = None
    topic: Optional[str] = None
    difficulty: str = "adaptive"
    num_questions: int = Field(default=10, ge=5, le=50)
    focus_areas: List[str] = []


class QuizResponse(BaseSchema, IDSchema):
    """Quiz response."""
    title: str
    questions: List[QuizQuestion]
    time_limit_minutes: int
    total_points: int
    adaptive_level: str


class QuizAnswer(BaseSchema):
    """Quiz answer submission."""
    question_id: str
    answer: str
    time_spent_seconds: int


class QuizSubmission(BaseSchema):
    """Quiz submission."""
    quiz_id: str
    answers: List[QuizAnswer]


class QuizResult(BaseSchema, IDSchema):
    """Quiz result."""
    quiz_id: str
    score: int
    max_score: int
    percentage: float
    correct_answers: int
    total_questions: int
    time_taken_seconds: int
    weak_topics: List[str]
    recommended_review: List[str]
    completed_at: datetime


class SkillAssessment(BaseSchema):
    """Skill assessment schema."""
    skill_name: str
    current_level: float  # 0-100
    peer_average: float  # 0-100
    improvement_rate: float  # per week


class RadarChartData(BaseSchema):
    """Radar chart data for skill visualization."""
    labels: List[str]
    user_data: List[float]
    peer_average_data: List[float]
    max_value: float = 100.0


class WeeklyProgress(BaseSchema):
    """Weekly progress data."""
    week_start: datetime
    study_hours: float
    lessons_completed: int
    quizzes_taken: int
    school_average_hours: float


class ProgressChartData(BaseSchema):
    """Progress chart data."""
    weeks: List[str]
    user_hours: List[float]
    school_average_hours: List[float]
    completion_rate: List[float]


class ExamPrediction(BaseSchema):
    """Exam score prediction."""
    predicted_score: int
    confidence_interval: tuple  # (min, max)
    based_on_attempts: int
    trend_direction: str  # improving, stable, declining
