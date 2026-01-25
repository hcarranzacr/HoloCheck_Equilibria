from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from pydantic import BaseModel, EmailStr, validator
import uuid
from datetime import datetime

from core.database import get_db
from dependencies.auth import get_current_user
from schemas.auth import UserResponse
from models.organizations import OrganizationBranding, Organizations

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
    login_message: Optional[str] = None
    dashboard_welcome_text: Optional[str] = None
    meta_description: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    contact_phone: Optional[str] = None
    social_links: Optional[dict] = None
    custom_terms_url: Optional[str] = None
    custom_privacy_url: Optional[str] = None
    login_layout_style: Optional[str] = 'centered'
    branding_mode: Optional[str] = 'custom'

    @validator('login_layout_style')
    def validate_layout_style(cls, v):
        allowed = ['centered', 'split', 'left-panel']
        if v not in allowed:
            raise ValueError(f'login_layout_style must be one of {allowed}')
        return v

    @validator('primary_color', 'secondary_color')
    def validate_color(cls, v):
        if v and not v.startswith('#'):
            raise ValueError('Color must start with #')
        if v and len(v) not in [4, 7]:  # #RGB or #RRGGBB
            raise ValueError('Color must be in format #RGB or #RRGGBB')
        return v


class OrganizationBrandingUpdate(BaseModel):
    logo_url: Optional[str] = None
    primary_color: Optional[str] = None
    slogan: Optional[str] = None
    message: Optional[str] = None
    slug: Optional[str] = None
    secondary_color: Optional[str] = None
    favicon_url: Optional[str] = None
    font_family: Optional[str] = None
    background_image_url: Optional[str] = None
    login_message: Optional[str] = None
    dashboard_welcome_text: Optional[str] = None
    meta_description: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    contact_phone: Optional[str] = None
    social_links: Optional[dict] = None
    custom_terms_url: Optional[str] = None
    custom_privacy_url: Optional[str] = None
    login_layout_style: Optional[str] = None
    branding_mode: Optional[str] = None


class OrganizationBrandingResponse(BaseModel):
    id: str
    organization_id: str
    organization_name: Optional[str] = None
    logo_url: str
    primary_color: str
    slogan: str
    message: str
    slug: str
    secondary_color: Optional[str] = None
    favicon_url: Optional[str] = None
    font_family: Optional[str] = None
    background_image_url: Optional[str] = None
    login_message: Optional[str] = None
    dashboard_welcome_text: Optional[str] = None
    meta_description: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    social_links: Optional[dict] = None
    custom_terms_url: Optional[str] = None
    custom_privacy_url: Optional[str] = None
    login_layout_style: str
    branding_mode: str
    created_at: datetime

    class Config:
        from_attributes = True


