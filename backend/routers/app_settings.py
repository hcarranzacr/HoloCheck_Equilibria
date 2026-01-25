import json
import logging
from typing import List, Optional

from datetime import datetime, date

from fastapi import APIRouter, Body, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from services.app_settings import App_settingsService

# Set up logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/entities/app_settings", tags=["app_settings"])


# ---------- Pydantic Schemas ----------
class App_settingsData(BaseModel):
    """Entity data schema (for create/update)"""
    setting_key: str
    setting_value: str
    description: str = None
    updated_at: Optional[datetime] = None


class App_settingsUpdateData(BaseModel):
    """Update entity data (partial updates allowed)"""
    setting_key: Optional[str] = None
    setting_value: Optional[str] = None
    description: Optional[str] = None
    updated_at: Optional[datetime] = None


class App_settingsResponse(BaseModel):
    """Entity response schema"""
    id: int
    setting_key: str
    setting_value: str
    description: Optional[str] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class App_settingsListResponse(BaseModel):
    """List response schema"""
    items: List[App_settingsResponse]
    total: int
    skip: int
    limit: int


class App_settingsBatchCreateRequest(BaseModel):
    """Batch create request"""
    items: List[App_settingsData]


class App_settingsBatchUpdateItem(BaseModel):
    """Batch update item"""
    id: int
    updates: App_settingsUpdateData


class App_settingsBatchUpdateRequest(BaseModel):
    """Batch update request"""
    items: List[App_settingsBatchUpdateItem]


class App_settingsBatchDeleteRequest(BaseModel):
    """Batch delete request"""
    ids: List[int]


# ---------- Routes ----------
@router.get("", response_model=App_settingsListResponse)
async def query_app_settingss(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    """Query app_settingss with filtering, sorting, and pagination"""
    logger.debug(f"Querying app_settingss: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")
    
    service = App_settingsService(db)
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
        logger.debug(f"Found {result['total']} app_settingss")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error querying app_settingss: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/all", response_model=App_settingsListResponse)
async def query_app_settingss_all(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    # Query app_settingss with filtering, sorting, and pagination without user limitation
    logger.debug(f"Querying app_settingss: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")

    service = App_settingsService(db)
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
        logger.debug(f"Found {result['total']} app_settingss")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error querying app_settingss: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/{id}", response_model=App_settingsResponse)
async def get_app_settings(
    id: int,
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    """Get a single app_settings by ID"""
    logger.debug(f"Fetching app_settings with id: {id}, fields={fields}")
    
    service = App_settingsService(db)
    try:
        result = await service.get_by_id(id)
        if not result:
            logger.warning(f"App_settings with id {id} not found")
            raise HTTPException(status_code=404, detail="App_settings not found")
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching app_settings {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("", response_model=App_settingsResponse, status_code=201)
async def create_app_settings(
    data: App_settingsData,
    db: AsyncSession = Depends(get_db),
):
    """Create a new app_settings"""
    logger.debug(f"Creating new app_settings with data: {data}")
    
    service = App_settingsService(db)
    try:
        result = await service.create(data.model_dump())
        if not result:
            raise HTTPException(status_code=400, detail="Failed to create app_settings")
        
        logger.info(f"App_settings created successfully with id: {result.id}")
        return result
    except ValueError as e:
        logger.error(f"Validation error creating app_settings: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating app_settings: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/batch", response_model=List[App_settingsResponse], status_code=201)
async def create_app_settingss_batch(
    request: App_settingsBatchCreateRequest,
    db: AsyncSession = Depends(get_db),
):
    """Create multiple app_settingss in a single request"""
    logger.debug(f"Batch creating {len(request.items)} app_settingss")
    
    service = App_settingsService(db)
    results = []
    
    try:
        for item_data in request.items:
            result = await service.create(item_data.model_dump())
            if result:
                results.append(result)
        
        logger.info(f"Batch created {len(results)} app_settingss successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch create: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch create failed: {str(e)}")


@router.put("/batch", response_model=List[App_settingsResponse])
async def update_app_settingss_batch(
    request: App_settingsBatchUpdateRequest,
    db: AsyncSession = Depends(get_db),
):
    """Update multiple app_settingss in a single request"""
    logger.debug(f"Batch updating {len(request.items)} app_settingss")
    
    service = App_settingsService(db)
    results = []
    
    try:
        for item in request.items:
            # Only include non-None values for partial updates
            update_dict = {k: v for k, v in item.updates.model_dump().items() if v is not None}
            result = await service.update(item.id, update_dict)
            if result:
                results.append(result)
        
        logger.info(f"Batch updated {len(results)} app_settingss successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch update: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch update failed: {str(e)}")


@router.put("/{id}", response_model=App_settingsResponse)
async def update_app_settings(
    id: int,
    data: App_settingsUpdateData,
    db: AsyncSession = Depends(get_db),
):
    """Update an existing app_settings"""
    logger.debug(f"Updating app_settings {id} with data: {data}")

    service = App_settingsService(db)
    try:
        # Only include non-None values for partial updates
        update_dict = {k: v for k, v in data.model_dump().items() if v is not None}
        result = await service.update(id, update_dict)
        if not result:
            logger.warning(f"App_settings with id {id} not found for update")
            raise HTTPException(status_code=404, detail="App_settings not found")
        
        logger.info(f"App_settings {id} updated successfully")
        return result
    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"Validation error updating app_settings {id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error updating app_settings {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.delete("/batch")
async def delete_app_settingss_batch(
    request: App_settingsBatchDeleteRequest,
    db: AsyncSession = Depends(get_db),
):
    """Delete multiple app_settingss by their IDs"""
    logger.debug(f"Batch deleting {len(request.ids)} app_settingss")
    
    service = App_settingsService(db)
    deleted_count = 0
    
    try:
        for item_id in request.ids:
            success = await service.delete(item_id)
            if success:
                deleted_count += 1
        
        logger.info(f"Batch deleted {deleted_count} app_settingss successfully")
        return {"message": f"Successfully deleted {deleted_count} app_settingss", "deleted_count": deleted_count}
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch delete: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch delete failed: {str(e)}")


@router.delete("/{id}")
async def delete_app_settings(
    id: int,
    db: AsyncSession = Depends(get_db),
):
    """Delete a single app_settings by ID"""
    logger.debug(f"Deleting app_settings with id: {id}")
    
    service = App_settingsService(db)
    try:
        success = await service.delete(id)
        if not success:
            logger.warning(f"App_settings with id {id} not found for deletion")
            raise HTTPException(status_code=404, detail="App_settings not found")
        
        logger.info(f"App_settings {id} deleted successfully")
        return {"message": "App_settings deleted successfully", "id": id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting app_settings {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")