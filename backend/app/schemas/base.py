"""Base schemas."""
from datetime import datetime
from typing import Generic, TypeVar, List, Optional
from pydantic import BaseModel, ConfigDict


class BaseSchema(BaseModel):
    """Base schema with common configuration."""
    
    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True,
        str_strip_whitespace=True
    )


class PaginationParams(BaseSchema):
    """Pagination parameters."""
    page: int = 1
    per_page: int = 20
    
    @property
    def offset(self) -> int:
        return (self.page - 1) * self.per_page


T = TypeVar("T")


class PaginatedResponse(BaseSchema, Generic[T]):
    """Paginated response wrapper."""
    items: List[T]
    total: int
    page: int
    per_page: int
    pages: int
    
    @classmethod
    def create(
        cls,
        items: List[T],
        total: int,
        page: int,
        per_page: int
    ) -> "PaginatedResponse[T]":
        pages = (total + per_page - 1) // per_page if per_page > 0 else 1
        return cls(
            items=items,
            total=total,
            page=page,
            per_page=per_page,
            pages=pages
        )


class TimestampSchema(BaseModel):
    """Mixin for timestamp fields."""
    model_config = ConfigDict(from_attributes=True)
    created_at: datetime
    updated_at: Optional[datetime] = None


class IDSchema(BaseModel):
    """Mixin for ID field."""
    id: str
