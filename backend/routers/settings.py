from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from pydantic import BaseModel

from core.database import get_db
from dependencies.auth import get_current_user
from models.auth import User
from models.app_settings import App_settings
from services.audit_service import AuditService
import logging

router = APIRouter(prefix="/api/v1/settings", tags=["settings"])
logger = logging.getLogger(__name__)


class SettingCreate(BaseModel):
    setting_key: str
    setting_value: str


class SettingUpdate(BaseModel):
    setting_value: str


class SettingResponse(BaseModel):
    id: int
    setting_key: str
    setting_value: str

    class Config:
        from_attributes = True


@router.get("/", response_model=List[SettingResponse])
async def list_settings(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all application settings"""
    result = await db.execute(select(App_settings))
    settings = result.scalars().all()
    return settings


@router.get("/{setting_key}", response_model=SettingResponse)
async def get_setting(
    setting_key: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific setting by key"""
    result = await db.execute(
        select(App_settings).where(App_settings.setting_key == setting_key)
    )
    setting = result.scalar_one_or_none()
    if not setting:
        raise HTTPException(status_code=404, detail="Setting not found")
    return setting


@router.post("/", response_model=SettingResponse, status_code=201)
async def create_setting(
    data: SettingCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new application setting"""
    # Check if setting already exists
    result = await db.execute(
        select(App_settings).where(App_settings.setting_key == data.setting_key)
    )
    existing = result.scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="Setting key already exists")
    
    new_setting = App_settings(
        setting_key=data.setting_key,
        setting_value=data.setting_value
    )
    db.add(new_setting)
    await db.commit()
    await db.refresh(new_setting)
    
    # Audit logging
    try:
        await AuditService.log_crud_operation(
            db=db,
            actor_user_id=str(current_user.id),
            action="create",
            entity_type="app_settings",
            entity_id=str(new_setting.id),
            new_data=data.dict(),
            role=current_user.role,
        )
    except Exception as audit_error:
        logger.error(f"Audit logging failed: {audit_error}")
    
    return new_setting


@router.put("/{setting_key}", response_model=SettingResponse)
async def update_setting(
    setting_key: str,
    data: SettingUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update an existing setting"""
    result = await db.execute(
        select(App_settings).where(App_settings.setting_key == setting_key)
    )
    setting = result.scalar_one_or_none()
    if not setting:
        raise HTTPException(status_code=404, detail="Setting not found")
    
    # Store old data
    old_data = {
        "setting_key": setting.setting_key,
        "setting_value": setting.setting_value
    }
    
    setting.setting_value = data.setting_value
    await db.commit()
    await db.refresh(setting)
    
    # Audit logging
    try:
        await AuditService.log_crud_operation(
            db=db,
            actor_user_id=str(current_user.id),
            action="update",
            entity_type="app_settings",
            entity_id=str(setting.id),
            old_data=old_data,
            new_data=data.dict(),
            role=current_user.role,
        )
    except Exception as audit_error:
        logger.error(f"Audit logging failed: {audit_error}")
    
    return setting


@router.delete("/{setting_key}")
async def delete_setting(
    setting_key: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a setting"""
    result = await db.execute(
        select(App_settings).where(App_settings.setting_key == setting_key)
    )
    setting = result.scalar_one_or_none()
    if not setting:
        raise HTTPException(status_code=404, detail="Setting not found")
    
    # Store old data
    old_data = {
        "setting_key": setting.setting_key,
        "setting_value": setting.setting_value
    }
    
    await db.delete(setting)
    await db.commit()
    
    # Audit logging
    try:
        await AuditService.log_crud_operation(
            db=db,
            actor_user_id=str(current_user.id),
            action="delete",
            entity_type="app_settings",
            entity_id=str(setting.id),
            old_data=old_data,
            role=current_user.role,
        )
    except Exception as audit_error:
        logger.error(f"Audit logging failed: {audit_error}")
    
    return {"message": "Setting deleted successfully"}