"""
Custom exception classes for authentication and authorization.
"""


class IDTokenValidationError(Exception):
    """Custom exception for ID token validation errors."""

    def __init__(self, message: str, error_type: str = "validation_error"):
        self.message = message
        self.error_type = error_type
        super().__init__(self.message)


class AccessTokenError(Exception):
    """Custom exception for application JWT access token errors."""

    def __init__(self, message: str):
        self.message = message
        super().__init__(self.message)