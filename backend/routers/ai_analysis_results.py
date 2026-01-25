import json
import logging
from typing import List, Optional

from datetime import datetime, date

from fastapi import APIRouter, Body, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from services.ai_analysis_results import Ai_analysis_resultsService
from dependencies.auth import get_current_user
from schemas.auth import UserResponse

# Set up logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/entities/ai_analysis_results", tags=["ai_analysis_results"])


# ---------- Pydantic Schemas ----------
class Ai_analysis_resultsData(BaseModel):
    """Entity data schema (for create/update)"""
    measurement_id: str = None
    department_id: str = None
    organization_id: str = None
    analysis_type: str
    interpretation: str = None
    recommendations: Optional[List[str]] = None
    alert_level: str = None
    prompt_tokens: int = None
    completion_tokens: int = None
    total_tokens: int = None
    created_at: Optional[datetime] = None


class Ai_analysis_resultsUpdateData(BaseModel):
    """Update entity data (partial updates allowed)"""
    measurement_id: Optional[str] = None
    department_id: Optional[str] = None
    organization_id: Optional[str] = None
    analysis_type: Optional[str] = None
    interpretation: Optional[str] = None
    recommendations: Optional[List[str]] = None
    alert_level: Optional[str] = None
    prompt_tokens: Optional[int] = None
    completion_tokens: Optional[int] = None
    total_tokens: Optional[int] = None
    created_at: Optional[datetime] = None


class Ai_analysis_resultsResponse(BaseModel):
    """Entity response schema"""
    id: str
    user_id: str
    measurement_id: Optional[str] = None
    department_id: Optional[str] = None
    organization_id: Optional[str] = None
    analysis_type: str
    interpretation: Optional[str] = None
    recommendations: Optional[List[str]] = None
    alert_level: Optional[str] = None
    prompt_tokens: Optional[int] = None
    completion_tokens: Optional[int] = None
    total_tokens: Optional[int] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class Ai_analysis_resultsListResponse(BaseModel):
    """List response schema"""
    items: List[Ai_analysis_resultsResponse]
    total: int
    skip: int
    limit: int


class Ai_analysis_resultsBatchCreateRequest(BaseModel):
    """Batch create request"""
    items: List[Ai_analysis_resultsData]


class Ai_analysis_resultsBatchUpdateItem(BaseModel):
    """Batch update item"""
    id: int
    updates: Ai_analysis_resultsUpdateData


class Ai_analysis_resultsBatchUpdateRequest(BaseModel):
    """Batch update request"""
    items: List[Ai_analysis_resultsBatchUpdateItem]


class Ai_analysis_resultsBatchDeleteRequest(BaseModel):
    """Batch delete request"""
    ids: List[int]


