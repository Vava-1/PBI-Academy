"""AI Evaluator endpoints for grading exam responses."""
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.api.deps import get_db_session, get_current_user
from app.models.user import User
from app.models.mock_exam import MockExamAttempt, ExamSection, AIGradedResponse, AIFeedback
from app.schemas.exam import GradingRequest, GradingResponse, RubricScore
from app.constants import ExamType, ResponseType
from app.services.ai.evaluator import ExamEvaluator

router = APIRouter()


@router.post("/grade", response_model=GradingResponse)
async def grade_response(
    attempt_id: str = Form(...),
    section_id: str = Form(...),
    exam_type: str = Form(...),
    response_type: str = Form(...),
    text_response: str = Form(None),
    audio_file: UploadFile = File(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    """Grade a student response using AI."""
    # Verify attempt ownership
    result = await db.execute(
        select(MockExamAttempt).where(
            MockExamAttempt.id == attempt_id,
            MockExamAttempt.user_id == current_user.id
        )
    )
    attempt = result.scalar_one_or_none()
    
    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt not found")
    
    # Get section details
    section_result = await db.execute(
        select(ExamSection).where(ExamSection.id == section_id)
    )
    section = section_result.scalar_one_or_none()
    
    if not section:
        raise HTTPException(status_code=404, detail="Section not found")
    
    # Process audio if provided
    audio_url = None
    if audio_file and response_type == "speaking_audio":
        # Save audio file
        import os
        from app.config import settings
        
        upload_dir = settings.upload_dir
        os.makedirs(upload_dir, exist_ok=True)
        
        file_path = os.path.join(upload_dir, f"{attempt_id}_{section_id}.webm")
        with open(file_path, "wb") as f:
            content = await audio_file.read()
            f.write(content)
        
        audio_url = file_path
    
    # Evaluate response
    evaluator = ExamEvaluator()
    
    try:
        exam_type_enum = ExamType(exam_type.lower())
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid exam type")
    
    try:
        evaluation = await evaluator.evaluate(
            exam_type=exam_type_enum,
            section_type=section.section_type,
            response_type=ResponseType(response_type),
            student_response=text_response,
            audio_url=audio_url
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Evaluation failed: {str(e)}")
    
    # Save graded response
    graded_response = AIGradedResponse(
        attempt_id=attempt_id,
        section_id=section_id,
        response_type=ResponseType(response_type),
        student_response=text_response,
        audio_url=audio_url,
        ai_score=evaluation["overall_score"],
        rubric_breakdown={
            "breakdown": [
                {"dimension": r.dimension, "score": r.score, "max": r.max_score}
                for r in evaluation["score_breakdown"]
            ]
        },
        model_version="1.0"
    )
    
    db.add(graded_response)
    await db.flush()
    
    # Save detailed feedback
    feedback = AIFeedback(
        graded_response_id=graded_response.id,
        detailed_feedback=evaluation["feedback"]["summary"],
        improvement_suggestions={"suggestions": evaluation["feedback"]["improvement_plan"]},
        grammar_corrections=evaluation["grammar_analysis"],
        vocabulary_assessment=evaluation["vocabulary_analysis"],
        coherence_analysis=evaluation["feedback"].get("coherence", {})
    )
    
    db.add(feedback)
    await db.commit()
    
    return GradingResponse(
        overall_score=evaluation["overall_score"],
        max_score=evaluation["max_score"],
        score_breakdown=evaluation["score_breakdown"],
        cefr_level=evaluation["cefr_level"],
        estimated_exam_score=evaluation.get("estimated_exam_score"),
        feedback=evaluation["feedback"],
        grammar_analysis=evaluation["grammar_analysis"],
        vocabulary_analysis=evaluation["vocabulary_analysis"],
        time_analysis=evaluation.get("time_analysis", {}),
        graded_at=datetime.now(timezone.utc),
        model_version="1.0"
    )


@router.get("/feedback/{graded_response_id}")
async def get_grading_feedback(
    graded_response_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    """Get detailed feedback for a graded response."""
    from sqlalchemy.orm import joinedload
    
    result = await db.execute(
        select(AIGradedResponse)
        .options(joinedload(AIGradedResponse.feedback))
        .options(joinedload(AIGradedResponse.attempt))
        .where(AIGradedResponse.id == graded_response_id)
    )
    graded = result.scalar_one_or_none()
    
    if not graded or str(graded.attempt.user_id) != str(current_user.id):
        raise HTTPException(status_code=404, detail="Graded response not found")
    
    return {
        "graded_response_id": str(graded.id),
        "overall_score": graded.ai_score,
        "score_breakdown": graded.rubric_breakdown,
        "detailed_feedback": graded.feedback.detailed_feedback if graded.feedback else None,
        "improvement_suggestions": graded.feedback.improvement_suggestions if graded.feedback else None,
        "grammar_analysis": graded.feedback.grammar_corrections if graded.feedback else None,
        "vocabulary_analysis": graded.feedback.vocabulary_assessment if graded.feedback else None
    }
