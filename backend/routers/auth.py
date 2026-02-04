"""
Authentication routes using Supabase Auth
"""
import logging
from fastapi import APIRouter, Depends
from dependencies.auth import get_current_user
from schemas.auth import UserResponse

router = APIRouter(prefix="/api/v1/auth", tags=["authentication"])
logger = logging.getLogger(__name__)


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: UserResponse = Depends(get_current_user)):
    """Get current authenticated user info from Supabase session"""
    return current_user


@router.get("/health")
async def auth_health():
    """Auth service health check"""
    return {
        "status": "operational",
        "service": "auth",
        "provider": "supabase"
    }