# ---------- Routes ----------
@router.get("", response_model=Ai_analysis_resultsListResponse)
async def query_ai_analysis_resultss(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Query ai_analysis_resultss with filtering, sorting, and pagination (user can only see their own records)"""
    logger.debug(f"Querying ai_analysis_resultss: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")
    
    service = Ai_analysis_resultsService(db)
    try:
        # Parse query JSON if provided
        query_dict = None
        if query:
            try:
                query_dict = json.loads(query)
            except json.JSONDecodeError:
                raise HTTPException(status_code=400, detail="Invalid query JSON format")
        
        result = await service.get_list(
            skip=skip, 
            limit=limit,
            query_dict=query_dict,
            sort=sort,
            user_id=str(current_user.id),
        )
        logger.debug(f"Found {result['total']} ai_analysis_resultss")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error querying ai_analysis_resultss: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/all", response_model=Ai_analysis_resultsListResponse)
async def query_ai_analysis_resultss_all(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    # Query ai_analysis_resultss with filtering, sorting, and pagination without user limitation
    logger.debug(f"Querying ai_analysis_resultss: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")

    service = Ai_analysis_resultsService(db)
    try:
        # Parse query JSON if provided
        query_dict = None
        if query:
            try:
                query_dict = json.loads(query)
            except json.JSONDecodeError:
                raise HTTPException(status_code=400, detail="Invalid query JSON format")

        result = await service.get_list(
            skip=skip,
            limit=limit,
            query_dict=query_dict,
            sort=sort
        )
        logger.debug(f"Found {result['total']} ai_analysis_resultss")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error querying ai_analysis_resultss: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/{id}", response_model=Ai_analysis_resultsResponse)
async def get_ai_analysis_results(
    id: int,
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a single ai_analysis_results by ID (user can only see their own records)"""
    logger.debug(f"Fetching ai_analysis_results with id: {id}, fields={fields}")
    
    service = Ai_analysis_resultsService(db)
    try:
        result = await service.get_by_id(id, user_id=str(current_user.id))
        if not result:
            logger.warning(f"Ai_analysis_results with id {id} not found")
            raise HTTPException(status_code=404, detail="Ai_analysis_results not found")
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching ai_analysis_results {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("", response_model=Ai_analysis_resultsResponse, status_code=201)
async def create_ai_analysis_results(
    data: Ai_analysis_resultsData,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new ai_analysis_results"""
    logger.debug(f"Creating new ai_analysis_results with data: {data}")
    
    service = Ai_analysis_resultsService(db)
    try:
        result = await service.create(data.model_dump(), user_id=str(current_user.id))
        if not result:
            raise HTTPException(status_code=400, detail="Failed to create ai_analysis_results")
        
        logger.info(f"Ai_analysis_results created successfully with id: {result.id}")
        return result
    except ValueError as e:
        logger.error(f"Validation error creating ai_analysis_results: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating ai_analysis_results: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/batch", response_model=List[Ai_analysis_resultsResponse], status_code=201)
async def create_ai_analysis_resultss_batch(
    request: Ai_analysis_resultsBatchCreateRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create multiple ai_analysis_resultss in a single request"""
    logger.debug(f"Batch creating {len(request.items)} ai_analysis_resultss")
    
    service = Ai_analysis_resultsService(db)
    results = []
    
    try:
        for item_data in request.items:
            result = await service.create(item_data.model_dump(), user_id=str(current_user.id))
            if result:
                results.append(result)
        
        logger.info(f"Batch created {len(results)} ai_analysis_resultss successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch create: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch create failed: {str(e)}")


@router.put("/batch", response_model=List[Ai_analysis_resultsResponse])
async def update_ai_analysis_resultss_batch(
    request: Ai_analysis_resultsBatchUpdateRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update multiple ai_analysis_resultss in a single request (requires ownership)"""
    logger.debug(f"Batch updating {len(request.items)} ai_analysis_resultss")
    
    service = Ai_analysis_resultsService(db)
    results = []
    
    try:
        for item in request.items:
            # Only include non-None values for partial updates
            update_dict = {k: v for k, v in item.updates.model_dump().items() if v is not None}
            result = await service.update(item.id, update_dict, user_id=str(current_user.id))
            if result:
                results.append(result)
        
        logger.info(f"Batch updated {len(results)} ai_analysis_resultss successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch update: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch update failed: {str(e)}")


@router.put("/{id}", response_model=Ai_analysis_resultsResponse)
async def update_ai_analysis_results(
    id: int,
    data: Ai_analysis_resultsUpdateData,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update an existing ai_analysis_results (requires ownership)"""
    logger.debug(f"Updating ai_analysis_results {id} with data: {data}")

    service = Ai_analysis_resultsService(db)
    try:
        # Only include non-None values for partial updates
        update_dict = {k: v for k, v in data.model_dump().items() if v is not None}
        result = await service.update(id, update_dict, user_id=str(current_user.id))
        if not result:
            logger.warning(f"Ai_analysis_results with id {id} not found for update")
            raise HTTPException(status_code=404, detail="Ai_analysis_results not found")
        
        logger.info(f"Ai_analysis_results {id} updated successfully")
        return result
    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"Validation error updating ai_analysis_results {id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error updating ai_analysis_results {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.delete("/batch")
async def delete_ai_analysis_resultss_batch(
    request: Ai_analysis_resultsBatchDeleteRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete multiple ai_analysis_resultss by their IDs (requires ownership)"""
    logger.debug(f"Batch deleting {len(request.ids)} ai_analysis_resultss")
    
    service = Ai_analysis_resultsService(db)
    deleted_count = 0
    
    try:
        for item_id in request.ids:
            success = await service.delete(item_id, user_id=str(current_user.id))
            if success:
                deleted_count += 1
        
        logger.info(f"Batch deleted {deleted_count} ai_analysis_resultss successfully")
        return {"message": f"Successfully deleted {deleted_count} ai_analysis_resultss", "deleted_count": deleted_count}
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch delete: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch delete failed: {str(e)}")


@router.delete("/{id}")
async def delete_ai_analysis_results(
    id: int,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a single ai_analysis_results by ID (requires ownership)"""
    logger.debug(f"Deleting ai_analysis_results with id: {id}")
    
    service = Ai_analysis_resultsService(db)
    try:
        success = await service.delete(id, user_id=str(current_user.id))
        if not success:
            logger.warning(f"Ai_analysis_results with id {id} not found for deletion")
            raise HTTPException(status_code=404, detail="Ai_analysis_results not found")
        
        logger.info(f"Ai_analysis_results {id} deleted successfully")
        return {"message": "Ai_analysis_results deleted successfully", "id": id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting ai_analysis_results {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")