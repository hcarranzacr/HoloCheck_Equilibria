"""
Benefits Management Router - Complete Admin Panel
Comprehensive CRUD operations for all 6 benefits-related tables:
1. partners
2. partner_programs
3. partner_benefits
4. organization_partner_links
5. organization_partner_programs
6. organization_benefit_indicator_links
"""

import logging
from typing import List, Optional
from uuid import UUID
from datetime import date
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from core.supabase_client import get_supabase_client
from dependencies.auth import get_current_user
from schemas.auth import UserResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/benefits-management", tags=["benefits-management"])


# ==================== SCHEMAS ====================

# Partners
class PartnerCreate(BaseModel):
    name: str
    region: Optional[str] = None
    sector: Optional[str] = None
    website_url: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    description: Optional[str] = None
    logo_url: Optional[str] = None

class PartnerUpdate(BaseModel):
    name: Optional[str] = None
    region: Optional[str] = None
    sector: Optional[str] = None
    website_url: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    description: Optional[str] = None
    logo_url: Optional[str] = None


# Partner Programs
class PartnerProgramCreate(BaseModel):
    partner_id: UUID
    title: str
    description: Optional[str] = None
    eligibility_criteria: Optional[str] = None
    benefit_type: Optional[str] = None
    usage_instructions: Optional[str] = None
    redemption_link: Optional[str] = None
    image_url: Optional[str] = None
    available_in_countries: Optional[str] = None
    applicable_biomarkers: Optional[str] = None
    language: Optional[str] = None
    is_active: bool = True

class PartnerProgramUpdate(BaseModel):
    partner_id: Optional[UUID] = None
    title: Optional[str] = None
    description: Optional[str] = None
    eligibility_criteria: Optional[str] = None
    benefit_type: Optional[str] = None
    usage_instructions: Optional[str] = None
    redemption_link: Optional[str] = None
    image_url: Optional[str] = None
    available_in_countries: Optional[str] = None
    applicable_biomarkers: Optional[str] = None
    language: Optional[str] = None
    is_active: Optional[bool] = None


# Partner Benefits
class PartnerBenefitCreate(BaseModel):
    partner_id: UUID
    title: str
    benefit_description: Optional[str] = None
    how_to_use: Optional[str] = None
    link_url: Optional[str] = None
    image_url: Optional[str] = None
    tags: Optional[List[str]] = None
    is_active: bool = True

class PartnerBenefitUpdate(BaseModel):
    partner_id: Optional[UUID] = None
    title: Optional[str] = None
    benefit_description: Optional[str] = None
    how_to_use: Optional[str] = None
    link_url: Optional[str] = None
    image_url: Optional[str] = None
    tags: Optional[List[str]] = None
    is_active: Optional[bool] = None


# Organization Partner Links
class OrgPartnerLinkCreate(BaseModel):
    organization_id: UUID
    partner_id: UUID
    agreement_start: Optional[date] = None
    agreement_end: Optional[date] = None
    notes: Optional[str] = None
    is_active: bool = True

class OrgPartnerLinkUpdate(BaseModel):
    organization_id: Optional[UUID] = None
    partner_id: Optional[UUID] = None
    agreement_start: Optional[date] = None
    agreement_end: Optional[date] = None
    notes: Optional[str] = None
    is_active: Optional[bool] = None


# Organization Partner Programs
class OrgPartnerProgramCreate(BaseModel):
    organization_id: UUID
    partner_program_id: UUID
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_enabled: bool = True
    custom_notes: Optional[str] = None

class OrgPartnerProgramUpdate(BaseModel):
    organization_id: Optional[UUID] = None
    partner_program_id: Optional[UUID] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_enabled: Optional[bool] = None
    custom_notes: Optional[str] = None


# Organization Benefit Indicator Links
class OrgBenefitIndicatorLinkCreate(BaseModel):
    organization_id: UUID
    benefit_id: UUID
    indicator_code: str
    relevance_level: Optional[str] = None
    notes: Optional[str] = None

class OrgBenefitIndicatorLinkUpdate(BaseModel):
    organization_id: Optional[UUID] = None
    benefit_id: Optional[UUID] = None
    indicator_code: Optional[str] = None
    relevance_level: Optional[str] = None
    notes: Optional[str] = None


