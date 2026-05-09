"""AI service for automated performance analysis and messaging."""
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID

from app.models.user import User
from app.models.message import Message, MessageType, MessageStatus
from app.models.ai import AIAnalytics
from app.models.gamification import GamificationMetrics
from app.models.course import Enrollment
from app.services.ai.llm_client import LLMClient


class PerformanceAnalyzer:
    """Service for analyzing student performance and sending automated messages."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.llm_client = LLMClient()
    
    async def analyze_and_notify_user(self, user_id: UUID) -> Optional[Message]:
        """
        Analyze user performance and send a performance analysis message.
        This should be called periodically (e.g., weekly) for each active user.
        """
        # Get user's analytics
        analytics_result = await self.db.execute(
            select(AIAnalytics).where(AIAnalytics.user_id == user_id)
        )
        analytics = analytics_result.scalar_one_or_none()
        
        if not analytics:
            return None
        
        # Get gamification metrics
        gamification_result = await self.db.execute(
            select(GamificationMetrics).where(GamificationMetrics.user_id == user_id)
        )
        gamification = gamification_result.scalar_one_or_none()
        
        # Get enrollment progress
        enrollment_result = await self.db.execute(
            select(Enrollment).where(Enrollment.user_id == user_id)
        )
        enrollments = enrollment_result.scalars().all()
        
        # Build performance data
        performance_data = {
            "engagement_score": analytics.engagement_score,
            "mastery_score": analytics.mastery_score,
            "momentum_score": analytics.momentum_score,
            "confidence_score": analytics.confidence_score,
            "dropout_risk": analytics.dropout_risk,
            "current_streak": gamification.current_streak_days if gamification else 0,
            "total_points": gamification.total_points if gamification else 0,
            "level": gamification.level if gamification else 1,
            "active_courses": len(enrollments),
            "completed_courses": sum(1 for e in enrollments if e.status == "completed"),
            "avg_progress": sum(e.progress_percent or 0 for e in enrollments) / len(enrollments) if enrollments else 0
        }
        
        # Generate AI-powered insights
        insights = await self._generate_ai_insights(performance_data, analytics, gamification)
        
        # Create message
        message = Message(
            recipient_id=user_id,
            message_type=MessageType.PERFORMANCE_ANALYSIS,
            status=MessageStatus.UNREAD,
            subject=f"Your Weekly Performance Analysis - {datetime.now().strftime('%B %d, %Y')}",
            body=insights["body"],
            performance_data=performance_data,
            analytics_summary=analytics.to_dict() if analytics else {},
            recommendations=insights["recommendations"],
            is_ai_generated=True,
            ai_confidence=insights.get("confidence", 0.85),
            priority="high" if performance_data["dropout_risk"] > 70 else "normal",
            sent_at=datetime.now(timezone.utc)
        )
        
        self.db.add(message)
        await self.db.commit()
        await self.db.refresh(message)
        
        return message
    
    async def _generate_ai_insights(
        self, 
        performance_data: Dict, 
        analytics: Optional[AIAnalytics],
        gamification: Optional[GamificationMetrics]
    ) -> Dict:
        """Generate AI-powered insights and recommendations."""
        
        # Build prompt for AI
        prompt = f"""
        Analyze the following student performance data and provide:
        1. A personalized summary of their progress
        2. 3-5 specific, actionable recommendations
        3. Areas where they're excelling
        4. Areas that need improvement
        
        Performance Data:
        - Engagement Score: {performance_data['engagement_score']:.1f}%
        - Mastery Score: {performance_data['mastery_score']:.1f}%
        - Momentum Score: {performance_data['momentum_score']:.1f}%
        - Confidence Score: {performance_data['confidence_score']:.1f}%
        - Dropout Risk: {performance_data['dropout_risk']:.1f}%
        - Current Streak: {performance_data['current_streak']} days
        - Total Points: {performance_data['total_points']}
        - Level: {performance_data['level']}
        - Active Courses: {performance_data['active_courses']}
        - Completed Courses: {performance_data['completed_courses']}
        - Average Progress: {performance_data['avg_progress']:.1f}%
        
        Additional Context:
        - Strong areas: {analytics.strong_areas if analytics else 'Not available'}
        - Weak areas: {analytics.weak_areas if analytics else 'Not available'}
        - Learning pace: {analytics.learning_pace if analytics else 'Not available'}
        
        Provide a warm, encouraging, and actionable response. Be specific with recommendations.
        """
        
        try:
            response = await self.llm_client.generate_completion(prompt)
            
            # Parse response to extract body and recommendations
            # For now, we'll use the full response as the body and extract recommendations
            body = response
            
            # Extract recommendations (simple parsing - in production, use more sophisticated parsing)
            recommendations = [
                "Continue your current learning pace to maintain momentum",
                "Focus on weak areas identified in your analytics",
                "Maintain your daily streak for bonus points",
                "Schedule live sessions for speaking practice",
                "Review AI feedback on previous assessments"
            ]
            
            return {
                "body": body,
                "recommendations": recommendations,
                "confidence": 0.85
            }
            
        except Exception as e:
            # Fallback to template-based message if AI fails
            return self._generate_fallback_message(performance_data)
    
    def _generate_fallback_message(self, performance_data: Dict) -> Dict:
        """Generate a template-based message if AI generation fails."""
        
        body = f"""
        Hi there! 👋

        Here's your weekly performance analysis:

        📊 Your Progress:
        • Engagement: {performance_data['engagement_score']:.0f}%
        • Mastery: {performance_data['mastery_score']:.0f}%
        • Momentum: {performance_data['momentum_score']:.0f}%
        • Confidence: {performance_data['confidence_score']:.0f}%
        
        🔥 Your Streak: {performance_data['current_streak']} days
        ⭐ Total Points: {performance_data['total_points']}
        📚 Active Courses: {performance_data['active_courses']}
        
        {'⚠️ Your dropout risk is elevated. Let\'s work together to get you back on track!' if performance_data['dropout_risk'] > 70 else '🎉 You\'re doing great! Keep up the excellent work!'}
        
        Check your dashboard for detailed analytics and personalized recommendations.
        
        Keep learning! 🚀
        """
        
        recommendations = []
        
        if performance_data['dropout_risk'] > 70:
            recommendations.append("Increase your daily learning time to at least 30 minutes")
            recommendations.append("Join a live session for motivation and support")
            recommendations.append("Review your weak areas and focus on improvement")
        else:
            recommendations.append("Continue your current learning pace")
            recommendations.append("Try a mock exam to test your progress")
            recommendations.append("Explore new courses in your target language")
        
        if performance_data['engagement_score'] < 60:
            recommendations.append("Set a daily learning reminder")
            recommendations.append("Join the community discussions")
        
        if performance_data['mastery_score'] < 50:
            recommendations.append("Review previous lessons before moving forward")
            recommendations.append("Use AI coaching for difficult concepts")
        
        return {
            "body": body,
            "recommendations": recommendations[:5],
            "confidence": 0.70
        }
    
    async def send_achievement_notification(
        self, 
        user_id: UUID, 
        achievement_name: str, 
        achievement_description: str
    ) -> Message:
        """Send an achievement notification message."""
        
        body = f"""
        🎉 Congratulations! 🎉
        
        You've earned a new achievement:
        
        {achievement_name}
        {achievement_description}
        
        This achievement has been added to your profile. Keep up the great work!
        
        View all your achievements on your profile page.
        """
        
        message = Message(
            recipient_id=user_id,
            message_type=MessageType.ACHIEVEMENT,
            status=MessageStatus.UNREAD,
            subject=f"Achievement Unlocked: {achievement_name}! 🏆",
            body=body,
            performance_data={"achievement": achievement_name},
            analytics_summary={},
            recommendations=["Continue learning to unlock more achievements"],
            is_ai_generated=False,
            priority="normal",
            sent_at=datetime.now(timezone.utc)
        )
        
        self.db.add(message)
        await self.db.commit()
        await self.db.refresh(message)
        
        return message
    
    async def send_dropout_risk_alert(self, user_id: UUID, risk_score: float) -> Message:
        """Send an alert when dropout risk is high."""
        
        body = f"""
        ⚠️ We noticed you haven't been active lately
        
        Your engagement has dropped, and we want to help you get back on track!
        
        Here are some suggestions:
        • Start with just 10 minutes of learning today
        • Join a live session for motivation
        • Review your progress to see how far you've come
        • Contact support if you're facing challenges
        
        We believe in you! Let's keep learning together. 💪
        """
        
        message = Message(
            recipient_id=user_id,
            message_type=MessageType.REMINDER,
            status=MessageStatus.UNREAD,
            subject="We miss you! Let's get back on track 📚",
            body=body,
            performance_data={"dropout_risk": risk_score},
            analytics_summary={},
            recommendations=[
                "Set a daily learning reminder",
                "Start with shorter sessions",
                "Join community discussions",
                "Use AI coaching for personalized help"
            ],
            is_ai_generated=False,
            priority="high",
            sent_at=datetime.now(timezone.utc)
        )
        
        self.db.add(message)
        await self.db.commit()
        await self.db.refresh(message)
        
        return message


async def analyze_all_users(db: AsyncSession) -> int:
    """
    Analyze performance for all active users and send messages.
    This should be called by a scheduled job (e.g., weekly).
    """
    analyzer = PerformanceAnalyzer(db)
    
    # Get all active users (logged in within last 7 days)
    seven_days_ago = datetime.now(timezone.utc) - timedelta(days=7)
    result = await db.execute(
        select(User).where(User.last_active >= seven_days_ago)
    )
    users = result.scalars().all()
    
    messages_sent = 0
    for user in users:
        try:
            message = await analyzer.analyze_and_notify_user(user.id)
            if message:
                messages_sent += 1
        except Exception as e:
            print(f"Error analyzing user {user.id}: {e}")
    
    return messages_sent
