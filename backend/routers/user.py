from typing import Optional

from core.database import get_db
from dependencies.auth import get_current_user
from fastapi import APIRouter, Depends, HTTPException, status
from models.auth import User
from pydantic import BaseModel
from schemas.auth import UserResponse
from services.user import UserService
from services.audit_service import AuditService
from sqlalchemy.ext.asyncio import AsyncSession
import logging

router = APIRouter(prefix="/api/v1/users", tags=["users"])
logger = logging.getLogger(__name__)


class UpdateProfileRequest(BaseModel):
    name: Optional[str] = None


@router.get("/profile", response_model=UserResponse)
async def get_profile(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get current user profile"""
    profile = await UserService.get_user_profile(db, current_user.id)
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User profile not found")
    return profile


@router.put("/profile", response_model=UserResponse)
async def update_profile(
    profile_data: UpdateProfileRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update current user profile"""
    # Get old data before update
    old_profile = await UserService.get_user_profile(db, current_user.id)
    if not old_profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User profile not found")
    
    old_data = {
        "id": str(old_profile.id),
        "email": old_profile.email,
        "name": old_profile.name,
        "role": old_profile.role,
    }
    
    # Update profile
    profile = await UserService.update_user_profile(db, current_user.id, profile_data.name)
    
    # Audit logging
    try:
        await AuditService.log_crud_operation(
            db=db,
            actor_user_id=str(current_user.id),
            action="update",
            entity_type="user_profile",
            entity_id=str(current_user.id),
            old_data=old_data,
            new_data=profile_data.dict(exclude_unset=True),
            role=current_user.role,
        )
    except Exception as audit_error:
        logger.error(f"Audit logging failed: {audit_error}")
    
    return profile