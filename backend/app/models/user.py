"""User model and related models."""
import uuid
from datetime import datetime, timezone
from typing import Optional, List

from sqlalchemy import String, ForeignKey, Enum, Text, Boolean, DateTime, Integer, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import JSON

from app.models.base import Base, TimestampMixin, UUIDMixin
from app.constants import UserRole, ExamType, ProficiencyLevel


class User(UUIDMixin, TimestampMixin, Base):
    """User model for students, instructors, and admins."""
    
    __tablename__ = "users"
    
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    first_name: Mapped[str] = mapped_column(String(100))
    last_name: Mapped[str] = mapped_column(String(100))
    avatar_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    
    role: Mapped[UserRole] = mapped_column(Enum(UserRole), default=UserRole.STUDENT)
    target_exam: Mapped[Optional[ExamType]] = mapped_column(Enum(ExamType), nullable=True)
    proficiency_level: Mapped[ProficiencyLevel] = mapped_column(
        Enum(ProficiencyLevel), default=ProficiencyLevel.BEGINNER
    )
    
    referral_code: Mapped[str] = mapped_column(String(20), unique=True, index=True)
    referred_by: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=True
    )
    
    last_active: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    preferences: Mapped[dict] = mapped_column(JSON, default=dict)
    
    # Relationships
    enrollments: Mapped[List["Enrollment"]] = relationship(back_populates="user")
    exam_attempts: Mapped[List["MockExamAttempt"]] = relationship(back_populates="user")
    ai_analytics: Mapped[List["AIAnalytics"]] = relationship(back_populates="user")
    gamification: Mapped[Optional["GamificationMetrics"]] = relationship(back_populates="user")
    subscriptions: Mapped[List["Subscription"]] = relationship(back_populates="user")
    tutor_sessions: Mapped[List["AITutorSession"]] = relationship(back_populates="user")
    
    referrals_made: Mapped[List["Referral"]] = relationship(
        foreign_keys="Referral.referrer_id",
        back_populates="referrer"
    )
    
    def __repr__(self) -> str:
        return f"<User {self.email} ({self.role.value})>"


class Referral(UUIDMixin, Base):
    """Referral tracking model."""
    
    __tablename__ = "referrals"
    
    referrer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id")
    )
    referred_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id")
    )
    referral_code: Mapped[str] = mapped_column(String(20))
    
    converted_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    commission_earned: Mapped[float] = mapped_column(default=0.0)
    status: Mapped[str] = mapped_column(String(20), default="pending")
    
    # Relationships
    referrer: Mapped["User"] = relationship(foreign_keys=[referrer_id])
    referred: Mapped["User"] = relationship(foreign_keys=[referred_id])
    
    def __repr__(self) -> str:
        return f"<Referral {self.referral_code}>"