# ==================== PARTNERS ====================

@router.get("/partners")
async def get_partners(current_user: UserResponse = Depends(get_current_user)):
    """Get all partners"""
    try:
        supabase = get_supabase_client()
        response = supabase.table('partners').select('*').order('name').execute()
        return {"partners": response.data or []}
    except Exception as e:
        logger.error(f"Error fetching partners: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/partners")
async def create_partner(data: PartnerCreate, current_user: UserResponse = Depends(get_current_user)):
    """Create a new partner"""
    try:
        supabase = get_supabase_client()
        response = supabase.table('partners').insert(data.dict()).execute()
        return {"partner": response.data[0] if response.data else None}
    except Exception as e:
        logger.error(f"Error creating partner: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/partners/{partner_id}")
async def update_partner(partner_id: UUID, data: PartnerUpdate, current_user: UserResponse = Depends(get_current_user)):
    """Update a partner"""
    try:
        supabase = get_supabase_client()
        update_data = {k: v for k, v in data.dict().items() if v is not None}
        response = supabase.table('partners').update(update_data).eq('id', str(partner_id)).execute()
        return {"partner": response.data[0] if response.data else None}
    except Exception as e:
        logger.error(f"Error updating partner: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/partners/{partner_id}")
async def delete_partner(partner_id: UUID, current_user: UserResponse = Depends(get_current_user)):
    """Delete a partner"""
    try:
        supabase = get_supabase_client()
        supabase.table('partners').delete().eq('id', str(partner_id)).execute()
        return {"success": True}
    except Exception as e:
        logger.error(f"Error deleting partner: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ==================== PARTNER PROGRAMS ====================

@router.get("/programs")
async def get_programs(partner_id: Optional[UUID] = None, current_user: UserResponse = Depends(get_current_user)):
    """Get all partner programs"""
    try:
        supabase = get_supabase_client()
        query = supabase.table('partner_programs').select('*')
        if partner_id:
            query = query.eq('partner_id', str(partner_id))
        response = query.order('title').execute()
        return {"programs": response.data or []}
    except Exception as e:
        logger.error(f"Error fetching programs: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/programs")
async def create_program(data: PartnerProgramCreate, current_user: UserResponse = Depends(get_current_user)):
    """Create a new partner program"""
    try:
        supabase = get_supabase_client()
        response = supabase.table('partner_programs').insert(data.dict()).execute()
        return {"program": response.data[0] if response.data else None}
    except Exception as e:
        logger.error(f"Error creating program: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/programs/{program_id}")
async def update_program(program_id: UUID, data: PartnerProgramUpdate, current_user: UserResponse = Depends(get_current_user)):
    """Update a partner program"""
    try:
        supabase = get_supabase_client()
        update_data = {k: v for k, v in data.dict().items() if v is not None}
        response = supabase.table('partner_programs').update(update_data).eq('id', str(program_id)).execute()
        return {"program": response.data[0] if response.data else None}
    except Exception as e:
        logger.error(f"Error updating program: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/programs/{program_id}")
async def delete_program(program_id: UUID, current_user: UserResponse = Depends(get_current_user)):
    """Delete a partner program"""
    try:
        supabase = get_supabase_client()
        supabase.table('partner_programs').delete().eq('id', str(program_id)).execute()
        return {"success": True}
    except Exception as e:
        logger.error(f"Error deleting program: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ==================== PARTNER BENEFITS ====================

@router.get("/benefits")
async def get_benefits(partner_id: Optional[UUID] = None, current_user: UserResponse = Depends(get_current_user)):
    """Get all partner benefits"""
    try:
        supabase = get_supabase_client()
        query = supabase.table('partner_benefits').select('*')
        if partner_id:
            query = query.eq('partner_id', str(partner_id))
        response = query.order('title').execute()
        return {"benefits": response.data or []}
    except Exception as e:
        logger.error(f"Error fetching benefits: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/benefits")
async def create_benefit(data: PartnerBenefitCreate, current_user: UserResponse = Depends(get_current_user)):
    """Create a new partner benefit"""
    try:
        supabase = get_supabase_client()
        response = supabase.table('partner_benefits').insert(data.dict()).execute()
        return {"benefit": response.data[0] if response.data else None}
    except Exception as e:
        logger.error(f"Error creating benefit: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/benefits/{benefit_id}")
async def update_benefit(benefit_id: UUID, data: PartnerBenefitUpdate, current_user: UserResponse = Depends(get_current_user)):
    """Update a partner benefit"""
    try:
        supabase = get_supabase_client()
        update_data = {k: v for k, v in data.dict().items() if v is not None}
        response = supabase.table('partner_benefits').update(update_data).eq('id', str(benefit_id)).execute()
        return {"benefit": response.data[0] if response.data else None}
    except Exception as e:
        logger.error(f"Error updating benefit: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/benefits/{benefit_id}")
async def delete_benefit(benefit_id: UUID, current_user: UserResponse = Depends(get_current_user)):
    """Delete a partner benefit"""
    try:
        supabase = get_supabase_client()
        supabase.table('partner_benefits').delete().eq('id', str(benefit_id)).execute()
        return {"success": True}
    except Exception as e:
        logger.error(f"Error deleting benefit: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ==================== ORGANIZATION PARTNER LINKS ====================

@router.get("/org-partner-links")
async def get_org_partner_links(organization_id: Optional[UUID] = None, current_user: UserResponse = Depends(get_current_user)):
    """Get all organization-partner links"""
    try:
        supabase = get_supabase_client()
        query = supabase.table('organization_partner_links').select('*')
        if organization_id:
            query = query.eq('organization_id', str(organization_id))
        response = query.execute()
        return {"links": response.data or []}
    except Exception as e:
        logger.error(f"Error fetching org-partner links: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/org-partner-links")
async def create_org_partner_link(data: OrgPartnerLinkCreate, current_user: UserResponse = Depends(get_current_user)):
    """Create a new organization-partner link"""
    try:
        supabase = get_supabase_client()
        response = supabase.table('organization_partner_links').insert(data.dict()).execute()
        return {"link": response.data[0] if response.data else None}
    except Exception as e:
        logger.error(f"Error creating org-partner link: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/org-partner-links/{link_id}")
async def update_org_partner_link(link_id: UUID, data: OrgPartnerLinkUpdate, current_user: UserResponse = Depends(get_current_user)):
    """Update an organization-partner link"""
    try:
        supabase = get_supabase_client()
        update_data = {k: v for k, v in data.dict().items() if v is not None}
        response = supabase.table('organization_partner_links').update(update_data).eq('id', str(link_id)).execute()
        return {"link": response.data[0] if response.data else None}
    except Exception as e:
        logger.error(f"Error updating org-partner link: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/org-partner-links/{link_id}")
async def delete_org_partner_link(link_id: UUID, current_user: UserResponse = Depends(get_current_user)):
    """Delete an organization-partner link"""
    try:
        supabase = get_supabase_client()
        supabase.table('organization_partner_links').delete().eq('id', str(link_id)).execute()
        return {"success": True}
    except Exception as e:
        logger.error(f"Error deleting org-partner link: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ==================== ORGANIZATION PARTNER PROGRAMS ====================

@router.get("/org-partner-programs")
async def get_org_partner_programs(organization_id: Optional[UUID] = None, current_user: UserResponse = Depends(get_current_user)):
    """Get all organization-partner programs"""
    try:
        supabase = get_supabase_client()
        query = supabase.table('organization_partner_programs').select('*')
        if organization_id:
            query = query.eq('organization_id', str(organization_id))
        response = query.execute()
        return {"programs": response.data or []}
    except Exception as e:
        logger.error(f"Error fetching org-partner programs: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/org-partner-programs")
async def create_org_partner_program(data: OrgPartnerProgramCreate, current_user: UserResponse = Depends(get_current_user)):
    """Create a new organization-partner program"""
    try:
        supabase = get_supabase_client()
        response = supabase.table('organization_partner_programs').insert(data.dict()).execute()
        return {"program": response.data[0] if response.data else None}
    except Exception as e:
        logger.error(f"Error creating org-partner program: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/org-partner-programs/{program_id}")
async def update_org_partner_program(program_id: UUID, data: OrgPartnerProgramUpdate, current_user: UserResponse = Depends(get_current_user)):
    """Update an organization-partner program"""
    try:
        supabase = get_supabase_client()
        update_data = {k: v for k, v in data.dict().items() if v is not None}
        response = supabase.table('organization_partner_programs').update(update_data).eq('id', str(program_id)).execute()
        return {"program": response.data[0] if response.data else None}
    except Exception as e:
        logger.error(f"Error updating org-partner program: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/org-partner-programs/{program_id}")
async def delete_org_partner_program(program_id: UUID, current_user: UserResponse = Depends(get_current_user)):
    """Delete an organization-partner program"""
    try:
        supabase = get_supabase_client()
        supabase.table('organization_partner_programs').delete().eq('id', str(program_id)).execute()
        return {"success": True}
    except Exception as e:
        logger.error(f"Error deleting org-partner program: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ==================== ORGANIZATION BENEFIT INDICATOR LINKS ====================

@router.get("/org-benefit-indicator-links")
async def get_org_benefit_indicator_links(organization_id: Optional[UUID] = None, current_user: UserResponse = Depends(get_current_user)):
    """Get all organization-benefit-indicator links"""
    try:
        supabase = get_supabase_client()
        query = supabase.table('organization_benefit_indicator_links').select('*')
        if organization_id:
            query = query.eq('organization_id', str(organization_id))
        response = query.execute()
        return {"links": response.data or []}
    except Exception as e:
        logger.error(f"Error fetching org-benefit-indicator links: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/org-benefit-indicator-links")
async def create_org_benefit_indicator_link(data: OrgBenefitIndicatorLinkCreate, current_user: UserResponse = Depends(get_current_user)):
    """Create a new organization-benefit-indicator link"""
    try:
        supabase = get_supabase_client()
        response = supabase.table('organization_benefit_indicator_links').insert(data.dict()).execute()
        return {"link": response.data[0] if response.data else None}
    except Exception as e:
        logger.error(f"Error creating org-benefit-indicator link: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/org-benefit-indicator-links/{link_id}")
async def update_org_benefit_indicator_link(link_id: UUID, data: OrgBenefitIndicatorLinkUpdate, current_user: UserResponse = Depends(get_current_user)):
    """Update an organization-benefit-indicator link"""
    try:
        supabase = get_supabase_client()
        update_data = {k: v for k, v in data.dict().items() if v is not None}
        response = supabase.table('organization_benefit_indicator_links').update(update_data).eq('id', str(link_id)).execute()
        return {"link": response.data[0] if response.data else None}
    except Exception as e:
        logger.error(f"Error updating org-benefit-indicator link: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/org-benefit-indicator-links/{link_id}")
async def delete_org_benefit_indicator_link(link_id: UUID, current_user: UserResponse = Depends(get_current_user)):
    """Delete an organization-benefit-indicator link"""
    try:
        supabase = get_supabase_client()
        supabase.table('organization_benefit_indicator_links').delete().eq('id', str(link_id)).execute()
        return {"success": True}
    except Exception as e:
        logger.error(f"Error deleting org-benefit-indicator link: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ==================== HELPER ENDPOINTS ====================

@router.get("/organizations")
async def get_organizations(current_user: UserResponse = Depends(get_current_user)):
    """Get all organizations for dropdowns"""
    try:
        supabase = get_supabase_client()
        response = supabase.table('organizations').select('id, name').order('name').execute()
        return {"organizations": response.data or []}
    except Exception as e:
        logger.error(f"Error fetching organizations: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/indicators")
async def get_indicators(current_user: UserResponse = Depends(get_current_user)):
    """Get all biometric indicators for dropdowns"""
    try:
        supabase = get_supabase_client()
        response = supabase.table('param_biometric_indicators_info').select('indicator_code, indicator_name').order('indicator_name').execute()
        return {"indicators": response.data or []}
    except Exception as e:
        logger.error(f"Error fetching indicators: {e}")
        raise HTTPException(status_code=500, detail=str(e))