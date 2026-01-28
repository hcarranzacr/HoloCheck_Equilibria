"""
User Profile API Router
Handles user profile operations for the authenticated user
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import logging

from core.database import get_db
from dependencies.auth import get_current_user
from models.user_profiles import UserProfile
from schemas.auth import UserResponse

router = APIRouter(prefix="/api/v1/user-profile", tags=["user-profile"])
logger = logging.getLogger(__name__)


@router.get("")
async def get_user_profile(
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Get the profile of the currently authenticated user
    """
    try:
        logger.info(f"🔍 PROFILE DEBUG - Fetching profile for user_id: {current_user.id}")
        logger.info(f"🔍 PROFILE DEBUG - User email: {current_user.email}")
        
        # Query user profile by user_id (string comparison)
        query = select(UserProfile).where(UserProfile.user_id == str(current_user.id))
        result = await db.execute(query)
        profile = result.scalar_one_or_none()
        
        if not profile:
            logger.error(f"❌ PROFILE ERROR - No profile found for user_id: {current_user.id}")
            
            # Check if ANY profiles exist in the table
            count_query = select(UserProfile)
            count_result = await db.execute(count_query)
            all_profiles = count_result.scalars().all()
            
            logger.error(f"❌ PROFILE ERROR - Total profiles in DB: {len(all_profiles)}")
            if all_profiles:
                logger.error(f"❌ PROFILE ERROR - Sample user_ids in DB: {[p.user_id for p in all_profiles[:5]]}")
            
            raise HTTPException(
                status_code=404,
                detail=f"User profile not found for user_id: {current_user.id}"
            )
        
        logger.info(f"✅ PROFILE DEBUG - Found profile: id={profile.id}, full_name={profile.full_name}")
        
        return {
            "id": str(profile.id),
            "user_id": profile.user_id,
            "organization_id": str(profile.organization_id) if profile.organization_id else None,
            "department_id": str(profile.department_id) if profile.department_id else None,
            "full_name": profile.full_name,
            "email": profile.email,
            "role": profile.role,
            "created_at": profile.created_at.isoformat() if profile.created_at else None,
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ PROFILE ERROR - Unexpected error: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch user profile: {str(e)}"
        )


@router.put("")
async def update_user_profile(
    profile_data: dict,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Update the profile of the currently authenticated user
    """
    try:
        query = select(UserProfile).where(UserProfile.user_id == str(current_user.id))
        result = await db.execute(query)
        profile = result.scalar_one_or_none()
        
        if not profile:
            raise HTTPException(
                status_code=404,
                detail="User profile not found"
            )
        
        # Update allowed fields
        if "full_name" in profile_data:
            profile.full_name = profile_data["full_name"]
        if "email" in profile_data:
            profile.email = profile_data["email"]
        
        await db.commit()
        await db.refresh(profile)
        
        return {
            "id": str(profile.id),
            "user_id": profile.user_id,
            "organization_id": str(profile.organization_id) if profile.organization_id else None,
            "department_id": str(profile.department_id) if profile.department_id else None,
            "full_name": profile.full_name,
            "email": profile.email,
            "role": profile.role,
            "created_at": profile.created_at.isoformat() if profile.created_at else None,
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating user profile: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update user profile: {str(e)}"
        )