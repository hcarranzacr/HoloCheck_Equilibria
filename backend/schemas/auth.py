"""
Authentication schemas
"""
from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime


class UserResponse(BaseModel):
    """User response from authentication"""
    id: str
    email: str
    name: Optional[str] = None
    role: str = "user"
    last_login: Optional[datetime] = None
    user_metadata: Dict[str, Any] = {}
    app_metadata: Dict[str, Any] = {}
    created_at: str = ""
    organization_id: Optional[str] = None
    
    class Config:
        from_attributes = True


class PlatformTokenExchangeRequest(BaseModel):
    """Request body for exchanging Platform token for app token."""
    platform_token: str


class TokenExchangeResponse(BaseModel):
    """Response body for issued application token."""
    token: str


class LoginRequest(BaseModel):
    """Login request"""
    email: str
    password: str


class LoginResponse(BaseModel):
    """Login response"""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse