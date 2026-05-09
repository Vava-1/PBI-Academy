"""AI Analytics endpoints."""
from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_

from app.api.deps import get_db_session, get_current_user
from app.models.user import User
from app.models.ai import AIAnalytics
from app.models.mock_exam import MockExamAttempt
from app.models.course import Enrollment
from app.models.gamification import GamificationMetrics
from app.schemas.ai import (
    AnalyticsResponse,
    SkillAssessment,
    RadarChartData,
    WeeklyProgress,
    ProgressChartData,
    ExamPrediction
)

router = APIRouter()


@router.get("/me", response_model=AnalyticsResponse)
async def get_my_analytics(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    """Get AI-generated analytics for current user."""
    # Get or calculate analytics
    result = await db.execute(
        select(AIAnalytics)
        .where(AIAnalytics.user_id == current_user.id)
        .order_by(AIAnalytics.calculated_at.desc())
    )
    analytics = result.scalar_one_or_none()
    
    if not analytics or (datetime.now(timezone.utc) - analytics.calculated_at).days > 1:
        # Recalculate analytics
        analytics = await calculate_user_analytics(current_user.id, db)
    
    return AnalyticsResponse(
        id=str(analytics.id),
        user_id=str(analytics.user_id),
        engagement_score=float(analytics.engagement_score),
        mastery_score=float(analytics.mastery_score),
        momentum_score=float(analytics.momentum_score),
        confidence_score=float(analytics.confidence_score),
        dropout_risk=float(analytics.dropout_risk),
        calculated_at=analytics.calculated_at,
        skill_breakdown=analytics.skill_breakdown,
        weak_areas=analytics.weak_areas,
        recommended_actions=analytics.recommended_actions
    )


async def calculate_user_analytics(user_id: str, db: AsyncSession) -> AIAnalytics:
    """Calculate AI analytics for a user."""
    # Get user's activity data
    enrollment_result = await db.execute(
        select(Enrollment).where(Enrollment.user_id == user_id)
    )
    enrollments = enrollment_result.scalars().all()
    
    exam_result = await db.execute(
        select(MockExamAttempt).where(
            and_(
                MockExamAttempt.user_id == user_id,
                MockExamAttempt.status == "completed"
            )
        )
    )
    exam_attempts = exam_result.scalars().all()
    
    gamification_result = await db.execute(
        select(GamificationMetrics).where(GamificationMetrics.user_id == user_id)
    )
    gamification = gamification_result.scalar_one_or_none()
    
    # Calculate scores
    # Engagement: Based on login frequency and activity
    engagement = min(100, (
        (gamification.current_streak_days * 5 if gamification else 0) +
        (len(enrollments) * 10) +
        (len(exam_attempts) * 15)
    ))
    
    # Mastery: Based on exam scores and course completion
    avg_exam_score = 0
    if exam_attempts:
        scores = [a.total_score or 0 for a in exam_attempts]
        max_scores = [100] * len(scores)  # Simplified
        avg_exam_score = sum(scores) / sum(max_scores) * 100 if max_scores else 0
    
    completion_rate = sum(
        1 for e in enrollments if e.status == "completed"
    ) / len(enrollments) * 100 if enrollments else 0
    
    mastery = min(100, (avg_exam_score * 0.6 + completion_rate * 0.4))
    
    # Momentum: Based on recent activity trend
    recent_attempts = len([a for a in exam_attempts if a.submitted_at and 
                          (datetime.now(timezone.utc) - a.submitted_at).days <= 30])
    momentum = min(100, recent_attempts * 20 + (gamification.current_streak_days * 5 if gamification else 0))
    
    # Confidence: Based on consistency and improvement
    confidence = min(100, mastery * 0.7 + momentum * 0.3)
    
    # Dropout risk: Inverse of engagement + momentum
    dropout = max(0, 100 - (engagement * 0.5 + momentum * 0.5))
    
    # Skill breakdown
    skill_breakdown = {
        "reading": min(100, avg_exam_score * 1.1),
        "listening": min(100, avg_exam_score * 0.95),
        "speaking": min(100, avg_exam_score * 0.9),
        "writing": min(100, avg_exam_score * 1.0),
        "grammar": min(100, avg_exam_score * 1.05),
        "vocabulary": min(100, avg_exam_score * 1.0)
    }
    
    # Identify weak areas
    weak_areas = [
        skill for skill, score in skill_breakdown.items()
        if score < 60
    ]
    
    # Generate recommendations
    recommended_actions = []
    if engagement < 50:
        recommended_actions.append("Set daily learning reminders")
        recommended_actions.append("Join a study group for accountability")
    
    if mastery < 60:
        recommended_actions.append("Focus on foundational concepts")
        recommended_actions.append("Review past exam mistakes")
    
    if not weak_areas:
        recommended_actions.append("Continue with advanced practice materials")
    else:
        for area in weak_areas[:2]:
            recommended_actions.append(f"Practice more {area} exercises")
    
    # Create or update analytics
    analytics_result = await db.execute(
        select(AIAnalytics).where(AIAnalytics.user_id == user_id)
    )
    existing = analytics_result.scalar_one_or_none()
    
    if existing:
        existing.engagement_score = engagement
        existing.mastery_score = mastery
        existing.momentum_score = momentum
        existing.confidence_score = confidence
        existing.dropout_risk = dropout
        existing.skill_breakdown = skill_breakdown
        existing.weak_areas = weak_areas
        existing.recommended_actions = recommended_actions
        existing.calculated_at = datetime.now(timezone.utc)
        analytics = existing
    else:
        analytics = AIAnalytics(
            user_id=user_id,
            engagement_score=engagement,
            mastery_score=mastery,
            momentum_score=momentum,
            confidence_score=confidence,
            dropout_risk=dropout,
            skill_breakdown=skill_breakdown,
            weak_areas=weak_areas,
            recommended_actions=recommended_actions
        )
        db.add(analytics)
    
    await db.commit()
    await db.refresh(analytics)
    
    return analytics


@router.get("/skill-radar", response_model=RadarChartData)
async def get_skill_radar(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    """Get skill radar chart data."""
    analytics = await calculate_user_analytics(current_user.id, db)
    
    # Mock peer average data (would come from aggregate analytics)
    peer_average = {
        "reading": 65,
        "listening": 62,
        "speaking": 58,
        "writing": 64,
        "grammar": 66,
        "vocabulary": 63
    }
    
    labels = list(analytics.skill_breakdown.keys())
    user_data = [analytics.skill_breakdown.get(k, 0) for k in labels]
    peer_data = [peer_average.get(k, 60) for k in labels]
    
    return RadarChartData(
        labels=labels,
        user_data=user_data,
        peer_average_data=peer_data,
        max_value=100.0
    )


@router.get("/weekly-progress", response_model=ProgressChartData)
async def get_weekly_progress(
    weeks: int = 8,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    """Get weekly progress chart data."""
    # Mock data (would calculate from actual activity logs)
    from datetime import timedelta
    
    labels = []
    user_hours = []
    school_avg = []
    completion_rates = []
    
    for i in range(weeks):
        week_start = datetime.now(timezone.utc) - timedelta(weeks=weeks-i-1)
        labels.append(week_start.strftime("%b %d"))
        
        # Mock user data
        user_hours.append(3 + i * 0.5 + (i % 3) * 0.5)
        school_avg.append(4.5)
        completion_rates.append(min(100, 20 + i * 8))
    
    return ProgressChartData(
        weeks=labels,
        user_hours=[round(h, 1) for h in user_hours],
        school_average_hours=school_avg,
        completion_rate=[round(c, 1) for c in completion_rates]
    )


@router.get("/exam-prediction", response_model=ExamPrediction)
async def get_exam_prediction(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    """Get exam score prediction."""
    # Get recent attempts
    result = await db.execute(
        select(MockExamAttempt).where(
            and_(
                MockExamAttempt.user_id == current_user.id,
                MockExamAttempt.status == "completed"
            )
        ).order_by(MockExamAttempt.submitted_at.desc()).limit(5)
    )
    attempts = result.scalars().all()
    
    if not attempts:
        return ExamPrediction(
            predicted_score=0,
            confidence_interval=(0, 0),
            based_on_attempts=0,
            trend_direction="unknown"
        )
    
    scores = [a.total_score or 0 for a in attempts]
    avg_score = sum(scores) / len(scores)
    
    # Simple trend calculation
    if len(scores) >= 2:
        recent = sum(scores[:2]) / 2
        older = sum(scores[-2:]) / 2
        if recent > older + 5:
            trend = "improving"
        elif recent < older - 5:
            trend = "declining"
        else:
            trend = "stable"
    else:
        trend = "stable"
    
    # Confidence interval
    import statistics
    if len(scores) > 1:
        std_dev = statistics.stdev(scores)
        confidence = (max(0, int(avg_score - std_dev)), min(100, int(avg_score + std_dev)))
    else:
        confidence = (int(avg_score * 0.8), int(avg_score * 1.2))
    
    return ExamPrediction(
        predicted_score=int(avg_score * 1.05),  # Assume slight improvement
        confidence_interval=confidence,
        based_on_attempts=len(attempts),
        trend_direction=trend
    )
