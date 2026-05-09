"""Message schemas for request/response validation."""
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List
from uuid import UUID


class MessageType(str):
    PERFORMANCE_ANALYSIS = "performance_analysis"
    AI_INSIGHT = "ai_insight"
    TEACHER_MESSAGE = "teacher_message"
    SYSTEM_NOTIFICATION = "system_notification"
    REMINDER = "reminder"
    ACHIEVEMENT = "achievement"


class MessageStatus(str):
    UNREAD = "unread"
    READ = "read"
    ARCHIVED = "archived"


class MessageBase(BaseModel):
    subject: str = Field(..., min_length=1, max_length=255)
    body: str = Field(..., min_length=1)


class MessageCreate(MessageBase):
    recipient_id: str


class MessageUpdate(BaseModel):
    subject: Optional[str] = Field(None, min_length=1, max_length=255)
    body: Optional[str] = Field(None, min_length=1)


class MessageResponse(BaseModel):
    id: str
    recipient_id: str
    sender_id: Optional[str]
    message_type: str
    status: str
    subject: str
    body: str
    performance_data: dict
    analytics_summary: dict
    recommendations: List[str]
    is_ai_generated: bool
    ai_confidence: Optional[float]
    priority: str
    scheduled_for: Optional[datetime]
    sent_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class MessageListResponse(BaseModel):
    messages: List[MessageResponse]
    total: int
    unread_count: int
