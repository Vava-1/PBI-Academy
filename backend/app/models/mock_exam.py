"""Mock exam models."""
import uuid
from datetime import datetime, timezone
from typing import Optional, List

from sqlalchemy import String, ForeignKey, Enum, Text, DateTime, Integer, Boolean, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import JSON

from app.models.base import Base, TimestampMixin, UUIDMixin
from app.constants import ExamType, ExamSectionType, ResponseType


class MockExam(UUIDMixin, Base):
    """Mock exam definition."""
    
    __tablename__ = "mock_exams"
    
    name: Mapped[str] = mapped_column(String(255))
    exam_type: Mapped[ExamType] = mapped_column(Enum(ExamType))
    total_duration_minutes: Mapped[int] = mapped_column(Integer)
    total_score: Mapped[int] = mapped_column(Integer, default=100)
    exam_structure: Mapped[dict] = mapped_column(JSON, default=dict)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    
    # Relationships
    sections: Mapped[List["ExamSection"]] = relationship(back_populates="exam")
    attempts: Mapped[List["MockExamAttempt"]] = relationship(back_populates="exam")
    
    def __repr__(self) -> str:
        return f"<MockExam {self.name} ({self.exam_type.value})>"


class ExamSection(UUIDMixin, Base):
    """Exam section within a mock exam."""
    
    __tablename__ = "exam_sections"
    
    exam_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("mock_exams.id"))
    section_name: Mapped[str] = mapped_column(String(255))
    section_type: Mapped[ExamSectionType] = mapped_column(Enum(ExamSectionType))
    duration_minutes: Mapped[int] = mapped_column(Integer)
    max_score: Mapped[int] = mapped_column(Integer)
    order_index: Mapped[int] = mapped_column(Integer, default=0)
    question_types: Mapped[dict] = mapped_column(JSON, default=dict)
    
    # Relationships
    exam: Mapped["MockExam"] = relationship(back_populates="sections")
    graded_responses: Mapped[List["AIGradedResponse"]] = relationship(back_populates="section")
    
    def __repr__(self) -> str:
        return f"<ExamSection {self.section_name}>"


class MockExamAttempt(UUIDMixin, Base):
    """User attempt at a mock exam."""
    
    __tablename__ = "mock_exam_attempts"
    
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))
    exam_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("mock_exams.id"))
    
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    submitted_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    
    total_score: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    section_scores: Mapped[dict] = mapped_column(JSON, default=dict)
    time_tracking: Mapped[dict] = mapped_column(JSON, default=dict)
    
    status: Mapped[str] = mapped_column(String(50), default="in_progress")
    session_token: Mapped[str] = mapped_column(String(255), unique=True)
    
    # Relationships
    user: Mapped["User"] = relationship(back_populates="exam_attempts")
    exam: Mapped["MockExam"] = relationship(back_populates="attempts")
    graded_responses: Mapped[List["AIGradedResponse"]] = relationship(back_populates="attempt")
    
    def __repr__(self) -> str:
        return f"<MockExamAttempt {self.user_id} - {self.exam_id}>"


class AIGradedResponse(UUIDMixin, Base):
    """AI-graded student response."""
    
    __tablename__ = "ai_graded_responses"
    
    attempt_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("mock_exam_attempts.id"))
    section_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("exam_sections.id"))
    
    response_type: Mapped[ResponseType] = mapped_column(Enum(ResponseType))
    student_response: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    audio_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    
    ai_score: Mapped[int] = mapped_column(Integer)
    rubric_breakdown: Mapped[dict] = mapped_column(JSON, default=dict)
    graded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    model_version: Mapped[str] = mapped_column(String(50), default="1.0")
    
    # Relationships
    attempt: Mapped["MockExamAttempt"] = relationship(back_populates="graded_responses")
    section: Mapped["ExamSection"] = relationship(back_populates="graded_responses")
    feedback: Mapped[Optional["AIFeedback"]] = relationship(back_populates="graded_response")
    
    def __repr__(self) -> str:
        return f"<AIGradedResponse {self.attempt_id} - Score: {self.ai_score}>"


class AIFeedback(UUIDMixin, Base):
    """Detailed AI feedback for graded responses."""
    
    __tablename__ = "ai_feedback"
    
    graded_response_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), 
        ForeignKey("ai_graded_responses.id"),
        unique=True
    )
    
    detailed_feedback: Mapped[str] = mapped_column(Text)
    improvement_suggestions: Mapped[dict] = mapped_column(JSON, default=dict)
    grammar_corrections: Mapped[dict] = mapped_column(JSON, default=dict)
    vocabulary_assessment: Mapped[dict] = mapped_column(JSON, default=dict)
    coherence_analysis: Mapped[dict] = mapped_column(JSON, default=dict)
    
    # Relationships
    graded_response: Mapped["AIGradedResponse"] = relationship(back_populates="feedback")
    
    def __repr__(self) -> str:
        return f"<AIFeedback {self.graded_response_id}>"
