from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, delete, update
from typing import Optional
from pydantic import BaseModel
from core.database import get_db
from dependencies.auth import get_current_user
from schemas.auth import UserResponse
from models.subscription_plans import SubscriptionPlan
from services.audit_service import AuditService
import uuid

router = APIRouter(prefix="/api/v1/entities/subscription_plans", tags=["subscription_plans"])


class SubscriptionPlanCreate(BaseModel):
    name: str
    slot_range: str
    scan_limit_per_user_per_month: int
    dept_analysis_limit: int
    org_analysis_limit: int
    price: Optional[float] = None


class SubscriptionPlanUpdate(BaseModel):
    name: Optional[str] = None
    slot_range: Optional[str] = None
    scan_limit_per_user_per_month: Optional[int] = None
    dept_analysis_limit: Optional[int] = None
    org_analysis_limit: Optional[int] = None
    price: Optional[float] = None


@router.get("")
async def list_subscription_plans(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    sort: str = Query("-created_at"),
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List subscription plans"""
    query = select(SubscriptionPlan)
    
    # Apply sorting
    if sort.startswith("-"):
        order_field = sort[1:]
        query = query.order_by(getattr(SubscriptionPlan, order_field).desc())
    else:
        query = query.order_by(getattr(SubscriptionPlan, sort).asc())
    
    # Get total count
    count_query = select(func.count()).select_from(SubscriptionPlan)
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
                "name": item.name,
                "slot_range": item.slot_range,
                "scan_limit_per_user_per_month": item.scan_limit_per_user_per_month,
                "dept_analysis_limit": item.dept_analysis_limit,
                "org_analysis_limit": item.org_analysis_limit,
                "price": float(item.price) if item.price else None,
                "created_at": item.created_at.isoformat() if item.created_at else None,
            }
            for item in items
        ],
        "total": total,
        "skip": skip,
        "limit": limit,
    }


@router.get("/{plan_id}")
async def get_subscription_plan(
    plan_id: str,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a subscription plan by ID"""
    query = select(SubscriptionPlan).where(SubscriptionPlan.id == plan_id)
    result = await db.execute(query)
    item = result.scalar_one_or_none()
    
    if not item:
        raise HTTPException(status_code=404, detail="Subscription plan not found")
    
    return {
        "id": str(item.id),
        "name": item.name,
        "slot_range": item.slot_range,
        "scan_limit_per_user_per_month": item.scan_limit_per_user_per_month,
        "dept_analysis_limit": item.dept_analysis_limit,
        "org_analysis_limit": item.org_analysis_limit,
        "price": float(item.price) if item.price else None,
        "created_at": item.created_at.isoformat() if item.created_at else None,
    }


@router.post("")
async def create_subscription_plan(
    data: SubscriptionPlanCreate,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new subscription plan"""
    plan_id = str(uuid.uuid4())
    
    new_plan = SubscriptionPlan(
        id=plan_id,
        name=data.name,
        slot_range=data.slot_range,
        scan_limit_per_user_per_month=data.scan_limit_per_user_per_month,
        dept_analysis_limit=data.dept_analysis_limit,
        org_analysis_limit=data.org_analysis_limit,
        price=data.price,
    )
    
    db.add(new_plan)
    await db.commit()
    await db.refresh(new_plan)
    
    # Audit log
    await AuditService.log_crud_operation(
        db=db,
        actor_user_id=current_user.id,
        action="create",
        entity_type="SubscriptionPlan",
        entity_id=plan_id,
        new_data=data.dict(),
        role=getattr(current_user, 'role', None),
    )
    
    return {
        "id": str(new_plan.id),
        "name": new_plan.name,
        "slot_range": new_plan.slot_range,
        "scan_limit_per_user_per_month": new_plan.scan_limit_per_user_per_month,
        "dept_analysis_limit": new_plan.dept_analysis_limit,
        "org_analysis_limit": new_plan.org_analysis_limit,
        "price": float(new_plan.price) if new_plan.price else None,
        "created_at": new_plan.created_at.isoformat() if new_plan.created_at else None,
    }


@router.put("/{plan_id}")
async def update_subscription_plan(
    plan_id: str,
    data: SubscriptionPlanUpdate,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update a subscription plan"""
    query = select(SubscriptionPlan).where(SubscriptionPlan.id == plan_id)
    result = await db.execute(query)
    plan = result.scalar_one_or_none()
    
    if not plan:
        raise HTTPException(status_code=404, detail="Subscription plan not found")
    
    # Store old data for audit
    old_data = {
        "name": plan.name,
        "slot_range": plan.slot_range,
        "scan_limit_per_user_per_month": plan.scan_limit_per_user_per_month,
        "dept_analysis_limit": plan.dept_analysis_limit,
        "org_analysis_limit": plan.org_analysis_limit,
        "price": float(plan.price) if plan.price else None,
    }
    
    # Update fields
    update_data = data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(plan, key, value)
    
    await db.commit()
    await db.refresh(plan)
    
    # Audit log
    await AuditService.log_crud_operation(
        db=db,
        actor_user_id=current_user.id,
        action="update",
        entity_type="SubscriptionPlan",
        entity_id=plan_id,
        old_data=old_data,
        new_data=update_data,
        role=getattr(current_user, 'role', None),
    )
    
    return {
        "id": str(plan.id),
        "name": plan.name,
        "slot_range": plan.slot_range,
        "scan_limit_per_user_per_month": plan.scan_limit_per_user_per_month,
        "dept_analysis_limit": plan.dept_analysis_limit,
        "org_analysis_limit": plan.org_analysis_limit,
        "price": float(plan.price) if plan.price else None,
        "created_at": plan.created_at.isoformat() if plan.created_at else None,
    }


@router.delete("/{plan_id}")
async def delete_subscription_plan(
    plan_id: str,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a subscription plan"""
    query = select(SubscriptionPlan).where(SubscriptionPlan.id == plan_id)
    result = await db.execute(query)
    plan = result.scalar_one_or_none()
    
    if not plan:
        raise HTTPException(status_code=404, detail="Subscription plan not found")
    
    # Store data for audit
    old_data = {
        "name": plan.name,
        "slot_range": plan.slot_range,
        "scan_limit_per_user_per_month": plan.scan_limit_per_user_per_month,
        "dept_analysis_limit": plan.dept_analysis_limit,
        "org_analysis_limit": plan.org_analysis_limit,
        "price": float(plan.price) if plan.price else None,
    }
    
    await db.delete(plan)
    await db.commit()
    
    # Audit log
    await AuditService.log_crud_operation(
        db=db,
        actor_user_id=current_user.id,
        action="delete",
        entity_type="SubscriptionPlan",
        entity_id=plan_id,
        old_data=old_data,
        role=getattr(current_user, 'role', None),
    )
    
    return {"message": "Subscription plan deleted successfully"}