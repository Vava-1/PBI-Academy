"""Message and inbox endpoints for performance analysis and communication."""
from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from uuid import UUID

from app.api.deps import get_db_session, get_current_user
from app.models.user import User
from app.models.message import Message, MessageThread, MessageType, MessageStatus, NotificationPreference
from app.schemas.message import MessageCreate, MessageResponse, MessageUpdate, MessageListResponse

router = APIRouter()


@router.get("/inbox", response_model=MessageListResponse)
async def get_inbox(
    status_filter: Optional[MessageStatus] = None,
    message_type: Optional[MessageType] = None,
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    """Get current user's inbox messages."""
    query = select(Message).where(Message.recipient_id == current_user.id)
    
    if status_filter:
        query = query.where(Message.status == status_filter)
    if message_type:
        query = query.where(Message.message_type == message_type)
    
    query = query.order_by(Message.created_at.desc()).offset(skip).limit(limit)
    
    result = await db.execute(query)
    messages = result.scalars().all()
    
    # Count unread
    unread_count_result = await db.execute(
        select(Message).where(
            Message.recipient_id == current_user.id,
            Message.status == MessageStatus.UNREAD
        )
    )
    unread_count = len(unread_count_result.scalars().all())
    
    return MessageListResponse(
        messages=[MessageResponse.model_validate(m) for m in messages],
        total=len(messages),
        unread_count=unread_count
    )


@router.get("/{message_id}", response_model=MessageResponse)
async def get_message(
    message_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    """Get a specific message by ID."""
    result = await db.execute(
        select(Message).where(
            Message.id == message_id,
            Message.recipient_id == current_user.id
        )
    )
    message = result.scalar_one_or_none()
    
    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found"
        )
    
    return MessageResponse.model_validate(message)


@router.patch("/{message_id}/read")
async def mark_message_read(
    message_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    """Mark a message as read."""
    result = await db.execute(
        select(Message).where(
            Message.id == message_id,
            Message.recipient_id == current_user.id
        )
    )
    message = result.scalar_one_or_none()
    
    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found"
        )
    
    message.status = MessageStatus.READ
    await db.commit()
    
    return {"status": "success"}


@router.patch("/{message_id}/archive")
async def archive_message(
    message_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    """Archive a message."""
    result = await db.execute(
        select(Message).where(
            Message.id == message_id,
            Message.recipient_id == current_user.id
        )
    )
    message = result.scalar_one_or_none()
    
    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found"
        )
    
    message.status = MessageStatus.ARCHIVED
    await db.commit()
    
    return {"status": "success"}


@router.post("/send", response_model=MessageResponse)
async def send_message(
    message_data: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    """Send a message to another user (teachers/instructors)."""
    # Verify recipient exists
    recipient_result = await db.execute(
        select(User).where(User.id == message_data.recipient_id)
    )
    recipient = recipient_result.scalar_one_or_none()
    
    if not recipient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recipient not found"
        )
    
    # Create message
    message = Message(
        recipient_id=message_data.recipient_id,
        sender_id=current_user.id,
        message_type=MessageType.TEACHER_MESSAGE,
        subject=message_data.subject,
        body=message_data.body,
        status=MessageStatus.UNREAD,
        sent_at=datetime.now(timezone.utc)
    )
    
    db.add(message)
    await db.commit()
    await db.refresh(message)
    
    return MessageResponse.model_validate(message)


@router.get("/preferences/me", response_model=dict)
async def get_notification_preferences(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    """Get current user's notification preferences."""
    result = await db.execute(
        select(NotificationPreference).where(
            NotificationPreference.user_id == current_user.id
        )
    )
    preferences = result.scalar_one_or_none()
    
    if not preferences:
        # Create default preferences
        preferences = NotificationPreference(user_id=current_user.id)
        db.add(preferences)
        await db.commit()
        await db.refresh(preferences)
    
    return {
        "email_performance_analysis": preferences.email_performance_analysis,
        "email_ai_insights": preferences.email_ai_insights,
        "email_teacher_messages": preferences.email_teacher_messages,
        "email_achievements": preferences.email_achievements,
        "push_performance_analysis": preferences.push_performance_analysis,
        "push_ai_insights": preferences.push_ai_insights,
        "push_teacher_messages": preferences.push_teacher_messages,
        "push_achievements": preferences.push_achievements,
        "digest_frequency": preferences.digest_frequency
    }


@router.patch("/preferences/me")
async def update_notification_preferences(
    preferences_data: dict,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    """Update current user's notification preferences."""
    result = await db.execute(
        select(NotificationPreference).where(
            NotificationPreference.user_id == current_user.id
        )
    )
    preferences = result.scalar_one_or_none()
    
    if not preferences:
        preferences = NotificationPreference(user_id=current_user.id)
        db.add(preferences)
    
    # Update fields
    for field, value in preferences_data.items():
        if hasattr(preferences, field):
            setattr(preferences, field, value)
    
    await db.commit()
    
    return {"status": "success"}
