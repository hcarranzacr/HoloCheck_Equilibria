from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Optional
from core.database import get_db
from dependencies.auth import get_current_user
from schemas.auth import UserResponse
from models.system_audit_logs import SystemAuditLog

router = APIRouter(prefix="/api/v1/entities/system_audit_logs", tags=["system_audit_logs"])


@router.get("")
async def list_audit_logs(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    sort: str = Query("-created_at"),
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List system audit logs with pagination"""
    
    query = select(SystemAuditLog)
    
    # Apply sorting
    if sort.startswith("-"):
        order_field = sort[1:]
        query = query.order_by(getattr(SystemAuditLog, order_field).desc())
    else:
        query = query.order_by(getattr(SystemAuditLog, sort).asc())
    
    # Get total count
    count_query = select(func.count()).select_from(SystemAuditLog)
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
                "actor_user_id": str(item.actor_user_id),
                "action": item.action,
                "entity_type": item.entity_type,
                "entity_id": str(item.entity_id) if item.entity_id else None,
                "organization_id": str(item.organization_id) if item.organization_id else None,
                "department_id": str(item.department_id) if item.department_id else None,
                "role": item.role,
                "action_scope": item.action_scope,
                "description": item.description,
                "metadata": item.metadata,
                "source": item.source,
                "module": item.module,
                "ip_address": item.ip_address,
                "device_info": item.device_info,
                "user_agent": item.user_agent,
                "success": item.success,
                "error_message": item.error_message,
                "correlation_id": str(item.correlation_id) if item.correlation_id else None,
                "created_at": item.created_at.isoformat() if item.created_at else None,
                "updated_at": item.updated_at.isoformat() if item.updated_at else None,
                "environment": item.environment,
            }
            for item in items
        ],
        "total": total,
        "skip": skip,
        "limit": limit,
    }