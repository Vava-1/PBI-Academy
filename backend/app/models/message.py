"""Message and inbox models for performance analysis and communication."""
import uuid
from datetime import datetime, timezone
from typing import Optional, List

from sqlalchemy import String, ForeignKey, Enum, Text, DateTime, Boolean, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.models.base import Base, TimestampMixin, UUIDMixin


class MessageType(str, Enum):
    PERFORMANCE_ANALYSIS = "performance_analysis"
    AI_INSIGHT = "ai_insight"
    TEACHER_MESSAGE = "teacher_message"
    SYSTEM_NOTIFICATION = "system_notification"
    REMINDER = "reminder"
    ACHIEVEMENT = "achievement"


class MessageStatus(str, Enum):
    UNREAD = "unread"
    READ = "read"
    ARCHIVED = "archived"


class Message(UUIDMixin, TimestampMixin, Base):
    """Message model for inbox system."""
    
    __tablename__ = "messages"
    
    recipient_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))
    sender_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=True
    )
    
    message_type: Mapped[MessageType] = mapped_column(Enum(MessageType))
    status: Mapped[MessageStatus] = mapped_column(Enum(MessageStatus), default=MessageStatus.UNREAD)
    
    subject: Mapped[str] = mapped_column(String(255))
    body: Mapped[str] = mapped_column(Text)
    
    # For performance analysis messages
    performance_data: Mapped[dict] = mapped_column(JSON, default=dict)
    analytics_summary: Mapped[dict] = mapped_column(JSON, default=dict)
    recommendations: Mapped[List[str]] = mapped_column(JSON, default=list)
    
    # For AI-generated messages
    is_ai_generated: Mapped[bool] = mapped_column(Boolean, default=False)
    ai_confidence: Mapped[Optional[float]] = mapped_column(nullable=True)
    
    # Priority and scheduling
    priority: Mapped[str] = mapped_column(String(20), default="normal")
    scheduled_for: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    sent_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    recipient: Mapped["User"] = relationship(foreign_keys=[recipient_id])
    sender: Mapped[Optional["User"]] = relationship(foreign_keys=[sender_id])
    
    def __repr__(self) -> str:
        return f"<Message {self.subject} to {self.recipient_id}>"


class MessageThread(UUIDMixin, TimestampMixin, Base):
    """Message thread for conversations."""
    
    __tablename__ = "message_threads"
    
    participant_ids: Mapped[List[uuid.UUID]] = mapped_column(JSON)
    subject: Mapped[str] = mapped_column(String(255))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    last_message_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    messages: Mapped[List["Message"]] = relationship(back_populates="thread")
    
    def __repr__(self) -> str:
        return f"<MessageThread {self.subject}>"


class NotificationPreference(UUIDMixin, Base):
    """User notification preferences."""
    
    __tablename__ = "notification_preferences"
    
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True)
    
    email_performance_analysis: Mapped[bool] = mapped_column(Boolean, default=True)
    email_ai_insights: Mapped[bool] = mapped_column(Boolean, default=True)
    email_teacher_messages: Mapped[bool] = mapped_column(Boolean, default=True)
    email_achievements: Mapped[bool] = mapped_column(Boolean, default=True)
    
    push_performance_analysis: Mapped[bool] = mapped_column(Boolean, default=True)
    push_ai_insights: Mapped[bool] = mapped_column(Boolean, default=True)
    push_teacher_messages: Mapped[bool] = mapped_column(Boolean, default=True)
    push_achievements: Mapped[bool] = mapped_column(Boolean, default=True)
    
    digest_frequency: Mapped[str] = mapped_column(String(20), default="daily")
    
    # Relationships
    user: Mapped["User"] = relationship(back_populates="notification_preferences")
    
    def __repr__(self) -> str:
        return f"<NotificationPreference {self.user_id}>"
