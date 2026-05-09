"""User management endpoints."""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update

from app.api.deps import get_db_session, get_current_user, require_admin
from app.models.user import User
from app.schemas.user import UserResponse, UserUpdate, UserProfileResponse
from app.core.security import get_password_hash

router = APIRouter()


@router.get("/me", response_model=UserProfileResponse)
async def get_current_user_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    """Get current user's profile with stats."""
    # Get enrollment stats
    from app.models.course import Enrollment
    enrollments_result = await db.execute(
        select(Enrollment).where(Enrollment.user_id == current_user.id)
    )
    enrollments = enrollments_result.scalars().all()
    
    total_courses = len(enrollments)
    completed_courses = sum(1 for e in enrollments if e.status == "completed")
    
    # Get gamification stats
    from app.models.gamification import GamificationMetrics
    gamification_result = await db.execute(
        select(GamificationMetrics).where(GamificationMetrics.user_id == current_user.id)
    )
    gamification = gamification_result.scalar_one_or_none()
    
    # Get subscription
    from app.models.subscription import Subscription
    subscription_result = await db.execute(
        select(Subscription)
        .where(Subscription.user_id == current_user.id)
        .order_by(Subscription.created_at.desc())
    )
    subscription = subscription_result.scalar_one_or_none()
    
    return UserProfileResponse(
        id=str(current_user.id),
        email=current_user.email,
        first_name=current_user.first_name,
        last_name=current_user.last_name,
        avatar_url=current_user.avatar_url,
        role=current_user.role,
        target_exam=current_user.target_exam,
        proficiency_level=current_user.proficiency_level,
        referral_code=current_user.referral_code,
        created_at=current_user.created_at,
        updated_at=current_user.updated_at,
        last_active=current_user.last_active,
        total_courses=total_courses,
        completed_courses=completed_courses,
        current_streak=gamification.current_streak_days if gamification else 0,
        total_points=gamification.total_points if gamification else 0,
        level=gamification.level if gamification else 1,
        subscription_plan=subscription.plan_type.value if subscription else "free"
    )


@router.patch("/me", response_model=UserResponse)
async def update_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    """Update current user's profile."""
    update_data = user_update.model_dump(exclude_unset=True)
    
    if not update_data:
        return current_user
    
    # Update user
    for field, value in update_data.items():
        setattr(current_user, field, value)
    
    await db.commit()
    await db.refresh(current_user)
    
    return current_user


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: str,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db_session)
):
    """Get user by ID (admin only)."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user


@router.get("/", response_model=List[UserResponse])
async def list_users(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db_session)
):
    """List all users (admin only)."""
    result = await db.execute(
        select(User).offset(skip).limit(limit)
    )
    users = result.scalars().all()
    return users
