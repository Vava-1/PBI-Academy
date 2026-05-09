"""Exam schemas."""
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import Field

from app.schemas.base import BaseSchema, TimestampSchema, IDSchema
from app.constants import ExamType, ExamSectionType, ResponseType


class ExamSectionSchema(BaseSchema, IDSchema):
    """Exam section schema."""
    section_name: str
    section_type: ExamSectionType
    duration_minutes: int
    max_score: int
    order_index: int
    question_types: dict = {}


class MockExamBase(BaseSchema):
    """Base mock exam schema."""
    name: str = Field(..., min_length=1, max_length=255)
    exam_type: ExamType
    total_duration_minutes: int = Field(..., gt=0)
    total_score: int = 100


class MockExamCreate(MockExamBase):
    """Mock exam creation."""
    exam_structure: dict = {}
    sections: List[dict] = []


class MockExamResponse(MockExamBase, IDSchema):
    """Mock exam response."""
    exam_structure: dict
    is_active: bool
    sections: List[ExamSectionSchema] = []
    
    class Config:
        from_attributes = True


class ExamAttemptBase(BaseSchema):
    """Base exam attempt schema."""
    exam_id: str


class ExamAttemptCreate(ExamAttemptBase):
    """Exam attempt creation."""
    pass


class ExamAttemptResponse(BaseSchema, IDSchema):
    """Exam attempt response."""
    user_id: str
    exam_id: str
    exam_name: str
    exam_type: ExamType
    started_at: datetime
    submitted_at: Optional[datetime] = None
    total_score: Optional[int] = None
    section_scores: dict = {}
    status: str
    session_token: str
    time_remaining_seconds: Optional[int] = None
    
    class Config:
        from_attributes = True


class QuestionResponse(BaseSchema):
    """Question response in an attempt."""
    question_id: str
    response_type: ResponseType
    text_response: Optional[str] = None
    audio_data: Optional[str] = None  # Base64 encoded


class SubmitSectionRequest(BaseSchema):
    """Submit section request."""
    section_id: str
    responses: List[QuestionResponse]
    time_spent_seconds: int


class SubmitExamRequest(BaseSchema):
    """Submit exam request."""
    attempt_id: str
    responses: List[QuestionResponse]


class GradingRequest(BaseSchema):
    """AI grading request."""
    attempt_id: str
    section_id: str
    response_type: ResponseType
    student_response: Optional[str] = None
    audio_url: Optional[str] = None
    exam_type: ExamType


class RubricScore(BaseSchema):
    """Rubric dimension score."""
    dimension: str
    score: int
    max_score: int
    justification: str


class GrammarError(BaseSchema):
    """Grammar error detail."""
    error: str
    type: str
    correction: str


class GradingResponse(BaseSchema):
    """AI grading response."""
    overall_score: int
    max_score: int
    score_breakdown: List[RubricScore]
    cefr_level: str
    estimated_exam_score: Optional[int] = None
    feedback: Dict[str, Any]
    grammar_analysis: Dict[str, Any]
    vocabulary_analysis: Dict[str, Any]
    time_analysis: Dict[str, Any]
    graded_at: datetime
    model_version: str


class ExamResultResponse(BaseSchema, IDSchema):
    """Complete exam result with AI grading."""
    attempt_id: str
    exam_name: str
    exam_type: ExamType
    total_score: int
    section_scores: Dict[str, int]
    graded_responses: List[GradingResponse]
    strengths: List[str]
    weaknesses: List[str]
    improvement_plan: List[str]
    completed_at: datetime
    
    class Config:
        from_attributes = True


class WeakAreaAnalysis(BaseSchema):
    """Weak area analysis for student."""
    section_type: ExamSectionType
    weakness_name: str
    severity: str  # low, medium, high
    current_score: int
    target_score: int
    recommended_drills: List[str]


class ExamReadinessResponse(BaseSchema):
    """Exam readiness assessment."""
    target_exam: ExamType
    predicted_score: int
    confidence_level: str  # low, medium, high
    readiness_percentage: int
    weak_areas: List[WeakAreaAnalysis]
    recommended_study_hours: int
    last_mock_exam_date: Optional[datetime] = None
