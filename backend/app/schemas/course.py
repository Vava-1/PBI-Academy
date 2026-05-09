"""Course schemas."""
from typing import Optional, List
from decimal import Decimal
from pydantic import Field

from app.schemas.base import BaseSchema, TimestampSchema, IDSchema
from app.constants import CourseCategory, Language, ProficiencyLevel


class CourseBase(BaseSchema):
    """Base course schema."""
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    category: CourseCategory
    language: Optional[Language] = None
    difficulty: ProficiencyLevel
    estimated_hours: int = Field(default=0, ge=0)
    price: Decimal = Field(default=Decimal("0.00"), decimal_places=2)


class CourseCreate(CourseBase):
    """Course creation schema."""
    instructor_id: str
    slug: Optional[str] = None
    metadata: dict = {}
    is_published: bool = False


class CourseUpdate(BaseSchema):
    """Course update schema."""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    price: Optional[Decimal] = None
    difficulty: Optional[ProficiencyLevel] = None
    estimated_hours: Optional[int] = Field(None, ge=0)
    is_published: Optional[bool] = None
    metadata: Optional[dict] = None


class LessonSchema(BaseSchema, IDSchema):
    """Lesson schema."""
    title: str
    order_index: int
    video_url: Optional[str] = None
    content: Optional[str] = None
    resources: dict = {}
    duration_seconds: int = 0


class ModuleSchema(BaseSchema, IDSchema):
    """Module schema."""
    title: str
    order_index: int
    module_type: str
    estimated_minutes: int
    lessons: List[LessonSchema] = []


class CourseResponse(CourseBase, TimestampSchema, IDSchema):
    """Course response schema."""
    slug: str
    instructor_id: str
    is_published: bool
    modules: List[ModuleSchema] = []
    
    class Config:
        from_attributes = True


class CourseListResponse(BaseSchema):
    """Course list item."""
    id: str
    title: str
    slug: str
    category: CourseCategory
    language: Optional[Language]
    difficulty: ProficiencyLevel
    price: Decimal
    estimated_hours: int
    is_published: bool


class EnrollmentResponse(BaseSchema, TimestampSchema, IDSchema):
    """Enrollment response."""
    user_id: str
    course_id: str
    status: str
    progress_percent: Decimal
    enrolled_at: datetime
    completed_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class EnrollmentCreate(BaseSchema):
    """Enrollment creation."""
    course_id: str


class ProgressUpdate(BaseSchema):
    """Progress update."""
    progress_percent: float = Field(..., ge=0, le=100)
