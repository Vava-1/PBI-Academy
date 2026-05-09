"""Mock exam endpoints."""
import uuid
from datetime import datetime, timezone, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload

from app.api.deps import get_db_session, get_current_user, get_redis
from app.cache.redis_client import RedisCache
from app.models.mock_exam import MockExam, ExamSection, MockExamAttempt, AIGradedResponse
from app.models.user import User
from app.schemas.exam import (
    MockExamResponse,
    ExamAttemptCreate,
    ExamAttemptResponse,
    SubmitExamRequest,
    ExamResultResponse,
    ExamReadinessResponse
)
from app.constants import EXAM_CONFIG, ExamType, ExamSectionType

router = APIRouter()


@router.get("/", response_model=List[MockExamResponse])
async def list_mock_exams(
    exam_type: Optional[str] = None,
    is_active: bool = True,
    db: AsyncSession = Depends(get_db_session)
):
    """List available mock exams."""
    query = select(MockExam).where(MockExam.is_active == is_active)
    
    if exam_type:
        query = query.where(MockExam.exam_type == exam_type)
    
    result = await db.execute(query.options(selectinload(MockExam.sections)))
    exams = result.scalars().all()
    return exams


@router.get("/{exam_id}", response_model=MockExamResponse)
async def get_mock_exam(
    exam_id: str,
    db: AsyncSession = Depends(get_db_session)
):
    """Get mock exam details."""
    result = await db.execute(
        select(MockExam)
        .options(selectinload(MockExam.sections))
        .where(MockExam.id == exam_id)
    )
    exam = result.scalar_one_or_none()
    
    if not exam:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mock exam not found"
        )
    
    return exam


@router.post("/{exam_id}/start", response_model=ExamAttemptResponse)
async def start_exam(
    exam_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
    redis: RedisCache = Depends(get_redis)
):
    """Start a new exam attempt."""
    # Get exam
    result = await db.execute(select(MockExam).where(MockExam.id == exam_id))
    exam = result.scalar_one_or_none()
    
    if not exam:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mock exam not found"
        )
    
    # Check for existing active attempt
    existing = await db.execute(
        select(MockExamAttempt).where(
            and_(
                MockExamAttempt.user_id == current_user.id,
                MockExamAttempt.exam_id == exam_id,
                MockExamAttempt.status == "in_progress"
            )
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You already have an active attempt for this exam"
        )
    
    # Create attempt
    session_token = str(uuid.uuid4())
    attempt = MockExamAttempt(
        user_id=current_user.id,
        exam_id=exam_id,
        session_token=session_token,
        status="in_progress"
    )
    
    db.add(attempt)
    await db.commit()
    await db.refresh(attempt)
    
    # Set up Redis session for timer
    session_key = f"exam_session:{current_user.id}:{exam_id}"
    await redis.set(
        session_key,
        {
            "attempt_id": str(attempt.id),
            "session_token": session_token,
            "started_at": attempt.started_at.isoformat(),
            "duration_minutes": exam.total_duration_minutes
        },
        expire=timedelta(minutes=exam.total_duration_minutes + 5)  # Buffer time
    )
    
    return ExamAttemptResponse(
        id=str(attempt.id),
        user_id=str(attempt.user_id),
        exam_id=str(attempt.exam_id),
        exam_name=exam.name,
        exam_type=exam.exam_type,
        started_at=attempt.started_at,
        submitted_at=None,
        total_score=None,
        section_scores={},
        status=attempt.status,
        session_token=session_token,
        time_remaining_seconds=exam.total_duration_minutes * 60
    )


@router.get("/attempts/{attempt_id}/status", response_model=ExamAttemptResponse)
async def get_attempt_status(
    attempt_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
    redis: RedisCache = Depends(get_redis)
):
    """Get current attempt status with remaining time."""
    result = await db.execute(
        select(MockExamAttempt)
        .options(selectinload(MockExamAttempt.exam))
        .where(
            and_(
                MockExamAttempt.id == attempt_id,
                MockExamAttempt.user_id == current_user.id
            )
        )
    )
    attempt = result.scalar_one_or_none()
    
    if not attempt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Attempt not found"
        )
    
    # Calculate remaining time
    time_remaining = None
    if attempt.status == "in_progress":
        session_key = f"exam_session:{current_user.id}:{attempt.exam_id}"
        session_data = await redis.get(session_key)
        
        if session_data:
            started_at = datetime.fromisoformat(session_data["started_at"])
            duration_seconds = session_data["duration_minutes"] * 60
            elapsed = (datetime.now(timezone.utc) - started_at).total_seconds()
            time_remaining = max(0, int(duration_seconds - elapsed))
    
    return ExamAttemptResponse(
        id=str(attempt.id),
        user_id=str(attempt.user_id),
        exam_id=str(attempt.exam_id),
        exam_name=attempt.exam.name,
        exam_type=attempt.exam.exam_type,
        started_at=attempt.started_at,
        submitted_at=attempt.submitted_at,
        total_score=attempt.total_score,
        section_scores=attempt.section_scores,
        status=attempt.status,
        session_token=attempt.session_token,
        time_remaining_seconds=time_remaining
    )


