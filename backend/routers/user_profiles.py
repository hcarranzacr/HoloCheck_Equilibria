from datetime import datetime
from typing import Optional
from uuid import UUID

from dependencies.auth import get_current_user
from fastapi import APIRouter, Depends, HTTPException, Query
from models.user_profiles import UserProfile
from pydantic import BaseModel
from schemas.auth import UserResponse
from services.user_profiles import UserProfileService
from services.audit_service import AuditService
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
import logging

from core.database import get_db

router = APIRouter(prefix="/api/v1/entities/user_profiles", tags=["user_profiles"])
logger = logging.getLogger(__name__)


class UserProfileCreate(BaseModel):
    user_id: str
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
    query = select(UserProfile).where(UserProfile.organization_id == current_user.organization_id)

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
        .where(UserProfile.organization_id == current_user.organization_id)
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
                "user_id": item.user_id,
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


@router.get("/all")
async def list_all_user_profiles(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    sort: str = Query("-created_at"),
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List all user profiles (admin only)"""
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
                "user_id": item.user_id,
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


@router.get("/{profile_id}")
async def get_user_profile(
    profile_id: str,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a user profile by ID"""
    query = select(UserProfile).where(UserProfile.id == profile_id)
    result = await db.execute(query)
    item = result.scalar_one_or_none()

    if not item:
        raise HTTPException(status_code=404, detail="User profile not found")

    return {
        "id": str(item.id),
        "user_id": item.user_id,
        "organization_id": str(item.organization_id),
        "department_id": str(item.department_id) if item.department_id else None,
        "full_name": item.full_name,
        "email": item.email,
        "role": item.role,
        "created_at": item.created_at.isoformat() if item.created_at else None,
    }


@router.post("")
async def create_user_profile(
    data: UserProfileCreate,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new user profile"""
    service = UserProfileService(db)
    profile = await service.create_user_profile(data.dict())

    # Audit logging
    try:
        await AuditService.log_crud_operation(
            db=db,
            actor_user_id=str(current_user.id),
            action="create",
            entity_type="user_profiles",
            entity_id=str(profile.id),
            new_data=data.dict(),
            organization_id=str(profile.organization_id),
            role=current_user.role,
        )
    except Exception as audit_error:
        logger.error(f"Audit logging failed: {audit_error}")

    return {
        "id": str(profile.id),
        "user_id": profile.user_id,
        "organization_id": str(profile.organization_id),
        "department_id": str(profile.department_id) if profile.department_id else None,
        "full_name": profile.full_name,
        "email": profile.email,
        "role": profile.role,
        "created_at": profile.created_at.isoformat() if profile.created_at else None,
    }


@router.put("/{profile_id}")
async def update_user_profile(
    profile_id: str,
    data: UserProfileUpdate,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update a user profile"""
    service = UserProfileService(db)
    
    # Get old data before update
    query = select(UserProfile).where(UserProfile.id == profile_id)
    result = await db.execute(query)
    old_profile = result.scalar_one_or_none()
    
    if not old_profile:
        raise HTTPException(status_code=404, detail="User profile not found")
    
    old_data = {k: v for k, v in old_profile.__dict__.items() if not k.startswith('_')}
    
    profile = await service.update_user_profile(UUID(profile_id), data.dict(exclude_unset=True))

    # Audit logging
    try:
        await AuditService.log_crud_operation(
            db=db,
            actor_user_id=str(current_user.id),
            action="update",
            entity_type="user_profiles",
            entity_id=profile_id,
            old_data=old_data,
            new_data=data.dict(exclude_unset=True),
            organization_id=str(profile.organization_id),
            role=current_user.role,
        )
    except Exception as audit_error:
        logger.error(f"Audit logging failed: {audit_error}")

    return {
        "id": str(profile.id),
        "user_id": profile.user_id,
        "organization_id": str(profile.organization_id),
        "department_id": str(profile.department_id) if profile.department_id else None,
        "full_name": profile.full_name,
        "email": profile.email,
        "role": profile.role,
        "created_at": profile.created_at.isoformat() if profile.created_at else None,
    }


@router.delete("/{profile_id}")
async def delete_user_profile(
    profile_id: str,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a user profile"""
    service = UserProfileService(db)
    
    # Get old data before delete
    query = select(UserProfile).where(UserProfile.id == profile_id)
    result = await db.execute(query)
    old_profile = result.scalar_one_or_none()
    
    if not old_profile:
        raise HTTPException(status_code=404, detail="User profile not found")
    
    old_data = {k: v for k, v in old_profile.__dict__.items() if not k.startswith('_')}
    
    success = await service.delete_user_profile(UUID(profile_id))

    # Audit logging
    try:
        await AuditService.log_crud_operation(
            db=db,
            actor_user_id=str(current_user.id),
            action="delete",
            entity_type="user_profiles",
            entity_id=profile_id,
            old_data=old_data,
            organization_id=str(old_profile.organization_id),
            role=current_user.role,
        )
    except Exception as audit_error:
        logger.error(f"Audit logging failed: {audit_error}")

    return {"message": "User profile deleted successfully"}