"""AI Tutor endpoints."""
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.api.deps import get_db_session, get_current_user
from app.models.user import User
from app.models.ai import AITutorSession
from app.schemas.ai import TutorRequest, TutorResponse, TutorSessionResponse
from app.services.ai.llm_client import LLMClient

router = APIRouter()


@router.post("/chat", response_model=TutorResponse)
async def chat_with_tutor(
    request: TutorRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    """Chat with AI tutor."""
    # Get or create session
    if request.session_id:
        result = await db.execute(
            select(AITutorSession)
            .where(
                AITutorSession.id == request.session_id,
                AITutorSession.user_id == current_user.id
            )
        )
        session = result.scalar_one_or_none()
    else:
        session = None
    
    if not session:
        session = AITutorSession(
            user_id=current_user.id,
            context_type=request.context_type,
            context_id=request.context_id,
            message_history={"messages": []}
        )
        db.add(session)
        await db.commit()
        await db.refresh(session)
    
    # Add user message to history
    messages = session.message_history.get("messages", [])
    messages.append({
        "role": "user",
        "content": request.message,
        "timestamp": datetime.now(timezone.utc).isoformat()
    })
    
    # Call LLM
    llm_client = LLMClient()
    
    system_prompt = """You are an expert AI tutor for Pacemaker Business Institute, an AI-powered learning management system.
You specialize in helping students with:
- Language learning (English, French, German, Swahili)
- Tech skills and programming
- Exam preparation (TOEFL, Duolingo, TCF)

Guidelines:
- Provide clear, accurate explanations
- Encourage critical thinking
- Suggest practice exercises when appropriate
- Be supportive and motivating
- If asked about specific course content, reference the context provided
- For exam prep, provide strategies and tips specific to the test format
- Keep responses concise but thorough
"""
    
    try:
        response_text = await llm_client.chat_completion(
            messages=[{"role": "system", "content": system_prompt}] + [
                {"role": m["role"], "content": m["content"]} 
                for m in messages[-10:]  # Last 10 messages for context
            ],
            temperature=0.7
        )
    except Exception as e:
        response_text = f"I apologize, but I'm having trouble processing your request. Please try again. (Error: {str(e)})"
    
    # Add assistant response to history
    messages.append({
        "role": "assistant",
        "content": response_text,
        "timestamp": datetime.now(timezone.utc).isoformat()
    })
    
    session.message_history = {"messages": messages}
    await db.commit()
    
    # Generate suggested follow-up questions
    suggested_questions = []
    if "exam" in request.message.lower() or "test" in request.message.lower():
        suggested_questions = [
            "What are the best strategies for time management?",
            "Can you explain the scoring criteria?",
            "What are common mistakes to avoid?"
        ]
    elif "grammar" in request.message.lower() or "vocabulary" in request.message.lower():
        suggested_questions = [
            "Can you give me more examples?",
            "What exercises should I practice?",
            "How does this compare to [related topic]?"
        ]
    
    return TutorResponse(
        session_id=str(session.id),
        message=response_text,
        suggested_questions=suggested_questions[:3],
        context_references=[],
        streaming=False
    )


@router.get("/sessions", response_model=List[TutorSessionResponse])
async def list_tutor_sessions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
    limit: int = 10
):
    """List user's tutor sessions."""
    result = await db.execute(
        select(AITutorSession)
        .where(AITutorSession.user_id == current_user.id)
        .order_by(desc(AITutorSession.started_at))
        .limit(limit)
    )
    sessions = result.scalars().all()
    
    return [
        TutorSessionResponse(
            id=str(s.id),
            user_id=str(s.user_id),
            started_at=s.started_at,
            ended_at=s.ended_at,
            message_count=len(s.message_history.get("messages", [])),
            context_type=s.context_type
        )
        for s in sessions
    ]


@router.get("/sessions/{session_id}/history")
async def get_session_history(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    """Get session message history."""
    result = await db.execute(
        select(AITutorSession)
        .where(
            AITutorSession.id == session_id,
            AITutorSession.user_id == current_user.id
        )
    )
    session = result.scalar_one_or_none()
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return {
        "session_id": session_id,
        "messages": session.message_history.get("messages", []),
        "context_type": session.context_type
    }
