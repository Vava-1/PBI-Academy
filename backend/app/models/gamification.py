"""Gamification models."""
import uuid
from datetime import datetime, date, timezone
from typing import Optional, List

from sqlalchemy import String, ForeignKey, Text, DateTime, Integer, Date, Numeric, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import JSON

from app.models.base import Base, TimestampMixin, UUIDMixin
from app.constants import AchievementType, RewardType


class GamificationMetrics(UUIDMixin, Base):
    """User gamification metrics and points."""
    
    __tablename__ = "gamification_metrics"
    
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), 
        ForeignKey("users.id"),
        unique=True
    )
    
    total_points: Mapped[int] = mapped_column(Integer, default=0)
    current_streak_days: Mapped[int] = mapped_column(Integer, default=0)
    longest_streak_days: Mapped[int] = mapped_column(Integer, default=0)
    last_activity_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    
    level: Mapped[int] = mapped_column(Integer, default=1)
    experience_points: Mapped[int] = mapped_column(Integer, default=0)
    
    badges_earned: Mapped[dict] = mapped_column(JSON, default=dict)
    leaderboard_stats: Mapped[dict] = mapped_column(JSON, default=dict)
    
    # Relationships
    user: Mapped["User"] = relationship(back_populates="gamification")
    
    def __repr__(self) -> str:
        return f"<GamificationMetrics {self.user_id} - Level: {self.level}>"


class Achievement(UUIDMixin, Base):
    """Achievement/Badge definition."""
    
    __tablename__ = "achievements"
    
    name: Mapped[str] = mapped_column(String(255), unique=True)
    description: Mapped[str] = mapped_column(Text)
    icon_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    points_reward: Mapped[int] = mapped_column(Integer, default=0)
    achievement_type: Mapped[AchievementType] = mapped_column(Enum(AchievementType))
    unlock_criteria: Mapped[dict] = mapped_column(JSON, default=dict)
    
    # Relationships
    user_achievements: Mapped[List["UserAchievement"]] = relationship(back_populates="achievement")
    
    def __repr__(self) -> str:
        return f"<Achievement {self.name}>"


class UserAchievement(UUIDMixin, Base):
    """User's unlocked achievements."""
    
    __tablename__ = "user_achievements"
    
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))
    achievement_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("achievements.id"))
    
    unlocked_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    
    # Relationships
    achievement: Mapped["Achievement"] = relationship(back_populates="user_achievements")
    
    def __repr__(self) -> str:
        return f"<UserAchievement {self.user_id} - {self.achievement_id}>"


class Reward(UUIDMixin, Base):
    """Reward available in the store."""
    
    __tablename__ = "rewards"
    
    name: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text)
    points_cost: Mapped[int] = mapped_column(Integer)
    reward_type: Mapped[RewardType] = mapped_column(Enum(RewardType))
    reward_data: Mapped[dict] = mapped_column(JSON, default=dict)
    stock_quantity: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    
    # Relationships
    redemptions: Mapped[List["RewardsRedemption"]] = relationship(back_populates="reward")
    
    def __repr__(self) -> str:
        return f"<Reward {self.name}>"


class RewardsRedemption(UUIDMixin, Base):
    """User redemption of rewards."""
    
    __tablename__ = "rewards_redemptions"
    
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))
    reward_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("rewards.id"))
    
    points_spent: Mapped[int] = mapped_column(Integer)
    redeemed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    status: Mapped[str] = mapped_column(String(50), default="pending")
    
    # Relationships
    reward: Mapped["Reward"] = relationship(back_populates="redemptions")
    
    def __repr__(self) -> str:
        return f"<RewardsRedemption {self.user_id} - {self.reward_id}>"
