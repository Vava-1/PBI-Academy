"""Gamification endpoints."""
from datetime import datetime, date, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, desc, func

from app.api.deps import get_db_session, get_current_user, get_redis
from app.cache.redis_client import RedisCache
from app.models.gamification import GamificationMetrics, Achievement, UserAchievement, Reward, RewardsRedemption
from app.models.user import User
from app.schemas.gamification import (
    GamificationResponse,
    LeaderboardResponse,
    LeaderboardEntry,
    AchievementResponse,
    RewardResponse,
    RewardRedemptionRequest,
    RewardRedemptionResponse
)
from app.constants import ACTIVITY_POINTS, STREAK_POINTS, AchievementType

router = APIRouter()


@router.get("/me", response_model=GamificationResponse)
async def get_my_gamification(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    """Get current user's gamification metrics."""
    result = await db.execute(
        select(GamificationMetrics).where(GamificationMetrics.user_id == current_user.id)
    )
    gamification = result.scalar_one_or_none()
    
    if not gamification:
        # Create default gamification record
        gamification = GamificationMetrics(user_id=current_user.id)
        db.add(gamification)
        await db.commit()
        await db.refresh(gamification)
    
    # Calculate points to next level
    points_per_level = 1000
    points_in_current_level = gamification.experience_points % points_per_level
    points_to_next = points_per_level - points_in_current_level
    
    return GamificationResponse(
        id=str(gamification.id),
        user_id=str(gamification.user_id),
        points={
            "total_points": gamification.total_points,
            "level": gamification.level,
            "experience_points": gamification.experience_points,
            "points_to_next_level": points_to_next,
            "progress_percent": (points_in_current_level / points_per_level) * 100
        },
        streak={
            "current_streak_days": gamification.current_streak_days,
            "longest_streak_days": gamification.longest_streak_days,
            "last_activity_date": gamification.last_activity_date,
            "streak_at_risk": (
                gamification.last_activity_date and 
                (date.today() - gamification.last_activity_date).days >= 1
            )
        },
        badges_earned=gamification.badges_earned.get("badges", []),
        recent_achievements=[]
    )


@router.post("/activity", response_model=GamificationResponse)
async def record_activity(
    activity_type: str,
    metadata: dict = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
    redis: RedisCache = Depends(get_redis)
):
    """Record user activity and award points."""
    result = await db.execute(
        select(GamificationMetrics).where(GamificationMetrics.user_id == current_user.id)
    )
    gamification = result.scalar_one_or_none()
    
    if not gamification:
        gamification = GamificationMetrics(user_id=current_user.id)
        db.add(gamification)
    
    # Calculate points
    points = ACTIVITY_POINTS.get(activity_type, 5)
    if activity_type == "video_watch_minute" and metadata:
        points = points * metadata.get("minutes", 1)
    
    # Update gamification
    gamification.total_points += points
    gamification.experience_points += points
    
    # Check for level up
    new_level = (gamification.experience_points // 1000) + 1
    if new_level > gamification.level:
        gamification.level = new_level
    
    # Update streak
    today = date.today()
    if gamification.last_activity_date:
        days_diff = (today - gamification.last_activity_date).days
        if days_diff == 1:
            gamification.current_streak_days += 1
            # Award streak bonus
            for days, bonus in STREAK_POINTS.items():
                if gamification.current_streak_days == days:
                    gamification.total_points += bonus
                    break
        elif days_diff > 1:
            # Streak broken
            if gamification.current_streak_days > gamification.longest_streak_days:
                gamification.longest_streak_days = gamification.current_streak_days
            gamification.current_streak_days = 1
    else:
        gamification.current_streak_days = 1
    
    gamification.last_activity_date = today
    
    # Update leaderboard in Redis
    leaderboard_key = "leaderboard:global:points"
    await redis.zadd(leaderboard_key, {str(current_user.id): gamification.total_points})
    
    await db.commit()
    await db.refresh(gamification)
    
    return await get_my_gamification(current_user, db)


@router.get("/leaderboard", response_model=LeaderboardResponse)
async def get_leaderboard(
    type: str = "global",
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    redis: RedisCache = Depends(get_redis),
    db: AsyncSession = Depends(get_db_session)
):
    """Get leaderboard."""
    leaderboard_key = f"leaderboard:{type}:points"
    
    # Get top entries from Redis
    entries_data = await redis.zrevrange(leaderboard_key, 0, limit - 1, withscores=True)
    
    entries = []
    user_rank = None
    
    for rank, (user_id, score) in enumerate(entries_data, 1):
        # Get user details
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        
        if user:
            # Get gamification for streak info
            gamification_result = await db.execute(
                select(GamificationMetrics).where(GamificationMetrics.user_id == user_id)
            )
            gamification = gamification_result.scalar_one_or_none()
            
            entries.append(LeaderboardEntry(
                rank=rank,
                user_id=user_id,
                display_name=f"{user.first_name} {user.last_name}",
                avatar_url=user.avatar_url,
                total_points=int(score),
                level=gamification.level if gamification else 1,
                current_streak=gamification.current_streak_days if gamification else 0,
                is_current_user=user_id == str(current_user.id)
            ))
            
            if user_id == str(current_user.id):
                user_rank = rank
    
    return LeaderboardResponse(
        type=type,
        entries=entries,
        user_rank=user_rank,
        total_participants=len(entries),
        last_updated=datetime.now(timezone.utc)
    )


@router.get("/achievements", response_model=List[AchievementResponse])
async def get_achievements(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    """Get all achievements with unlock status."""
    # Get all achievements
    result = await db.execute(select(Achievement))
    all_achievements = result.scalars().all()
    
    # Get user's unlocked achievements
    user_result = await db.execute(
        select(UserAchievement).where(UserAchievement.user_id == current_user.id)
    )
    user_achievements = {ua.achievement_id: ua for ua in user_result.scalars().all()}
    
    return [
        AchievementResponse(
            id=str(achievement.id),
            name=achievement.name,
            description=achievement.description,
            icon_url=achievement.icon_url,
            points_reward=achievement.points_reward,
            achievement_type=achievement.achievement_type,
            unlock_criteria=achievement.unlock_criteria,
            unlocked_at=user_achievements[achievement.id].unlocked_at if achievement.id in user_achievements else None,
            is_unlocked=achievement.id in user_achievements,
            progress_percent=None  # Would calculate based on criteria
        )
        for achievement in all_achievements
    ]


@router.get("/rewards", response_model=List[RewardResponse])
async def get_rewards(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    """Get available rewards."""
    result = await db.execute(
        select(Reward).where(
            (Reward.stock_quantity == None) | (Reward.stock_quantity > 0)
        )
    )
    rewards = result.scalars().all()
    
    return [
        RewardResponse(
            id=str(reward.id),
            name=reward.name,
            description=reward.description,
            points_cost=reward.points_cost,
            reward_type=reward.reward_type,
            reward_data=reward.reward_data,
            stock_quantity=reward.stock_quantity,
            available=(reward.stock_quantity is None or reward.stock_quantity > 0)
        )
        for reward in rewards
    ]


@router.post("/rewards/redeem", response_model=RewardRedemptionResponse)
async def redeem_reward(
    redemption: RewardRedemptionRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    """Redeem a reward."""
    # Get reward
    result = await db.execute(
        select(Reward).where(Reward.id == redemption.reward_id)
    )
    reward = result.scalar_one_or_none()
    
    if not reward:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reward not found"
        )
    
    # Check stock
    if reward.stock_quantity is not None and reward.stock_quantity <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reward out of stock"
        )
    
    # Get user's points
    gamification_result = await db.execute(
        select(GamificationMetrics).where(GamificationMetrics.user_id == current_user.id)
    )
    gamification = gamification_result.scalar_one_or_none()
    
    if not gamification or gamification.total_points < reward.points_cost:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Insufficient points"
        )
    
    # Deduct points and create redemption
    gamification.total_points -= reward.points_cost
    
    redemption_record = RewardsRedemption(
        user_id=current_user.id,
        reward_id=reward.id,
        points_spent=reward.points_cost,
        status="pending"
    )
    
    if reward.stock_quantity is not None:
        reward.stock_quantity -= 1
    
    db.add(redemption_record)
    await db.commit()
    await db.refresh(redemption_record)
    
    return RewardRedemptionResponse(
        id=str(redemption_record.id),
        user_id=str(current_user.id),
        reward_id=str(reward.id),
        reward_name=reward.name,
        points_spent=reward.points_cost,
        remaining_points=gamification.total_points,
        status=redemption_record.status,
        redeemed_at=redemption_record.redeemed_at,
        fulfillment_details=None
    )
