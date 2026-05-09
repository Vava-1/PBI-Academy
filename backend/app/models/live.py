"""Live session models."""
import uuid
from datetime import datetime, timezone
from typing import Optional, List

from sqlalchemy import String, ForeignKey, Enum, Text, DateTime, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.models.base import Base, TimestampMixin, UUIDMixin
from app.constants import LiveSessionType, LiveSessionStatus


class LiveSession(UUIDMixin, TimestampMixin, Base):
    """Live session model."""
    
    __tablename__ = "live_sessions"
    
    course_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), 
        ForeignKey("courses.id"),
        nullable=True
    )
    
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    session_type: Mapped[LiveSessionType] = mapped_column(Enum(LiveSessionType))
    scheduled_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    duration_minutes: Mapped[int] = mapped_column(Integer)
    
    meeting_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    max_participants: Mapped[int] = mapped_column(Integer, default=50)
    status: Mapped[LiveSessionStatus] = mapped_column(Enum(LiveSessionStatus), default=LiveSessionStatus.UPCOMING)
    
    # Relationships
    attendance: Mapped[List["LiveAttendance"]] = relationship(back_populates="session")
    
    def __repr__(self) -> str:
        return f"<LiveSession {self.title}>"


class LiveAttendance(UUIDMixin, Base):
    """Live session attendance tracking."""
    
    __tablename__ = "live_attendance"
    
    session_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("live_sessions.id"))
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))
    
    joined_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    left_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    participation_level: Mapped[str] = mapped_column(String(50), default="viewer")
    
    # Relationships
    session: Mapped["LiveSession"] = relationship(back_populates="attendance")
    
    def __repr__(self) -> str:
        return f"<LiveAttendance {self.session_id} - {self.user_id}>"
