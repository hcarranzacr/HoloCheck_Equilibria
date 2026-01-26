from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from core.database import get_db
from dependencies.auth import get_current_user
from schemas.auth import UserResponse
from models.param_industries import ParamIndustry

router = APIRouter(prefix="/api/v1/entities/param_industries", tags=["parameters"])


@router.get("")
async def list_industries(
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List all industries"""
    query = select(ParamIndustry).order_by(ParamIndustry.name)
    result = await db.execute(query)
    items = result.scalars().all()
    
    return {
        "items": [
            {
                "id": item.id,
                "name": item.name,
            }
            for item in items
        ]
    }