import json
import logging
from typing import List, Optional

from datetime import datetime, date

from fastapi import APIRouter, Body, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from services.system_logs import System_logsService

# Set up logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/entities/system_logs", tags=["system_logs"])


# ---------- Pydantic Schemas ----------
class System_logsData(BaseModel):
    """Entity data schema (for create/update)"""
    log_type: str
    user_id: str = None
    organization_id: str = None
    action: str
    resource: str = None
    ip_address: str = None
    user_agent: str = None
    extra_data: Optional[dict] = None
    created_at: Optional[datetime] = None


class System_logsUpdateData(BaseModel):
    """Update entity data (partial updates allowed)"""
    log_type: Optional[str] = None
    user_id: Optional[str] = None
    organization_id: Optional[str] = None
    action: Optional[str] = None
    resource: Optional[str] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    extra_data: Optional[dict] = None
    created_at: Optional[datetime] = None


class System_logsResponse(BaseModel):
    """Entity response schema"""
    id: int
    log_type: str
    user_id: Optional[str] = None
    organization_id: Optional[str] = None
    action: str
    resource: Optional[str] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    extra_data: Optional[dict] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class System_logsListResponse(BaseModel):
    """List response schema"""
    items: List[System_logsResponse]
    total: int
    skip: int
    limit: int


class System_logsBatchCreateRequest(BaseModel):
    """Batch create request"""
    items: List[System_logsData]


class System_logsBatchUpdateItem(BaseModel):
    """Batch update item"""
    id: int
    updates: System_logsUpdateData


class System_logsBatchUpdateRequest(BaseModel):
    """Batch update request"""
    items: List[System_logsBatchUpdateItem]


class System_logsBatchDeleteRequest(BaseModel):
    """Batch delete request"""
    ids: List[int]


# ---------- Routes ----------
@router.get("", response_model=System_logsListResponse)
async def query_system_logss(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    """Query system_logss with filtering, sorting, and pagination"""
    logger.debug(f"Querying system_logss: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")
    
    service = System_logsService(db)
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
        )
        logger.debug(f"Found {result['total']} system_logss")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error querying system_logss: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/all", response_model=System_logsListResponse)
async def query_system_logss_all(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    # Query system_logss with filtering, sorting, and pagination without user limitation
    logger.debug(f"Querying system_logss: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")

    service = System_logsService(db)
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
        logger.debug(f"Found {result['total']} system_logss")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error querying system_logss: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/{id}", response_model=System_logsResponse)
async def get_system_logs(
    id: int,
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    """Get a single system_logs by ID"""
    logger.debug(f"Fetching system_logs with id: {id}, fields={fields}")
    
    service = System_logsService(db)
    try:
        result = await service.get_by_id(id)
        if not result:
            logger.warning(f"System_logs with id {id} not found")
            raise HTTPException(status_code=404, detail="System_logs not found")
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching system_logs {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("", response_model=System_logsResponse, status_code=201)
async def create_system_logs(
    data: System_logsData,
    db: AsyncSession = Depends(get_db),
):
    """Create a new system_logs"""
    logger.debug(f"Creating new system_logs with data: {data}")
    
    service = System_logsService(db)
    try:
        result = await service.create(data.model_dump())
        if not result:
            raise HTTPException(status_code=400, detail="Failed to create system_logs")
        
        logger.info(f"System_logs created successfully with id: {result.id}")
        return result
    except ValueError as e:
        logger.error(f"Validation error creating system_logs: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating system_logs: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/batch", response_model=List[System_logsResponse], status_code=201)
async def create_system_logss_batch(
    request: System_logsBatchCreateRequest,
    db: AsyncSession = Depends(get_db),
):
    """Create multiple system_logss in a single request"""
    logger.debug(f"Batch creating {len(request.items)} system_logss")
    
    service = System_logsService(db)
    results = []
    
    try:
        for item_data in request.items:
            result = await service.create(item_data.model_dump())
            if result:
                results.append(result)
        
        logger.info(f"Batch created {len(results)} system_logss successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch create: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch create failed: {str(e)}")


@router.put("/batch", response_model=List[System_logsResponse])
async def update_system_logss_batch(
    request: System_logsBatchUpdateRequest,
    db: AsyncSession = Depends(get_db),
):
    """Update multiple system_logss in a single request"""
    logger.debug(f"Batch updating {len(request.items)} system_logss")
    
    service = System_logsService(db)
    results = []
    
    try:
        for item in request.items:
            # Only include non-None values for partial updates
            update_dict = {k: v for k, v in item.updates.model_dump().items() if v is not None}
            result = await service.update(item.id, update_dict)
            if result:
                results.append(result)
        
        logger.info(f"Batch updated {len(results)} system_logss successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch update: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch update failed: {str(e)}")


@router.put("/{id}", response_model=System_logsResponse)
async def update_system_logs(
    id: int,
    data: System_logsUpdateData,
    db: AsyncSession = Depends(get_db),
):
    """Update an existing system_logs"""
    logger.debug(f"Updating system_logs {id} with data: {data}")

    service = System_logsService(db)
    try:
        # Only include non-None values for partial updates
        update_dict = {k: v for k, v in data.model_dump().items() if v is not None}
        result = await service.update(id, update_dict)
        if not result:
            logger.warning(f"System_logs with id {id} not found for update")
            raise HTTPException(status_code=404, detail="System_logs not found")
        
        logger.info(f"System_logs {id} updated successfully")
        return result
    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"Validation error updating system_logs {id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error updating system_logs {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.delete("/batch")
async def delete_system_logss_batch(
    request: System_logsBatchDeleteRequest,
    db: AsyncSession = Depends(get_db),
):
    """Delete multiple system_logss by their IDs"""
    logger.debug(f"Batch deleting {len(request.ids)} system_logss")
    
    service = System_logsService(db)
    deleted_count = 0
    
    try:
        for item_id in request.ids:
            success = await service.delete(item_id)
            if success:
                deleted_count += 1
        
        logger.info(f"Batch deleted {deleted_count} system_logss successfully")
        return {"message": f"Successfully deleted {deleted_count} system_logss", "deleted_count": deleted_count}
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch delete: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch delete failed: {str(e)}")


@router.delete("/{id}")
async def delete_system_logs(
    id: int,
    db: AsyncSession = Depends(get_db),
):
    """Delete a single system_logs by ID"""
    logger.debug(f"Deleting system_logs with id: {id}")
    
    service = System_logsService(db)
    try:
        success = await service.delete(id)
        if not success:
            logger.warning(f"System_logs with id {id} not found for deletion")
            raise HTTPException(status_code=404, detail="System_logs not found")
        
        logger.info(f"System_logs {id} deleted successfully")
        return {"message": "System_logs deleted successfully", "id": id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting system_logs {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")