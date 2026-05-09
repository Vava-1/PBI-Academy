"""Course, Module, Lesson models."""
import uuid
from datetime import datetime, timezone
from typing import Optional, List

from sqlalchemy import String, ForeignKey, Enum, Text, Boolean, DateTime, Integer, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import JSON

from app.models.base import Base, TimestampMixin, UUIDMixin
from app.constants import CourseCategory, Language, ProficiencyLevel, EnrollmentStatus


class Course(UUIDMixin, TimestampMixin, Base):
    """Course model."""
    
    __tablename__ = "courses"
    
    title: Mapped[str] = mapped_column(String(255))
    slug: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    category: Mapped[CourseCategory] = mapped_column(Enum(CourseCategory))
    language: Mapped[Optional[Language]] = mapped_column(Enum(Language), nullable=True)
    
    instructor_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))
    price: Mapped[float] = mapped_column(Numeric(10, 2), default=0.0)
    
    difficulty: Mapped[ProficiencyLevel] = mapped_column(Enum(ProficiencyLevel))
    estimated_hours: Mapped[int] = mapped_column(Integer, default=0)
    
    course_metadata: Mapped[dict] = mapped_column(JSON, default=dict)
    is_published: Mapped[bool] = mapped_column(Boolean, default=False)
    
    # Relationships
    modules: Mapped[List["Module"]] = relationship(back_populates="course")
    enrollments: Mapped[List["Enrollment"]] = relationship(back_populates="course")
    
    def __repr__(self) -> str:
        return f"<Course {self.title}>"


class Module(UUIDMixin, Base):
    """Course module model."""
    
    __tablename__ = "modules"
    
    course_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("courses.id"))
    title: Mapped[str] = mapped_column(String(255))
    order_index: Mapped[int] = mapped_column(Integer, default=0)
    module_type: Mapped[str] = mapped_column(String(50), default="video")
    estimated_minutes: Mapped[int] = mapped_column(Integer, default=0)
    
    # Relationships
    course: Mapped["Course"] = relationship(back_populates="modules")
    lessons: Mapped[List["Lesson"]] = relationship(back_populates="module")
    
    def __repr__(self) -> str:
        return f"<Module {self.title}>"


class Lesson(UUIDMixin, Base):
    """Lesson model."""
    
    __tablename__ = "lessons"
    
    module_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("modules.id"))
    title: Mapped[str] = mapped_column(String(255))
    order_index: Mapped[int] = mapped_column(Integer, default=0)
    
    video_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    content: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    resources: Mapped[dict] = mapped_column(JSON, default=dict)
    duration_seconds: Mapped[int] = mapped_column(Integer, default=0)
    
    # Relationships
    module: Mapped["Module"] = relationship(back_populates="lessons")
    
    def __repr__(self) -> str:
        return f"<Lesson {self.title}>"


class Enrollment(UUIDMixin, Base):
    """User enrollment in courses."""
    
    __tablename__ = "enrollments"
    
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))
    course_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("courses.id"))
    
    status: Mapped[EnrollmentStatus] = mapped_column(Enum(EnrollmentStatus), default=EnrollmentStatus.ACTIVE)
    enrolled_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    progress_percent: Mapped[float] = mapped_column(Numeric(5, 2), default=0.0)
    
    # Relationships
    user: Mapped["User"] = relationship(back_populates="enrollments")
    course: Mapped["Course"] = relationship(back_populates="enrollments")
    
    def __repr__(self) -> str:
        return f"<Enrollment {self.user_id} - {self.course_id}>"


class Assignment(UUIDMixin, TimestampMixin, Base):
    """Assignment model."""
    
    __tablename__ = "assignments"
    
    course_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("courses.id"))
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    due_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    max_points: Mapped[int] = mapped_column(Integer, default=100)
    assignment_type: Mapped[str] = mapped_column(String(50), default="regular")
    
    def __repr__(self) -> str:
        return f"<Assignment {self.title}>"
