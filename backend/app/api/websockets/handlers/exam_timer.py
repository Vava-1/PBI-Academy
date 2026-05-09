"""Exam timer WebSocket handler."""
import asyncio
import json
from datetime import datetime, timezone

from fastapi import WebSocket, WebSocketDisconnect
from sqlalchemy import select

from app.api.deps import get_db_session
from app.cache.redis_client import RedisCache
from app.models.mock_exam import MockExamAttempt, MockExam


async def exam_timer_ws(websocket: WebSocket, attempt_id: str):
    """WebSocket for real-time exam timer."""
    await websocket.accept()
    
    redis = RedisCache()
    
    try:
        # Get attempt details
        from app.db.session import async_session
        async with async_session() as db:
            result = await db.execute(
                select(MockExamAttempt)
                .join(MockExam)
                .where(MockExamAttempt.id == attempt_id)
            )
            attempt = result.scalar_one_or_none()
            
            if not attempt or attempt.status != "in_progress":
                await websocket.send_json({
                    "type": "error",
                    "message": "Exam not active"
                })
                await websocket.close()
                return
            
            exam_duration = attempt.exam.total_duration_minutes * 60
            started_at = attempt.started_at
            
            # Calculate remaining time
            elapsed = (datetime.now(timezone.utc) - started_at).total_seconds()
            remaining = max(0, exam_duration - elapsed)
        
        # Send initial time
        await websocket.send_json({
            "type": "TIMER_SYNC",
            "attempt_id": attempt_id,
            "remaining_seconds": int(remaining),
            "total_duration": exam_duration,
            "elapsed_seconds": int(elapsed)
        })
        
        # Timer loop
        while remaining > 0:
            await asyncio.sleep(1)
            
            elapsed = (datetime.now(timezone.utc) - started_at).total_seconds()
            remaining = max(0, exam_duration - elapsed)
            
            # Send update every 5 seconds
            if int(elapsed) % 5 == 0:
                await websocket.send_json({
                    "type": "TIMER_SYNC",
                    "attempt_id": attempt_id,
                    "remaining_seconds": int(remaining),
                    "elapsed_seconds": int(elapsed)
                })
            
            # Warning at 5 minutes remaining
            if remaining <= 300 and remaining > 295:
                await websocket.send_json({
                    "type": "TIME_WARNING",
                    "attempt_id": attempt_id,
                    "warning": "5_minutes_left",
                    "remaining_seconds": int(remaining)
                })
            
            # Warning at 1 minute remaining
            if remaining <= 60 and remaining > 55:
                await websocket.send_json({
                    "type": "TIME_WARNING",
                    "attempt_id": attempt_id,
                    "warning": "1_minute_left",
                    "remaining_seconds": int(remaining)
                })
        
        # Time's up
        await websocket.send_json({
            "type": "AUTO_SUBMIT",
            "attempt_id": attempt_id,
            "message": "Time expired. Your exam will be submitted automatically."
        })
        
    except WebSocketDisconnect:
        pass
    except Exception as e:
        await websocket.send_json({
            "type": "error",
            "message": str(e)
        })
    finally:
        try:
            await websocket.close()
        except:
            pass
