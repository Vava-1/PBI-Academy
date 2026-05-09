"""Gamification schemas."""
from datetime import datetime, date
from typing import Optional, List, Dict, Any
from pydantic import Field

from app.schemas.base import BaseSchema, TimestampSchema, IDSchema
from app.constants import AchievementType, RewardType


class StreakInfo(BaseSchema):
    """Streak information."""
    current_streak_days: int
    longest_streak_days: int
    last_activity_date: Optional[date] = None
    streak_at_risk: bool = False


class PointsInfo(BaseSchema):
    """Points information."""
    total_points: int
    level: int
    experience_points: int
    points_to_next_level: int
    progress_percent: float


class GamificationResponse(BaseSchema, IDSchema):
    """Gamification metrics response."""
    user_id: str
    points: PointsInfo
    streak: StreakInfo
    badges_earned: List[str]
    recent_achievements: List[str]
    
    class Config:
        from_attributes = True


class LeaderboardEntry(BaseSchema):
    """Leaderboard entry."""
    rank: int
    user_id: str
    display_name: str
    avatar_url: Optional[str] = None
    total_points: int
    level: int
    current_streak: int
    is_current_user: bool = False


class LeaderboardResponse(BaseSchema):
    """Leaderboard response."""
    type: str  # global, friends, weekly, monthly
    entries: List[LeaderboardEntry]
    user_rank: Optional[int] = None
    total_participants: int
    last_updated: datetime


class AchievementResponse(BaseSchema, IDSchema):
    """Achievement/Badge response."""
    name: str
    description: str
    icon_url: Optional[str] = None
    points_reward: int
    achievement_type: AchievementType
    unlock_criteria: Dict[str, Any]
    unlocked_at: Optional[datetime] = None
    is_unlocked: bool = False
    progress_percent: Optional[float] = None
    
    class Config:
        from_attributes = True


class RewardResponse(BaseSchema, IDSchema):
    """Reward item response."""
    name: str
    description: str
    points_cost: int
    reward_type: RewardType
    reward_data: Dict[str, Any]
    stock_quantity: Optional[int] = None
    available: bool = True
    
    class Config:
        from_attributes = True


class RewardRedemptionRequest(BaseSchema):
    """Reward redemption request."""
    reward_id: str


class RewardRedemptionResponse(BaseSchema, IDSchema):
    """Reward redemption response."""
    user_id: str
    reward_id: str
    reward_name: str
    points_spent: int
    remaining_points: int
    status: str
    redeemed_at: datetime
    fulfillment_details: Optional[Dict[str, Any]] = None


class ActivityPointsBreakdown(BaseSchema):
    """Points breakdown by activity."""
    activity_type: str
    points_earned: int
    count: int
    last_earned: datetime


class PointsHistoryResponse(BaseSchema):
    """Points history response."""
    total_earned_this_month: int
    total_redeemed_this_month: int
    breakdown: List[ActivityPointsBreakdown]
    recent_transactions: List[Dict[str, Any]]
