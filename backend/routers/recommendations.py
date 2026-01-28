import logging
from typing import List, Optional
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from services.recommendations import RecommendationsService
from dependencies.auth import get_current_user
from schemas.auth import UserResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/entities/recommendations", tags=["recommendations"])


# ---------- Pydantic Schemas ----------
class RecommendationData(BaseModel):
    """Recommendation data schema (for create/update)"""
    measurement_id: Optional[str] = None
    analysis_type: str
    recommendation_text: str
    priority: Optional[str] = None
    category: Optional[str] = None
    status: Optional[str] = "active"


class RecommendationUpdateData(BaseModel):
    """Update recommendation data (partial updates allowed)"""
    measurement_id: Optional[str] = None
    analysis_type: Optional[str] = None
    recommendation_text: Optional[str] = None
    priority: Optional[str] = None
    category: Optional[str] = None
    status: Optional[str] = None


class RecommendationResponse(BaseModel):
    """Recommendation response schema"""
    id: int
    user_id: str
    measurement_id: Optional[str] = None
    analysis_type: str
    recommendation_text: str
    priority: Optional[str] = None
    category: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class RecommendationListResponse(BaseModel):
    """List response schema"""
    items: List[RecommendationResponse]
    total: int
    skip: int
    limit: int


# ---------- CRUD Endpoints ----------
@router.get("", response_model=RecommendationListResponse)
async def list_recommendations(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    sort: str = Query("-created_at"),
    status: Optional[str] = Query(None),
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List recommendations for current user"""
    try:
        service = RecommendationsService(db)
        
        query_dict = {}
        if status:
            query_dict['status'] = status
        
        result = await service.get_list(
            skip=skip,
            limit=limit,
            user_id=str(current_user.id),
            query_dict=query_dict,
            sort=sort,
        )
        
        return RecommendationListResponse(
            items=[RecommendationResponse.model_validate(item) for item in result["items"]],
            total=result["total"],
            skip=result["skip"],
            limit=result["limit"],
        )
    except Exception as e:
        logger.error(f"Error listing recommendations: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/{recommendation_id}", response_model=RecommendationResponse)
async def get_recommendation(
    recommendation_id: int,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a recommendation by ID"""
    try:
        service = RecommendationsService(db)
        result = await service.get_by_id(recommendation_id, user_id=str(current_user.id))
        
        if not result:
            raise HTTPException(status_code=404, detail="Recommendation not found")
        
        return RecommendationResponse.model_validate(result)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching recommendation {recommendation_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("", response_model=RecommendationResponse, status_code=201)
async def create_recommendation(
    data: RecommendationData,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new recommendation"""
    try:
        service = RecommendationsService(db)
        result = await service.create(data.model_dump(), user_id=str(current_user.id))
        
        return RecommendationResponse.model_validate(result)
    except Exception as e:
        logger.error(f"Error creating recommendation: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.patch("/{recommendation_id}", response_model=RecommendationResponse)
async def update_recommendation(
    recommendation_id: int,
    data: RecommendationUpdateData,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update a recommendation"""
    try:
        service = RecommendationsService(db)
        
        update_dict = {k: v for k, v in data.model_dump().items() if v is not None}
        if not update_dict:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        result = await service.update(recommendation_id, update_dict, user_id=str(current_user.id))
        
        if not result:
            raise HTTPException(status_code=404, detail="Recommendation not found")
        
        return RecommendationResponse.model_validate(result)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating recommendation {recommendation_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.delete("/{recommendation_id}", status_code=204)
async def delete_recommendation(
    recommendation_id: int,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a recommendation"""
    try:
        service = RecommendationsService(db)
        success = await service.delete(recommendation_id, user_id=str(current_user.id))
        
        if not success:
            raise HTTPException(status_code=404, detail="Recommendation not found")
        
        return None
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting recommendation {recommendation_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")