from datetime import datetime
from typing import Optional
from uuid import UUID, uuid4

from dependencies.auth import get_current_user
from fastapi import APIRouter, Depends, HTTPException, Query
from models.user_profiles import UserProfile
from pydantic import BaseModel
from schemas.auth import UserResponse
from sqlalchemy import func, select, text
from sqlalchemy.ext.asyncio import AsyncSession
import logging

from core.database import get_db

router = APIRouter(prefix="/api/v1/entities/user_profiles", tags=["user_profiles"])
logger = logging.getLogger(__name__)


class UserProfileCreate(BaseModel):
    user_id: str  # Changed from UUID to str
    organization_id: str
    department_id: Optional[str] = None
    full_name: Optional[str] = None
    email: str
    role: str


class UserProfileUpdate(BaseModel):
    department_id: Optional[str] = None
    full_name: Optional[str] = None
    role: Optional[str] = None


@router.get("")
async def list_user_profiles(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    sort: str = Query("-created_at"),
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List user profiles for the current user's organization"""
    try:
        # Get user's organization_id from user_profiles table first
        # Use string comparison for user_id (not UUID)
        user_query = select(UserProfile).where(UserProfile.user_id == str(current_user.id))
        user_result = await db.execute(user_query)
        user_profile = user_result.scalar_one_or_none()
        
        if not user_profile or not user_profile.organization_id:
            logger.warning(f"User {current_user.id} has no organization_id")
            return {
                "items": [],
                "total": 0,
                "skip": skip,
                "limit": limit,
            }
        
        organization_id = user_profile.organization_id
        
        query = select(UserProfile).where(UserProfile.organization_id == organization_id)

        # Apply sorting
        if sort.startswith("-"):
            order_field = sort[1:]
            query = query.order_by(getattr(UserProfile, order_field).desc())
        else:
            query = query.order_by(getattr(UserProfile, sort).asc())

        # Get total count
        count_query = (
            select(func.count())
            .select_from(UserProfile)
            .where(UserProfile.organization_id == organization_id)
        )
        total_result = await db.execute(count_query)
        total = total_result.scalar()

        # Apply pagination
        query = query.offset(skip).limit(limit)

        result = await db.execute(query)
        items = result.scalars().all()

        return {
            "items": [
                {
                    "id": str(item.id),
                    "user_id": item.user_id,  # Already a string
                    "organization_id": str(item.organization_id),
                    "department_id": str(item.department_id) if item.department_id else None,
                    "full_name": item.full_name,
                    "email": item.email,
                    "role": item.role,
                    "created_at": item.created_at.isoformat() if item.created_at else None,
                }
                for item in items
            ],
            "total": total,
            "skip": skip,
            "limit": limit,
        }
    except Exception as e:
        logger.error(f"Error listing user profiles: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to list user profiles: {str(e)}"
        )


@router.get("/all")
async def list_all_user_profiles(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    sort: str = Query("-created_at"),
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List all user profiles (admin only)"""
    try:
        query = select(UserProfile)

        # Apply sorting
        if sort.startswith("-"):
            order_field = sort[1:]
            query = query.order_by(getattr(UserProfile, order_field).desc())
        else:
            query = query.order_by(getattr(UserProfile, sort).asc())

        # Get total count
        count_query = select(func.count()).select_from(UserProfile)
        total_result = await db.execute(count_query)
        total = total_result.scalar()

        # Apply pagination
        query = query.offset(skip).limit(limit)

        result = await db.execute(query)
        items = result.scalars().all()

        return {
            "items": [
                {
                    "id": str(item.id),
                    "user_id": item.user_id,  # Already a string
                    "organization_id": str(item.organization_id),
                    "department_id": str(item.department_id) if item.department_id else None,
                    "full_name": item.full_name,
                    "email": item.email,
                    "role": item.role,
                    "created_at": item.created_at.isoformat() if item.created_at else None,
                }
                for item in items
            ],
            "total": total,
            "skip": skip,
            "limit": limit,
        }
    except Exception as e:
        logger.error(f"Error listing all user profiles: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to list all user profiles: {str(e)}"
        )


@router.get("/{profile_id}")
async def get_user_profile(
    profile_id: str,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a user profile by ID"""
    try:
        query = select(UserProfile).where(UserProfile.id == profile_id)
        result = await db.execute(query)
        item = result.scalar_one_or_none()

        if not item:
            raise HTTPException(status_code=404, detail="User profile not found")

        return {
            "id": str(item.id),
            "user_id": item.user_id,  # Already a string
            "organization_id": str(item.organization_id),
            "department_id": str(item.department_id) if item.department_id else None,
            "full_name": item.full_name,
            "email": item.email,
            "role": item.role,
            "created_at": item.created_at.isoformat() if item.created_at else None,
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting user profile: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get user profile: {str(e)}"
        )


@router.post("")
async def create_user_profile(
    data: UserProfileCreate,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new user profile"""
    try:
        # Create new profile with string user_id
        new_profile = UserProfile(
            id=uuid4(),
            user_id=data.user_id,  # String, no UUID conversion
            organization_id=UUID(data.organization_id),
            department_id=UUID(data.department_id) if data.department_id else None,
            full_name=data.full_name,
            email=data.email,
            role=data.role,
            created_at=datetime.utcnow()
        )
        
        db.add(new_profile)
        await db.commit()
        await db.refresh(new_profile)

        return {
            "id": str(new_profile.id),
            "user_id": new_profile.user_id,  # Already a string
            "organization_id": str(new_profile.organization_id),
            "department_id": str(new_profile.department_id) if new_profile.department_id else None,
            "full_name": new_profile.full_name,
            "email": new_profile.email,
            "role": new_profile.role,
            "created_at": new_profile.created_at.isoformat() if new_profile.created_at else None,
        }
    except Exception as e:
        await db.rollback()
        logger.error(f"Error creating user profile: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create user profile: {str(e)}"
        )


@router.put("/{profile_id}")
async def update_user_profile(
    profile_id: str,
    data: UserProfileUpdate,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update a user profile"""
    try:
        query = select(UserProfile).where(UserProfile.id == profile_id)
        result = await db.execute(query)
        profile = result.scalar_one_or_none()
        
        if not profile:
            raise HTTPException(status_code=404, detail="User profile not found")
        
        # Update fields
        if data.department_id is not None:
            profile.department_id = UUID(data.department_id) if data.department_id else None
        if data.full_name is not None:
            profile.full_name = data.full_name
        if data.role is not None:
            profile.role = data.role
        
        await db.commit()
        await db.refresh(profile)

        return {
            "id": str(profile.id),
            "user_id": profile.user_id,  # Already a string
            "organization_id": str(profile.organization_id),
            "department_id": str(profile.department_id) if profile.department_id else None,
            "full_name": profile.full_name,
            "email": profile.email,
            "role": profile.role,
            "created_at": profile.created_at.isoformat() if profile.created_at else None,
        }
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Error updating user profile: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update user profile: {str(e)}"
        )


@router.delete("/{profile_id}")
async def delete_user_profile(
    profile_id: str,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a user profile"""
    try:
        query = select(UserProfile).where(UserProfile.id == profile_id)
        result = await db.execute(query)
        profile = result.scalar_one_or_none()
        
        if not profile:
            raise HTTPException(status_code=404, detail="User profile not found")
        
        await db.delete(profile)
        await db.commit()

        return {"message": "User profile deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Error deleting user profile: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete user profile: {str(e)}"
        )