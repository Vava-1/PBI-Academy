"""AI services API module."""
from fastapi import APIRouter

from app.api.v1.ai.endpoints import tutor, evaluator, analytics, quiz_generator

router = APIRouter()

router.include_router(tutor.router, prefix="/tutor", tags=["AI Tutor"])
router.include_router(evaluator.router, prefix="/evaluator", tags=["AI Evaluator"])
router.include_router(analytics.router, prefix="/analytics", tags=["AI Analytics"])
router.include_router(quiz_generator.router, prefix="/quiz", tags=["AI Quiz Generator"])
