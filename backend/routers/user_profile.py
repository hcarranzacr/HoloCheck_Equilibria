"""
User Profile API Router
Provides endpoints for user profile management
"""
import logging
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from dependencies.auth import get_current_user
from schemas.auth import UserResponse
from core.supabase_client import get_supabase_client

router = APIRouter(prefix="/api/v1", tags=["user-profile"])
logger = logging.getLogger(__name__)


@router.get("/user-profile")
async def get_user_profile(current_user: UserResponse = Depends(get_current_user)):
    """Get current user's profile information"""
    try:
        supabase = get_supabase_client()
        
        # Get user profile by user_id
        result = supabase.table('user_profiles').select('*').eq('user_id', current_user.id).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="User profile not found")
        
        return result.data[0]
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching user profile: {e}")
        raise HTTPException(status_code=500, detail=f"Error loading profile: {str(e)}")


@router.get("/organizations/{organization_id}")
async def get_organization(organization_id: str, current_user: UserResponse = Depends(get_current_user)):
    """Get organization information"""
    try:
        supabase = get_supabase_client()
        
        result = supabase.table('organizations').select('*').eq('id', organization_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Organization not found")
        
        return result.data[0]
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching organization: {e}")
        raise HTTPException(status_code=500, detail=f"Error loading organization: {str(e)}")


@router.get("/departments/{department_id}")
async def get_department(department_id: str, current_user: UserResponse = Depends(get_current_user)):
    """Get department information"""
    try:
        supabase = get_supabase_client()
        
        result = supabase.table('departments').select('*').eq('id', department_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Department not found")
        
        return result.data[0]
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching department: {e}")
        raise HTTPException(status_code=500, detail=f"Error loading department: {str(e)}")


@router.get("/users/{user_id}")
async def get_user(user_id: str, current_user: UserResponse = Depends(get_current_user)):
    """Get user information (for leader lookup)"""
    try:
        supabase = get_supabase_client()
        
        result = supabase.table('user_profiles').select('full_name, email').eq('user_id', user_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="User not found")
        
        return result.data[0]
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching user: {e}")
        raise HTTPException(status_code=500, detail=f"Error loading user: {str(e)}")