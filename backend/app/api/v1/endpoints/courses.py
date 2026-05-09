"""Course management endpoints."""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload

from app.api.deps import get_db_session, get_current_user, require_instructor
from app.models.course import Course, Module, Lesson, Enrollment
from app.models.user import User
from app.schemas.course import (
    CourseCreate, 
    CourseResponse, 
    CourseUpdate,
    CourseListResponse,
    EnrollmentCreate,
    EnrollmentResponse,
    ProgressUpdate
)
from app.constants import EnrollmentStatus

router = APIRouter()


@router.get("/", response_model=List[CourseListResponse])
async def list_courses(
    category: str = None,
    language: str = None,
    difficulty: str = None,
    is_published: bool = True,
    skip: int = 0,
    limit: int = 20,
    db: AsyncSession = Depends(get_db_session)
):
    """List courses with filters."""
    query = select(Course).where(Course.is_published == is_published)
    
    if category:
        query = query.where(Course.category == category)
    if language:
        query = query.where(Course.language == language)
    if difficulty:
        query = query.where(Course.difficulty == difficulty)
    
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    courses = result.scalars().all()
    
    return [
        CourseListResponse(
            id=str(c.id),
            title=c.title,
            slug=c.slug,
            category=c.category,
            language=c.language,
            difficulty=c.difficulty,
            price=c.price,
            estimated_hours=c.estimated_hours,
            is_published=c.is_published
        )
        for c in courses
    ]


@router.get("/{course_id}", response_model=CourseResponse)
async def get_course(
    course_id: str,
    db: AsyncSession = Depends(get_db_session)
):
    """Get course details with modules."""
    result = await db.execute(
        select(Course)
        .options(selectinload(Course.modules).selectinload(Module.lessons))
        .where(Course.id == course_id)
    )
    course = result.scalar_one_or_none()
    
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )
    
    return course


@router.post("/", response_model=CourseResponse, status_code=status.HTTP_201_CREATED)
async def create_course(
    course_data: CourseCreate,
    current_user: User = Depends(require_instructor),
    db: AsyncSession = Depends(get_db_session)
):
    """Create a new course (instructor only)."""
    # Generate slug if not provided
    import re
    slug = course_data.slug or re.sub(r'[^a-z0-9]+', '-', course_data.title.lower()).strip('-')
    
    # Check slug uniqueness
    existing = await db.execute(select(Course).where(Course.slug == slug))
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Course with this slug already exists"
        )
    
    course = Course(
        title=course_data.title,
        slug=slug,
        description=course_data.description,
        category=course_data.category,
        language=course_data.language,
        instructor_id=current_user.id,
        price=course_data.price,
        difficulty=course_data.difficulty,
        estimated_hours=course_data.estimated_hours,
        metadata=course_data.metadata,
        is_published=course_data.is_published
    )
    
    db.add(course)
    await db.commit()
    await db.refresh(course)
    
    return course


@router.post("/{course_id}/enroll", response_model=EnrollmentResponse)
async def enroll_in_course(
    course_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    """Enroll current user in a course."""
    # Check if already enrolled
    existing = await db.execute(
        select(Enrollment).where(
            and_(
                Enrollment.user_id == current_user.id,
                Enrollment.course_id == course_id
            )
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Already enrolled in this course"
        )
    
    enrollment = Enrollment(
        user_id=current_user.id,
        course_id=course_id,
        status=EnrollmentStatus.ACTIVE,
        progress_percent=0.0
    )
    
    db.add(enrollment)
    await db.commit()
    await db.refresh(enrollment)
    
    return enrollment


@router.get("/enrolled/my", response_model=List[EnrollmentResponse])
async def get_my_enrollments(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    """Get current user's enrollments."""
    result = await db.execute(
        select(Enrollment)
        .options(selectinload(Enrollment.course))
        .where(Enrollment.user_id == current_user.id)
    )
    enrollments = result.scalars().all()
    return enrollments


@router.patch("/enrollments/{enrollment_id}/progress", response_model=EnrollmentResponse)
async def update_progress(
    enrollment_id: str,
    progress: ProgressUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    """Update course progress."""
    result = await db.execute(
        select(Enrollment).where(
            and_(
                Enrollment.id == enrollment_id,
                Enrollment.user_id == current_user.id
            )
        )
    )
    enrollment = result.scalar_one_or_none()
    
    if not enrollment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Enrollment not found"
        )
    
    enrollment.progress_percent = progress.progress_percent
    
    if progress.progress_percent >= 100:
        enrollment.status = EnrollmentStatus.COMPLETED
        from datetime import datetime, timezone
        enrollment.completed_at = datetime.now(timezone.utc)
    
    await db.commit()
    await db.refresh(enrollment)
    
    return enrollment
