import logging
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from core.database import get_db
from dependencies.auth import get_current_user
from schemas.auth import UserResponse
from models.organization_usage_summary import OrganizationUsageSummary
from services.audit_service import AuditService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/entities/organization_usage_summary", tags=["organization_usage"])


@router.get("")
async def list_organization_usage_summary(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    sort: str = Query("-month"),
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List organization usage summaries"""
    query = select(OrganizationUsageSummary)
    
    # Apply sorting
    if sort.startswith("-"):
        order_field = sort[1:]
        query = query.order_by(getattr(OrganizationUsageSummary, order_field).desc())
    else:
        query = query.order_by(getattr(OrganizationUsageSummary, sort).asc())
    
    # Get total count
    count_query = select(func.count()).select_from(OrganizationUsageSummary)
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
            table_name="organization_usage_summary",
            record_id="list",
            new_data={"count": len(items), "skip": skip, "limit": limit}
        )
    except Exception as e:
        logger.error(f"Audit logging failed: {e}")
    
    return {
        "items": [
            {
                "id": str(item.id),
                "organization_id": str(item.organization_id),
                "month": item.month.isoformat() if item.month else None,
                "total_ai_tokens_used": item.total_ai_tokens_used,
                "total_scans": item.total_scans,
                "total_prompts_used": item.total_prompts_used,
                "total_user_scans": item.total_user_scans,
                "total_valid_scans": item.total_valid_scans,
                "total_invalid_scans": item.total_invalid_scans,
                "total_biometric_scans": item.total_biometric_scans,
                "total_voice_scans": item.total_voice_scans,
                "scan_limit_reached": item.scan_limit_reached,
                "created_at": item.created_at.isoformat() if item.created_at else None,
            }
            for item in items
        ],
        "total": total,
        "skip": skip,
        "limit": limit,
    }