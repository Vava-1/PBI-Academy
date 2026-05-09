"""User schemas."""
from datetime import datetime
from typing import Optional
from pydantic import EmailStr, Field

from app.schemas.base import BaseSchema, TimestampSchema, IDSchema
from app.constants import UserRole, ExamType, ProficiencyLevel


class UserBase(BaseSchema):
    """Base user schema."""
    email: EmailStr
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)


class UserCreate(UserBase):
    """User creation schema."""
    password: str = Field(..., min_length=8, max_length=100)
    role: UserRole = UserRole.STUDENT
    target_exam: Optional[ExamType] = None
    proficiency_level: ProficiencyLevel = ProficiencyLevel.BEGINNER
    referral_code: Optional[str] = None


class UserUpdate(BaseSchema):
    """User update schema."""
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    avatar_url: Optional[str] = None
    target_exam: Optional[ExamType] = None
    proficiency_level: Optional[ProficiencyLevel] = None
    preferences: Optional[dict] = None


class UserResponse(UserBase, TimestampSchema, IDSchema):
    """User response schema."""
    avatar_url: Optional[str] = None
    role: UserRole
    target_exam: Optional[ExamType] = None
    proficiency_level: ProficiencyLevel
    referral_code: str
    last_active: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class UserProfileResponse(UserResponse):
    """Extended user profile with stats."""
    total_courses: int = 0
    completed_courses: int = 0
    current_streak: int = 0
    total_points: int = 0
    level: int = 1
    subscription_plan: str = "free"


class LoginRequest(BaseSchema):
    """Login request schema."""
    email: EmailStr
    password: str


class TokenResponse(BaseSchema):
    """Token response schema."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse


class RefreshTokenRequest(BaseSchema):
    """Refresh token request."""
    refresh_token: str


class PasswordChangeRequest(BaseSchema):
    """Password change request."""
    current_password: str
    new_password: str = Field(..., min_length=8, max_length=100)