@router.get("/", response_model=List[OrganizationBrandingResponse])
async def list_all_branding(
    db: AsyncSession = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    """List all organization brandings (admin only)"""
    if current_user.role not in ['admin_global', 'admin_platform']:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    result = await db.execute(
        """
        SELECT ob.*, o.name as organization_name
        FROM organization_branding ob
        LEFT JOIN organizations o ON ob.organization_id = o.id
        ORDER BY ob.created_at DESC
        """
    )
    brandings = result.fetchall()
    
    return [
        {
            "id": str(b.id),
            "organization_id": str(b.organization_id),
            "organization_name": b.organization_name,
            "logo_url": b.logo_url,
            "primary_color": b.primary_color,
            "slogan": b.slogan,
            "message": b.message,
            "slug": b.slug,
            "secondary_color": b.secondary_color,
            "favicon_url": b.favicon_url,
            "font_family": b.font_family,
            "background_image_url": b.background_image_url,
            "login_message": b.login_message,
            "dashboard_welcome_text": b.dashboard_welcome_text,
            "meta_description": b.meta_description,
            "contact_email": b.contact_email,
            "contact_phone": b.contact_phone,
            "social_links": b.social_links,
            "custom_terms_url": b.custom_terms_url,
            "custom_privacy_url": b.custom_privacy_url,
            "login_layout_style": b.login_layout_style or 'centered',
            "branding_mode": b.branding_mode or 'custom',
            "created_at": b.created_at
        }
        for b in brandings
    ]


@router.get("/slug/{slug}", response_model=OrganizationBrandingResponse)
async def get_branding_by_slug(slug: str, db: AsyncSession = Depends(get_db)):
    """Get organization branding by slug (public endpoint for login page)"""
    result = await db.execute(
        """
        SELECT ob.*, o.name as organization_name
        FROM organization_branding ob
        LEFT JOIN organizations o ON ob.organization_id = o.id
        WHERE ob.slug = :slug
        """,
        {"slug": slug}
    )
    branding = result.fetchone()
    
    if not branding:
        raise HTTPException(
            status_code=404,
            detail=f"Organization with slug '{slug}' not found"
        )
    
    return {
        "id": str(branding.id),
        "organization_id": str(branding.organization_id),
        "organization_name": branding.organization_name,
        "logo_url": branding.logo_url,
        "primary_color": branding.primary_color,
        "slogan": branding.slogan,
        "message": branding.message,
        "slug": branding.slug,
        "secondary_color": branding.secondary_color,
        "favicon_url": branding.favicon_url,
        "font_family": branding.font_family,
        "background_image_url": branding.background_image_url,
        "login_message": branding.login_message,
        "dashboard_welcome_text": branding.dashboard_welcome_text,
        "meta_description": branding.meta_description,
        "contact_email": branding.contact_email,
        "contact_phone": branding.contact_phone,
        "social_links": branding.social_links,
        "custom_terms_url": branding.custom_terms_url,
        "custom_privacy_url": branding.custom_privacy_url,
        "login_layout_style": branding.login_layout_style or 'centered',
        "branding_mode": branding.branding_mode or 'custom',
        "created_at": branding.created_at
    }


@router.get("/{branding_id}", response_model=OrganizationBrandingResponse)
async def get_branding_by_id(
    branding_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    """Get organization branding by ID"""
    if current_user.role not in ['admin_global', 'admin_platform']:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    result = await db.execute(
        """
        SELECT ob.*, o.name as organization_name
        FROM organization_branding ob
        LEFT JOIN organizations o ON ob.organization_id = o.id
        WHERE ob.id = :branding_id
        """,
        {"branding_id": branding_id}
    )
    branding = result.fetchone()
    
    if not branding:
        raise HTTPException(status_code=404, detail="Branding not found")
    
    return {
        "id": str(branding.id),
        "organization_id": str(branding.organization_id),
        "organization_name": branding.organization_name,
        "logo_url": branding.logo_url,
        "primary_color": branding.primary_color,
        "slogan": branding.slogan,
        "message": branding.message,
        "slug": branding.slug,
        "secondary_color": branding.secondary_color,
        "favicon_url": branding.favicon_url,
        "font_family": branding.font_family,
        "background_image_url": branding.background_image_url,
        "login_message": branding.login_message,
        "dashboard_welcome_text": branding.dashboard_welcome_text,
        "meta_description": branding.meta_description,
        "contact_email": branding.contact_email,
        "contact_phone": branding.contact_phone,
        "social_links": branding.social_links,
        "custom_terms_url": branding.custom_terms_url,
        "custom_privacy_url": branding.custom_privacy_url,
        "login_layout_style": branding.login_layout_style or 'centered',
        "branding_mode": branding.branding_mode or 'custom',
        "created_at": branding.created_at
    }


@router.post("/", response_model=dict)
async def create_branding(
    data: OrganizationBrandingCreate,
    db: AsyncSession = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    """Create new organization branding (admin only)"""
    if current_user.role not in ['admin_global', 'admin_platform']:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Check if slug already exists
    result = await db.execute(
        "SELECT id FROM organization_branding WHERE slug = :slug",
        {"slug": data.slug}
    )
    existing = result.fetchone()
    
    if existing:
        raise HTTPException(status_code=400, detail=f"Slug '{data.slug}' already exists")
    
    # Check if organization exists
    result = await db.execute(
        "SELECT id FROM organizations WHERE id = :org_id",
        {"org_id": data.organization_id}
    )
    org = result.fetchone()
    
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    
    # Create branding
    branding_id = str(uuid.uuid4())
    await db.execute(
        """
        INSERT INTO organization_branding (
            id, organization_id, logo_url, primary_color, slogan, message, slug,
            secondary_color, favicon_url, font_family, background_image_url,
            login_message, dashboard_welcome_text, meta_description,
            contact_email, contact_phone, social_links,
            custom_terms_url, custom_privacy_url,
            login_layout_style, branding_mode, created_at
        ) VALUES (
            :id, :organization_id, :logo_url, :primary_color, :slogan, :message, :slug,
            :secondary_color, :favicon_url, :font_family, :background_image_url,
            :login_message, :dashboard_welcome_text, :meta_description,
            :contact_email, :contact_phone, :social_links,
            :custom_terms_url, :custom_privacy_url,
            :login_layout_style, :branding_mode, :created_at
        )
        """,
        {
            "id": branding_id,
            "organization_id": data.organization_id,
            "logo_url": data.logo_url,
            "primary_color": data.primary_color,
            "slogan": data.slogan,
            "message": data.message,
            "slug": data.slug,
            "secondary_color": data.secondary_color,
            "favicon_url": data.favicon_url,
            "font_family": data.font_family,
            "background_image_url": data.background_image_url,
            "login_message": data.login_message,
            "dashboard_welcome_text": data.dashboard_welcome_text,
            "meta_description": data.meta_description,
            "contact_email": data.contact_email,
            "contact_phone": data.contact_phone,
            "social_links": data.social_links,
            "custom_terms_url": data.custom_terms_url,
            "custom_privacy_url": data.custom_privacy_url,
            "login_layout_style": data.login_layout_style,
            "branding_mode": data.branding_mode,
            "created_at": datetime.utcnow()
        }
    )
    await db.commit()
    
    return {"id": branding_id, "message": "Branding created successfully"}


@router.put("/{branding_id}", response_model=dict)
async def update_branding(
    branding_id: str,
    data: OrganizationBrandingUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    """Update organization branding (admin only)"""
    if current_user.role not in ['admin_global', 'admin_platform']:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Check if branding exists
    result = await db.execute(
        "SELECT id FROM organization_branding WHERE id = :id",
        {"id": branding_id}
    )
    existing = result.fetchone()
    
    if not existing:
        raise HTTPException(status_code=404, detail="Branding not found")
    
    # Check slug uniqueness if updating slug
    if data.slug:
        result = await db.execute(
            "SELECT id FROM organization_branding WHERE slug = :slug AND id != :id",
            {"slug": data.slug, "id": branding_id}
        )
        slug_exists = result.fetchone()
        
        if slug_exists:
            raise HTTPException(status_code=400, detail=f"Slug '{data.slug}' already exists")
    
    # Build update query dynamically
    update_fields = []
    update_values = {"id": branding_id}
    
    for field, value in data.dict(exclude_unset=True).items():
        if value is not None:
            update_fields.append(f"{field} = :{field}")
            update_values[field] = value
    
    if update_fields:
        query = f"UPDATE organization_branding SET {', '.join(update_fields)} WHERE id = :id"
        await db.execute(query, update_values)
        await db.commit()
    
    return {"message": "Branding updated successfully"}


@router.delete("/{branding_id}", response_model=dict)
async def delete_branding(
    branding_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    """Delete organization branding (admin only)"""
    if current_user.role not in ['admin_global', 'admin_platform']:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Check if branding exists
    result = await db.execute(
        "SELECT id FROM organization_branding WHERE id = :id",
        {"id": branding_id}
    )
    existing = result.fetchone()
    
    if not existing:
        raise HTTPException(status_code=404, detail="Branding not found")
    
    await db.execute(
        "DELETE FROM organization_branding WHERE id = :id",
        {"id": branding_id}
    )
    await db.commit()
    
    return {"message": "Branding deleted successfully"}