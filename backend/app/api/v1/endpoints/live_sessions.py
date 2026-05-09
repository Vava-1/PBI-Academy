"""Live session endpoints."""
from datetime import datetime, timezone, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_

from app.api.deps import get_db_session, get_current_user, require_instructor
from app.models.live import LiveSession, LiveAttendance
from app.models.user import User
from app.constants import LiveSessionStatus, LiveSessionType

router = APIRouter()


@router.get("/")
async def list_live_sessions(
    status: Optional[str] = None,
    session_type: Optional[str] = None,
    upcoming_only: bool = True,
    limit: int = 20,
    db: AsyncSession = Depends(get_db_session)
):
    """List live sessions."""
    query = select(LiveSession)
    
    if upcoming_only:
        query = query.where(LiveSession.scheduled_at >= datetime.now(timezone.utc))
    
    if status:
        query = query.where(LiveSession.status == status)
    
    if session_type:
        query = query.where(LiveSession.session_type == session_type)
    
    query = query.order_by(LiveSession.scheduled_at).limit(limit)
    
    result = await db.execute(query)
    sessions = result.scalars().all()
    
    return [
        {
            "id": str(s.id),
            "title": s.title,
            "description": s.description,
            "session_type": s.session_type.value if s.session_type else None,
            "scheduled_at": s.scheduled_at,
            "duration_minutes": s.duration_minutes,
            "max_participants": s.max_participants,
            "status": s.status.value if s.status else None,
            "created_at": s.created_at
        }
        for s in sessions
    ]


@router.get("/live-now")
async def get_live_now(
    db: AsyncSession = Depends(get_db_session)
):
    """Get currently live sessions."""
    result = await db.execute(
        select(LiveSession)
        .where(LiveSession.status == LiveSessionStatus.LIVE)
        .order_by(LiveSession.scheduled_at.desc())
    )
    sessions = result.scalars().all()
    
    return [
        {
            "id": str(s.id),
            "title": s.title,
            "description": s.description,
            "session_type": s.session_type.value if s.session_type else None,
            "meeting_url": s.meeting_url,
            "started_at": s.scheduled_at,
            "duration_minutes": s.duration_minutes,
            "participants": 0  # Would count from attendance
        }
        for s in sessions
    ]


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_live_session(
    title: str,
    description: Optional[str] = None,
    session_type: str = "speaking_practice",
    scheduled_at: datetime = None,
    duration_minutes: int = 60,
    max_participants: int = 50,
    course_id: Optional[str] = None,
    current_user: User = Depends(require_instructor),
    db: AsyncSession = Depends(get_db_session)
):
    """Create a new live session (instructor only)."""
    if scheduled_at is None:
        scheduled_at = datetime.now(timezone.utc) + timedelta(hours=1)
    
    try:
        session_type_enum = LiveSessionType(session_type)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid session type"
        )
    
    session = LiveSession(
        course_id=course_id,
        title=title,
        description=description,
        session_type=session_type_enum,
        scheduled_at=scheduled_at,
        duration_minutes=duration_minutes,
        max_participants=max_participants,
        status=LiveSessionStatus.UPCOMING
    )
    
    db.add(session)
    await db.commit()
    await db.refresh(session)
    
    return {
        "id": str(session.id),
        "title": session.title,
        "scheduled_at": session.scheduled_at,
        "status": session.status.value
    }


@router.post("/{session_id}/join")
async def join_session(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    """Join a live session."""
    result = await db.execute(
        select(LiveSession).where(LiveSession.id == session_id)
    )
    session = result.scalar_one_or_none()
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )
    
    if session.status not in [LiveSessionStatus.UPCOMING, LiveSessionStatus.LIVE]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Session is not available for joining"
        )
    
    # Check if already joined
    existing = await db.execute(
        select(LiveAttendance).where(
            and_(
                LiveAttendance.session_id == session_id,
                LiveAttendance.user_id == current_user.id,
                LiveAttendance.left_at == None
            )
        )
    )
    if existing.scalar_one_or_none():
        return {
            "message": "Already joined",
            "meeting_url": session.meeting_url,
            "session_id": session_id
        }
    
    # Create attendance record
    attendance = LiveAttendance(
        session_id=session_id,
        user_id=current_user.id
    )
    
    db.add(attendance)
    await db.commit()
    
    return {
        "message": "Joined successfully",
        "meeting_url": session.meeting_url,
        "session_id": session_id
    }


@router.post("/{session_id}/leave")
async def leave_session(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    """Leave a live session."""
    result = await db.execute(
        select(LiveAttendance).where(
            and_(
                LiveAttendance.session_id == session_id,
                LiveAttendance.user_id == current_user.id,
                LiveAttendance.left_at == None
            )
        )
    )
    attendance = result.scalar_one_or_none()
    
    if attendance:
        attendance.left_at = datetime.now(timezone.utc)
        await db.commit()
    
    return {"message": "Left session"}
