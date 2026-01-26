import logging
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from core.database import get_db
from dependencies.auth import get_current_user
from schemas.auth import UserResponse
from models.organization_insights import OrganizationInsight
from services.audit_service import AuditService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/entities/organization_insights", tags=["organization_insights"])


@router.get("")
async def list_organization_insights(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    sort: str = Query("-updated_at"),
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List organization insights"""
    query = select(OrganizationInsight)
    
    # Apply sorting
    if sort.startswith("-"):
        order_field = sort[1:]
        query = query.order_by(getattr(OrganizationInsight, order_field).desc())
    else:
        query = query.order_by(getattr(OrganizationInsight, sort).asc())
    
    # Get total count
    count_query = select(func.count()).select_from(OrganizationInsight)
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    # Apply pagination
    query = query.offset(skip).limit(limit)
    
    result = await db.execute(query)
    items = result.scalars().all()
    
    # Audit log
    try:
        await AuditService.log_crud_operation(
            db=db,
            user_id=str(current_user.id),
            action="read",
            table_name="organization_insights",
            record_id="list",
            new_data={"count": len(items), "skip": skip, "limit": limit}
        )
    except Exception as e:
        logger.error(f"Audit logging failed: {e}")
    
    return {
        "items": [
            {
                "id": str(item.id),
                "organization_id": str(item.organization_id) if item.organization_id else None,
                "analysis_date": item.analysis_date.isoformat() if item.analysis_date else None,
                "total_employees": item.total_employees,
                "stress_index": float(item.stress_index) if item.stress_index else None,
                "burnout_risk": float(item.burnout_risk) if item.burnout_risk else None,
                "sleep_index": float(item.sleep_index) if item.sleep_index else None,
                "actuarial_risk": float(item.actuarial_risk) if item.actuarial_risk else None,
                "claim_risk": float(item.claim_risk) if item.claim_risk else None,
                "updated_at": item.updated_at.isoformat() if item.updated_at else None,
            }
            for item in items
        ],
        "total": total,
        "skip": skip,
        "limit": limit,
    }