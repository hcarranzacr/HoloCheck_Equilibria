"""
Authentication schemas
"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class UserResponse(BaseModel):
    """User response model from Supabase Auth"""
    id: str
    email: str
    phone: Optional[str] = None
    email_confirmed_at: Optional[datetime] = None
    phone_confirmed_at: Optional[datetime] = None
    last_sign_in_at: Optional[datetime] = None
    created_at: Optional[datetime] = None  # ✅ FIXED: Changed from str to Optional[datetime]
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True