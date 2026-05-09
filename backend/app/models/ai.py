"""AI-related models."""
import uuid
from datetime import datetime, timezone
from typing import Optional, List

from sqlalchemy import String, ForeignKey, Text, DateTime, Numeric, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import JSON

from app.models.base import Base, TimestampMixin, UUIDMixin


class AIAnalytics(UUIDMixin, Base):
    """AI-generated analytics for users."""
    
    __tablename__ = "ai_analytics"
    
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))
    calculated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    
    # Intelligence scores (0-100)
    engagement_score: Mapped[float] = mapped_column(Numeric(5, 2), default=0.0)
    mastery_score: Mapped[float] = mapped_column(Numeric(5, 2), default=0.0)
    momentum_score: Mapped[float] = mapped_column(Numeric(5, 2), default=0.0)
    confidence_score: Mapped[float] = mapped_column(Numeric(5, 2), default=0.0)
    dropout_risk: Mapped[float] = mapped_column(Numeric(5, 2), default=0.0)
    
    skill_breakdown: Mapped[dict] = mapped_column(JSON, default=dict)
    weak_areas: Mapped[dict] = mapped_column(JSON, default=dict)
    recommended_actions: Mapped[dict] = mapped_column(JSON, default=dict)
    
    # Relationships
    user: Mapped["User"] = relationship(back_populates="ai_analytics")
    
    def __repr__(self) -> str:
        return f"<AIAnalytics {self.user_id} - Mastery: {self.mastery_score}>"


class AITutorSession(UUIDMixin, Base):
    """AI tutor conversation session."""
    
    __tablename__ = "ai_tutor_sessions"
    
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))
    
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    ended_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    
    message_history: Mapped[dict] = mapped_column(JSON, default=dict)
    context_type: Mapped[str] = mapped_column(String(50), default="general")
    context_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), nullable=True)
    
    # Relationships
    user: Mapped["User"] = relationship(back_populates="tutor_sessions")
    
    def __repr__(self) -> str:
        return f"<AITutorSession {self.user_id}>"


class Quiz(UUIDMixin, Base):
    """Adaptive quiz model."""
    
    __tablename__ = "quizzes"
    
    module_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), 
        ForeignKey("modules.id"), 
        nullable=True
    )
    title: Mapped[str] = mapped_column(String(255))
    adaptive_level: Mapped[str] = mapped_column(String(50), default="dynamic")
    time_limit_minutes: Mapped[int] = mapped_column(Integer, default=30)
    question_pool: Mapped[dict] = mapped_column(JSON, default=dict)
    
    def __repr__(self) -> str:
        return f"<Quiz {self.title}>"


class QuizAttempt(UUIDMixin, Base):
    """Quiz attempt by user."""
    
    __tablename__ = "quiz_attempts"
    
    quiz_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("quizzes.id"))
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))
    
    responses: Mapped[dict] = mapped_column(JSON, default=dict)
    score: Mapped[int] = mapped_column(Integer)
    taken_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    time_taken_seconds: Mapped[int] = mapped_column(Integer)
    
    def __repr__(self) -> str:
        return f"<QuizAttempt {self.user_id} - Score: {self.score}>"
