from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from core.database import get_db
from dependencies.auth import get_current_user
from schemas.auth import UserResponse
from models.ai_analysis_logs import AIAnalysisLog

router = APIRouter(prefix="/api/v1/entities/ai_analysis_logs", tags=["ai_analysis_logs"])


@router.get("")
async def list_ai_analysis_logs(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    sort: str = Query("-created_at"),
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List AI analysis logs"""
    query = select(AIAnalysisLog)
    
    # Apply sorting
    if sort.startswith("-"):
        order_field = sort[1:]
        query = query.order_by(getattr(AIAnalysisLog, order_field).desc())
    else:
        query = query.order_by(getattr(AIAnalysisLog, sort).asc())
    
    # Get total count
    count_query = select(func.count()).select_from(AIAnalysisLog)
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
                "user_id": str(item.user_id) if item.user_id else None,
                "analysis_type": item.analysis_type,
                "openai_model": item.openai_model,
                "input_size_kb": float(item.input_size_kb) if item.input_size_kb else None,
                "output_tokens": item.output_tokens,
                "cost_usd": float(item.cost_usd) if item.cost_usd else None,
                "created_at": item.created_at.isoformat() if item.created_at else None,
            }
            for item in items
        ],
        "total": total,
        "skip": skip,
        "limit": limit,
    }