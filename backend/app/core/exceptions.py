"""Custom exception classes for the application."""
from fastapi import HTTPException, status


class PBIException(Exception):
    """Base exception for the application."""
    pass


class AuthenticationError(HTTPException):
    """Authentication related errors."""
    def __init__(self, detail: str = "Authentication failed"):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            headers={"WWW-Authenticate": "Bearer"}
        )


class AuthorizationError(HTTPException):
    """Authorization/permission errors."""
    def __init__(self, detail: str = "Insufficient permissions"):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=detail
        )


class NotFoundError(HTTPException):
    """Resource not found errors."""
    def __init__(self, detail: str = "Resource not found"):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=detail
        )


class ValidationError(HTTPException):
    """Validation errors."""
    def __init__(self, detail: str = "Validation failed"):
        super().__init__(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=detail
        )


class ConflictError(HTTPException):
    """Resource conflict errors."""
    def __init__(self, detail: str = "Resource conflict"):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail=detail
        )


class RateLimitError(HTTPException):
    """Rate limiting errors."""
    def __init__(self, detail: str = "Rate limit exceeded"):
        super().__init__(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=detail
        )


class AIProcessingError(PBIException):
    """AI service processing errors."""
    def __init__(self, message: str = "AI processing failed"):
        self.message = message
        super().__init__(self.message)


class ExamSessionError(PBIException):
    """Exam session related errors."""
    def __init__(self, message: str = "Exam session error"):
        self.message = message
        super().__init__(self.message)