@router.post("/attempts/{attempt_id}/submit", response_model=ExamResultResponse)
async def submit_exam(
    attempt_id: str,
    submission: SubmitExamRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
    redis: RedisCache = Depends(get_redis)
):
    """Submit exam attempt."""
    result = await db.execute(
        select(MockExamAttempt)
        .options(selectinload(MockExamAttempt.exam))
        .where(
            and_(
                MockExamAttempt.id == attempt_id,
                MockExamAttempt.user_id == current_user.id
            )
        )
    )
    attempt = result.scalar_one_or_none()
    
    if not attempt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Attempt not found"
        )
    
    if attempt.status != "in_progress":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Attempt already submitted"
        )
    
    # Update attempt
    attempt.status = "completed"
    attempt.submitted_at = datetime.now(timezone.utc)
    
    # Calculate simple scores (AI grading would be async)
    section_scores = {}
    for section_id, score in submission.responses.items() if hasattr(submission, 'responses') else {}:
        section_scores[section_id] = score if isinstance(score, int) else 0
    
    attempt.total_score = sum(section_scores.values())
    attempt.section_scores = section_scores
    
    await db.commit()
    await db.refresh(attempt)
    
    # Clear Redis session
    session_key = f"exam_session:{current_user.id}:{attempt.exam_id}"
    await redis.delete(session_key)
    
    return ExamResultResponse(
        id=str(attempt.id),
        attempt_id=str(attempt.id),
        exam_name=attempt.exam.name,
        exam_type=attempt.exam.exam_type,
        total_score=attempt.total_score,
        section_scores=attempt.section_scores,
        graded_responses=[],
        strengths=[],
        weaknesses=[],
        improvement_plan=[],
        completed_at=attempt.submitted_at
    )


@router.get("/readiness/analysis", response_model=ExamReadinessResponse)
async def get_exam_readiness(
    exam_type: ExamType,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    """Get exam readiness analysis based on past attempts."""
    # Get recent attempts for this exam type
    result = await db.execute(
        select(MockExamAttempt)
        .join(MockExam)
        .where(
            and_(
                MockExamAttempt.user_id == current_user.id,
                MockExam.exam_type == exam_type,
                MockExamAttempt.status == "completed"
            )
        )
        .order_by(MockExamAttempt.submitted_at.desc())
        .limit(5)
    )
    attempts = result.scalars().all()
    
    if not attempts:
        return ExamReadinessResponse(
            target_exam=exam_type,
            predicted_score=0,
            confidence_level="low",
            readiness_percentage=0,
            weak_areas=[],
            recommended_study_hours=40,
            last_mock_exam_date=None
        )
    
    # Calculate average and trend
    scores = [a.total_score or 0 for a in attempts]
    avg_score = sum(scores) / len(scores)
    
    # Simple prediction (would be more sophisticated with ML)
    predicted_score = int(avg_score * 1.05)  # Assume 5% improvement
    max_score = attempts[0].exam.total_score
    readiness_percentage = int((predicted_score / max_score) * 100)
    
    confidence = "low"
    if len(attempts) >= 3:
        confidence = "high" if readiness_percentage > 70 else "medium"
    elif len(attempts) >= 1:
        confidence = "medium"
    
    # Identify weak areas from section scores
    weak_areas = []
    section_totals = {}
    section_counts = {}
    
    for attempt in attempts:
        for section_id, score in (attempt.section_scores or {}).items():
            section_totals[section_id] = section_totals.get(section_id, 0) + score
            section_counts[section_id] = section_counts.get(section_id, 0) + 1
    
    from app.constants import ExamSectionType
    for section_id, total in section_totals.items():
        avg = total / section_counts[section_id]
        if avg < max_score * 0.6:  # Below 60%
            weak_areas.append({
                "section_type": ExamSectionType.READING,  # Simplified
                "weakness_name": f"Section {section_id}",
                "severity": "high" if avg < max_score * 0.4 else "medium",
                "current_score": int(avg),
                "target_score": int(max_score * 0.8),
                "recommended_drills": ["Practice more questions", "Review fundamentals"]
            })
    
    return ExamReadinessResponse(
        target_exam=exam_type,
        predicted_score=predicted_score,
        confidence_level=confidence,
        readiness_percentage=min(100, readiness_percentage),
        weak_areas=weak_areas,
        recommended_study_hours=max(0, 40 - len(attempts) * 5),
        last_mock_exam_date=attempts[0].submitted_at
    )
