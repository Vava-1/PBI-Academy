"""Subscription management endpoints."""
from datetime import datetime, timedelta, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_

from app.api.deps import get_db_session, get_current_user
from app.models.subscription import Subscription
from app.models.user import User
from app.schemas.base import BaseSchema
from app.constants import SubscriptionPlan, SUBSCRIPTION_FEATURES

router = APIRouter()


class SubscriptionResponse(BaseSchema):
    """Subscription response."""
    id: str
    plan_type: str
    status: str
    started_at: datetime
    expires_at: Optional[datetime] = None
    features: dict
    ai_evaluations_remaining: int
    is_active: bool


class PlanComparison(BaseSchema):
    """Plan comparison item."""
    plan_type: str
    name: str
    monthly_price: int
    features: dict
    popular: bool = False


@router.get("/me", response_model=SubscriptionResponse)
async def get_my_subscription(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    """Get current user's subscription."""
    result = await db.execute(
        select(Subscription)
        .where(Subscription.user_id == current_user.id)
        .order_by(Subscription.created_at.desc())
    )
    subscription = result.scalar_one_or_none()
    
    if not subscription:
        # Return free plan default
        return SubscriptionResponse(
            id="free",
            plan_type="free",
            status="active",
            started_at=datetime.now(timezone.utc),
            expires_at=None,
            features=SUBSCRIPTION_FEATURES[SubscriptionPlan.FREE],
            ai_evaluations_remaining=SUBSCRIPTION_FEATURES[SubscriptionPlan.FREE]["ai_evaluations_per_month"],
            is_active=True
        )
    
    return SubscriptionResponse(
        id=str(subscription.id),
        plan_type=subscription.plan_type.value,
        status=subscription.status,
        started_at=subscription.started_at,
        expires_at=subscription.expires_at,
        features=subscription.plan_features,
        ai_evaluations_remaining=subscription.ai_evaluations_remaining,
        is_active=subscription.is_active
    )


@router.get("/plans", response_model=List[PlanComparison])
async def get_subscription_plans():
    """Get available subscription plans."""
    return [
        PlanComparison(
            plan_type="free",
            name="Free",
            monthly_price=0,
            features=SUBSCRIPTION_FEATURES[SubscriptionPlan.FREE],
            popular=False
        ),
        PlanComparison(
            plan_type="pro",
            name="Pro",
            monthly_price=19,
            features=SUBSCRIPTION_FEATURES[SubscriptionPlan.PRO],
            popular=True
        ),
        PlanComparison(
            plan_type="premium",
            name="Premium",
            monthly_price=39,
            features=SUBSCRIPTION_FEATURES[SubscriptionPlan.PREMIUM],
            popular=False
        )
    ]


@router.post("/upgrade")
async def upgrade_subscription(
    plan_type: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    """Upgrade subscription (placeholder for Stripe integration)."""
    try:
        plan = SubscriptionPlan(plan_type)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid plan type"
        )
    
    # Cancel existing subscription if any
    result = await db.execute(
        select(Subscription)
        .where(
            and_(
                Subscription.user_id == current_user.id,
                Subscription.status == "active"
            )
        )
    )
    existing = result.scalar_one_or_none()
    
    if existing:
        existing.status = "cancelled"
        existing.plan_features["cancelled_at"] = datetime.now(timezone.utc).isoformat()
    
    # Create new subscription
    expires = datetime.now(timezone.utc) + timedelta(days=30)
    
    subscription = Subscription(
        user_id=current_user.id,
        plan_type=plan,
        status="active",
        expires_at=expires,
        plan_features=SUBSCRIPTION_FEATURES.get(plan, {})
    )
    
    db.add(subscription)
    await db.commit()
    await db.refresh(subscription)
    
    return {"message": f"Upgraded to {plan.value} plan", "subscription_id": str(subscription.id)}


@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db_session)
):
    """Stripe webhook handler."""
    from app.config import settings
    
    if not settings.stripe_webhook_secret:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="Stripe not configured"
        )
    
    # In production, verify webhook signature
    # payload = await request.body()
    # sig_header = request.headers.get("stripe-signature")
    # event = stripe.Webhook.construct_event(payload, sig_header, settings.stripe_webhook_secret)
    
    # For now, return success
    return {"status": "received"}
