"""
Authentication schemas
"""
from pydantic import BaseModel
from typing import Optional, Dict, Any


class UserResponse(BaseModel):
    """User response from authentication"""
    id: str
    email: str
    user_metadata: Dict[str, Any] = {}
    app_metadata: Dict[str, Any] = {}
    created_at: str = ""
    organization_id: Optional[str] = None  # Added for user_profiles router
    role: Optional[str] = None  # Added for audit logging
    
    class Config:
        from_attributes = True