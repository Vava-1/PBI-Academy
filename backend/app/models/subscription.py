"""Subscription and payment models."""
import uuid
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import String, ForeignKey, Enum, DateTime, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import JSON

from app.models.base import Base, TimestampMixin, UUIDMixin
from app.constants import SubscriptionPlan


class Subscription(UUIDMixin, Base):
    """User subscription model."""
    
    __tablename__ = "subscriptions"
    
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))
    
    plan_type: Mapped[SubscriptionPlan] = mapped_column(Enum(SubscriptionPlan))
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    
    status: Mapped[str] = mapped_column(String(50), default="active")
    payment_provider_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    plan_features: Mapped[dict] = mapped_column(JSON, default=dict)
    
    # Relationships
    user: Mapped["User"] = relationship(back_populates="subscriptions")
    
    def __repr__(self) -> str:
        return f"<Subscription {self.user_id} - {self.plan_type.value}>"
    
    @property
    def is_active(self) -> bool:
        """Check if subscription is currently active."""
        if self.status != "active":
            return False
        if self.expires_at and self.expires_at < datetime.now(timezone.utc):
            return False
        return True
    
    @property
    def ai_evaluations_remaining(self) -> int:
        """Get remaining AI evaluations for this billing period."""
        from app.constants import SUBSCRIPTION_FEATURES
        features = SUBSCRIPTION_FEATURES.get(self.plan_type, {})
        return features.get("ai_evaluations_per_month", 0)
