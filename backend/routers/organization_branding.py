"""
Organization Branding Router
Manage organization branding settings including logos, colors, and themes
"""

import logging
from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from dependencies.auth import get_current_user
from schemas.auth import UserResponse
from models.organization_branding import OrganizationBranding
from models.organizations import Organizations
from services.audit_service import AuditService

router = APIRouter(prefix="/api/v1/organization-branding", tags=["organization-branding"])


class SocialLinks(BaseModel):
    twitter: Optional[str] = None
    linkedin: Optional[str] = None
    facebook: Optional[str] = None
    instagram: Optional[str] = None


class OrganizationBrandingCreate(BaseModel):
    organization_id: str
    logo_url: str
    primary_color: str
    slogan: str
    message: str
    slug: str
    secondary_color: Optional[str] = None
    favicon_url: Optional[str] = None
    font_family: Optional[str] = "Lato, sans-serif"
    background_image_url: Optional[str] = None
    social_links: Optional[SocialLinks] = None


class OrganizationBrandingUpdate(BaseModel):
    logo_url: Optional[str] = None
    primary_color: Optional[str] = None
    secondary_color: Optional[str] = None
    slogan: Optional[str] = None
    message: Optional[str] = None
    slug: Optional[str] = None
    favicon_url: Optional[str] = None
    font_family: Optional[str] = None
    background_image_url: Optional[str] = None
    social_links: Optional[SocialLinks] = None


class OrganizationBrandingResponse(BaseModel):
    id: str
    organization_id: str
    logo_url: str
    primary_color: str
    slogan: str
    message: str
    slug: str
    secondary_color: Optional[str] = None
    favicon_url: Optional[str] = None
    font_family: Optional[str] = None
    background_image_url: Optional[str] = None
    social_links: Optional[dict] = None

    class Config:
        from_attributes = True


@router.post("/", response_model=OrganizationBrandingResponse, status_code=status.HTTP_201_CREATED)
async def create_organization_branding(
    branding: OrganizationBrandingCreate,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create organization branding settings"""
    try:
        # Create new branding record
        db_branding = OrganizationBranding(
            organization_id=branding.organization_id,
            logo_url=branding.logo_url,
            primary_color=branding.primary_color,
            secondary_color=branding.secondary_color,
            slogan=branding.slogan,
            message=branding.message,
            slug=branding.slug,
            favicon_url=branding.favicon_url,
            font_family=branding.font_family,
            background_image_url=branding.background_image_url,
            social_links=branding.social_links.dict() if branding.social_links else None,
        )
        
        db.add(db_branding)
        await db.commit()
        await db.refresh(db_branding)
        
        return db_branding
    except Exception as e:
        await db.rollback()
        logging.error(f"Error creating organization branding: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create organization branding: {str(e)}"
        )


@router.get("/{organization_id}", response_model=OrganizationBrandingResponse)
async def get_organization_branding(
    organization_id: str,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get organization branding settings"""
    try:
        from sqlalchemy import select
        
        query = select(OrganizationBranding).where(
            OrganizationBranding.organization_id == organization_id
        )
        result = await db.execute(query)
        branding = result.scalar_one_or_none()
        
        if not branding:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Organization branding not found"
            )
        
        return branding
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error fetching organization branding: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch organization branding: {str(e)}"
        )


@router.put("/{branding_id}", response_model=OrganizationBrandingResponse)
async def update_organization_branding(
    branding_id: str,
    branding_update: OrganizationBrandingUpdate,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update organization branding settings"""
    try:
        from sqlalchemy import select
        
        query = select(OrganizationBranding).where(OrganizationBranding.id == branding_id)
        result = await db.execute(query)
        db_branding = result.scalar_one_or_none()
        
        if not db_branding:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Organization branding not found"
            )
        
        # Update fields
        update_data = branding_update.dict(exclude_unset=True)
        if "social_links" in update_data and update_data["social_links"]:
            update_data["social_links"] = update_data["social_links"].dict()
        
        for field, value in update_data.items():
            setattr(db_branding, field, value)
        
        await db.commit()
        await db.refresh(db_branding)
        
        return db_branding
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logging.error(f"Error updating organization branding: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update organization branding: {str(e)}"
        )


@router.delete("/{branding_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_organization_branding(
    branding_id: str,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete organization branding settings"""
    try:
        from sqlalchemy import select, delete
        
        query = select(OrganizationBranding).where(OrganizationBranding.id == branding_id)
        result = await db.execute(query)
        db_branding = result.scalar_one_or_none()
        
        if not db_branding:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Organization branding not found"
            )
        
        await db.execute(delete(OrganizationBranding).where(OrganizationBranding.id == branding_id))
        await db.commit()
        
        return None
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logging.error(f"Error deleting organization branding: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete organization branding: {str(e)}"
        )