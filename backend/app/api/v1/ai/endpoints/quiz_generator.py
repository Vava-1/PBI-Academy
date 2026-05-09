"""AI Quiz Generator endpoints."""
from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db_session, get_current_user
from app.models.user import User
from app.models.ai import Quiz, QuizAttempt
from app.schemas.ai import QuizRequest, QuizResponse, QuizQuestion, QuizSubmission, QuizResult
from app.services.ai.llm_client import LLMClient

router = APIRouter()


@router.post("/generate", response_model=QuizResponse)
async def generate_quiz(
    request: QuizRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    """Generate an adaptive quiz."""
    # Determine difficulty and topics
    if request.difficulty == "adaptive":
        # Would query AI analytics to determine appropriate difficulty
        difficulty = "medium"
    else:
        difficulty = request.difficulty
    
    topic = request.topic or "General Knowledge"
    
    # Generate questions using LLM
    llm_client = LLMClient()
    
    prompt = f"""Generate {request.num_questions} multiple-choice quiz questions about {topic}.
    Difficulty level: {difficulty}
    
    For each question, provide:
    - Question text
    - 4 answer options (A, B, C, D)
    - Correct answer letter
    - Brief explanation
    
    Format as JSON array with fields: id, question_text, options (array), correct_answer, explanation, difficulty
    """
    
    try:
        response = await llm_client.chat_completion(
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7
        )
        
        # Parse questions from response
        import json
        import re
        
        # Extract JSON from response
        json_match = re.search(r'\[.*\]', response, re.DOTALL)
        if json_match:
            questions_data = json.loads(json_match.group())
        else:
            # Fallback to mock questions
            questions_data = generate_mock_questions(request.num_questions, topic, difficulty)
    except Exception as e:
        # Fallback to mock questions
        questions_data = generate_mock_questions(request.num_questions, topic, difficulty)
    
    questions = [
        QuizQuestion(
            id=f"q{i+1}",
            question_type="multiple_choice",
            question_text=q.get("question_text", q.get("question", "Question")),
            options=q.get("options", ["A", "B", "C", "D"]),
            correct_answer=q.get("correct_answer", "A"),
            difficulty=q.get("difficulty", difficulty),
            explanation=q.get("explanation", "")
        )
        for i, q in enumerate(questions_data[:request.num_questions])
    ]
    
    # Save quiz
    quiz = Quiz(
        module_id=request.module_id,
        title=f"Adaptive Quiz - {topic}",
        adaptive_level=difficulty,
        time_limit_minutes=max(5, request.num_questions * 2),
        question_pool={"questions": [q.model_dump() for q in questions]}
    )
    
    db.add(quiz)
    await db.commit()
    await db.refresh(quiz)
    
    return QuizResponse(
        id=str(quiz.id),
        title=quiz.title,
        questions=questions,
        time_limit_minutes=quiz.time_limit_minutes,
        total_points=len(questions) * 10,
        adaptive_level=difficulty
    )


def generate_mock_questions(num: int, topic: str, difficulty: str) -> List[dict]:
    """Generate mock questions when LLM fails."""
    questions = []
    for i in range(num):
        questions.append({
            "id": f"q{i+1}",
            "question_text": f"Sample question {i+1} about {topic}?",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correct_answer": "A",
            "difficulty": difficulty,
            "explanation": f"Explanation for question {i+1}"
        })
    return questions


@router.post("/{quiz_id}/submit", response_model=QuizResult)
async def submit_quiz(
    quiz_id: str,
    submission: QuizSubmission,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    """Submit quiz answers and get results."""
    from sqlalchemy import select
    
    # Get quiz
    result = await db.execute(select(Quiz).where(Quiz.id == quiz_id))
    quiz = result.scalar_one_or_none()
    
    if not quiz:
        return QuizResult(
            id="error",
            quiz_id=quiz_id,
            score=0,
            max_score=0,
            percentage=0,
            correct_answers=0,
            total_questions=0,
            time_taken_seconds=0,
            weak_topics=[],
            recommended_review=[],
            completed_at=datetime.now(timezone.utc)
        )
    
    # Calculate score
    questions = quiz.question_pool.get("questions", [])
    correct = 0
    total_time = sum(a.time_spent_seconds for a in submission.answers)
    
    answer_map = {a.question_id: a.answer for a in submission.answers}
    wrong_topics = []
    
    for q in questions:
        q_id = q.get("id", "")
        correct_answer = q.get("correct_answer", "")
        user_answer = answer_map.get(q_id, "")
        
        if user_answer.upper() == correct_answer.upper():
            correct += 1
        else:
            wrong_topics.append(q.get("difficulty", "general"))
    
    total_questions = len(questions)
    score = correct * 10  # 10 points per question
    max_score = total_questions * 10
    percentage = (correct / total_questions * 100) if total_questions > 0 else 0
    
    # Save attempt
    attempt = QuizAttempt(
        quiz_id=quiz_id,
        user_id=current_user.id,
        responses={"answers": [a.model_dump() for a in submission.answers]},
        score=score,
        time_taken_seconds=total_time
    )
    
    db.add(attempt)
    await db.commit()
    
    # Generate recommendations
    recommendations = []
    if percentage < 60:
        recommendations.append("Review fundamental concepts")
        recommendations.append("Practice similar questions")
    elif percentage < 80:
        recommendations.append("Focus on challenging topics")
    else:
        recommendations.append("Great job! Try advanced questions")
    
    return QuizResult(
        id=str(attempt.id),
        quiz_id=quiz_id,
        score=score,
        max_score=max_score,
        percentage=round(percentage, 1),
        correct_answers=correct,
        total_questions=total_questions,
        time_taken_seconds=total_time,
        weak_topics=list(set(wrong_topics)) if wrong_topics else [],
        recommended_review=recommendations,
        completed_at=datetime.now(timezone.utc)
    )
