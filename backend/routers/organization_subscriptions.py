from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Optional
from pydantic import BaseModel
from datetime import date
from core.database import get_db
from dependencies.auth import get_current_user
from schemas.auth import UserResponse
from models.organization_subscriptions import OrganizationSubscription
from services.audit_service import AuditService
import uuid

router = APIRouter(prefix="/api/v1/entities/organization_subscriptions", tags=["organization_subscriptions"])


class OrganizationSubscriptionCreate(BaseModel):
    organization_id: str
    subscription_plan_id: str
    start_date: date
    end_date: date
    scan_limit_per_user_per_month: int = 2
    dept_analysis_limit: int = 1
    org_analysis_limit: int = 1
    max_users_allowed: Optional[int] = None


class OrganizationSubscriptionUpdate(BaseModel):
    subscription_plan_id: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    active: Optional[bool] = None
    scan_limit_per_user_per_month: Optional[int] = None
    dept_analysis_limit: Optional[int] = None
    org_analysis_limit: Optional[int] = None
    max_users_allowed: Optional[int] = None
    allow_employee_ai_feedback: Optional[bool] = None
    enable_branding: Optional[bool] = None


@router.get("")
async def list_organization_subscriptions(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    sort: str = Query("-created_at"),
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List organization subscriptions"""
    query = select(OrganizationSubscription)
    
    # Apply sorting
    if sort.startswith("-"):
        order_field = sort[1:]
        query = query.order_by(getattr(OrganizationSubscription, order_field).desc())
    else:
        query = query.order_by(getattr(OrganizationSubscription, sort).asc())
    
    # Get total count
    count_query = select(func.count()).select_from(OrganizationSubscription)
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
                "organization_id": str(item.organization_id),
                "subscription_plan_id": str(item.subscription_plan_id),
                "start_date": item.start_date.isoformat() if item.start_date else None,
                "end_date": item.end_date.isoformat() if item.end_date else None,
                "active": item.active,
                "scan_limit_per_user_per_month": item.scan_limit_per_user_per_month,
                "dept_analysis_limit": item.dept_analysis_limit,
                "org_analysis_limit": item.org_analysis_limit,
                "max_users_allowed": item.max_users_allowed,
                "used_scans_total": item.used_scans_total,
                "used_dept_analyses": item.used_dept_analyses,
                "used_org_analyses": item.used_org_analyses,
                "current_month": item.current_month.isoformat() if item.current_month else None,
                "monthly_reset_day": item.monthly_reset_day,
                "last_reset": item.last_reset.isoformat() if item.last_reset else None,
                "allow_employee_ai_feedback": item.allow_employee_ai_feedback,
                "enable_branding": item.enable_branding,
                "created_at": item.created_at.isoformat() if item.created_at else None,
                "updated_at": item.updated_at.isoformat() if item.updated_at else None,
            }
            for item in items
        ],
        "total": total,
        "skip": skip,
        "limit": limit,
    }


@router.get("/{subscription_id}")
async def get_organization_subscription(
    subscription_id: str,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get an organization subscription by ID"""
    query = select(OrganizationSubscription).where(OrganizationSubscription.id == subscription_id)
    result = await db.execute(query)
    item = result.scalar_one_or_none()
    
    if not item:
        raise HTTPException(status_code=404, detail="Organization subscription not found")
    
    return {
        "id": str(item.id),
        "organization_id": str(item.organization_id),
        "subscription_plan_id": str(item.subscription_plan_id),
        "start_date": item.start_date.isoformat() if item.start_date else None,
        "end_date": item.end_date.isoformat() if item.end_date else None,
        "active": item.active,
        "scan_limit_per_user_per_month": item.scan_limit_per_user_per_month,
        "dept_analysis_limit": item.dept_analysis_limit,
        "org_analysis_limit": item.org_analysis_limit,
        "max_users_allowed": item.max_users_allowed,
        "used_scans_total": item.used_scans_total,
        "used_dept_analyses": item.used_dept_analyses,
        "used_org_analyses": item.used_org_analyses,
        "current_month": item.current_month.isoformat() if item.current_month else None,
        "monthly_reset_day": item.monthly_reset_day,
        "last_reset": item.last_reset.isoformat() if item.last_reset else None,
        "allow_employee_ai_feedback": item.allow_employee_ai_feedback,
        "enable_branding": item.enable_branding,
        "created_at": item.created_at.isoformat() if item.created_at else None,
        "updated_at": item.updated_at.isoformat() if item.updated_at else None,
    }


@router.post("")
async def create_organization_subscription(
    data: OrganizationSubscriptionCreate,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new organization subscription"""
    subscription_id = str(uuid.uuid4())
    
    new_subscription = OrganizationSubscription(
        id=subscription_id,
        organization_id=data.organization_id,
        subscription_plan_id=data.subscription_plan_id,
        start_date=data.start_date,
        end_date=data.end_date,
        scan_limit_per_user_per_month=data.scan_limit_per_user_per_month,
        dept_analysis_limit=data.dept_analysis_limit,
        org_analysis_limit=data.org_analysis_limit,
        max_users_allowed=data.max_users_allowed,
    )
    
    db.add(new_subscription)
    await db.commit()
    await db.refresh(new_subscription)
    
    # Audit log
    await AuditService.log_crud_operation(
        db=db,
        actor_user_id=current_user.id,
        action="create",
        entity_type="OrganizationSubscription",
        entity_id=subscription_id,
        new_data=data.dict(),
        organization_id=data.organization_id,
        role=getattr(current_user, 'role', None),
    )
    
    return {
        "id": str(new_subscription.id),
        "organization_id": str(new_subscription.organization_id),
        "subscription_plan_id": str(new_subscription.subscription_plan_id),
        "start_date": new_subscription.start_date.isoformat() if new_subscription.start_date else None,
        "end_date": new_subscription.end_date.isoformat() if new_subscription.end_date else None,
        "active": new_subscription.active,
        "created_at": new_subscription.created_at.isoformat() if new_subscription.created_at else None,
    }


@router.put("/{subscription_id}")
async def update_organization_subscription(
    subscription_id: str,
    data: OrganizationSubscriptionUpdate,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update an organization subscription"""
    query = select(OrganizationSubscription).where(OrganizationSubscription.id == subscription_id)
    result = await db.execute(query)
    subscription = result.scalar_one_or_none()
    
    if not subscription:
        raise HTTPException(status_code=404, detail="Organization subscription not found")
    
    # Store old data for audit
    old_data = {
        "subscription_plan_id": str(subscription.subscription_plan_id),
        "start_date": subscription.start_date.isoformat() if subscription.start_date else None,
        "end_date": subscription.end_date.isoformat() if subscription.end_date else None,
        "active": subscription.active,
        "scan_limit_per_user_per_month": subscription.scan_limit_per_user_per_month,
        "dept_analysis_limit": subscription.dept_analysis_limit,
        "org_analysis_limit": subscription.org_analysis_limit,
        "max_users_allowed": subscription.max_users_allowed,
        "allow_employee_ai_feedback": subscription.allow_employee_ai_feedback,
        "enable_branding": subscription.enable_branding,
    }
    
    # Update fields
    update_data = data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(subscription, key, value)
    
    await db.commit()
    await db.refresh(subscription)
    
    # Audit log
    await AuditService.log_crud_operation(
        db=db,
        actor_user_id=current_user.id,
        action="update",
        entity_type="OrganizationSubscription",
        entity_id=subscription_id,
        old_data=old_data,
        new_data=update_data,
        organization_id=str(subscription.organization_id),
        role=getattr(current_user, 'role', None),
    )
    
    return {
        "id": str(subscription.id),
        "organization_id": str(subscription.organization_id),
        "subscription_plan_id": str(subscription.subscription_plan_id),
        "start_date": subscription.start_date.isoformat() if subscription.start_date else None,
        "end_date": subscription.end_date.isoformat() if subscription.end_date else None,
        "active": subscription.active,
        "updated_at": subscription.updated_at.isoformat() if subscription.updated_at else None,
    }