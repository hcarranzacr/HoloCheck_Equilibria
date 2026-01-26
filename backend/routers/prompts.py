import json
import logging
from typing import List, Optional

from datetime import datetime, date

from fastapi import APIRouter, Body, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from services.prompts import PromptsService
from services.audit_service import AuditService
from dependencies.auth import get_current_user
from schemas.auth import UserResponse

# Set up logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/entities/prompts", tags=["prompts"])


# ---------- Pydantic Schemas ----------
class PromptsData(BaseModel):
    """Entity data schema (for create/update)"""
    organization_id: str = None
    target: str
    prompt_text: str
    model_version: str = None
    active: bool = None
    created_at: Optional[datetime] = None


class PromptsUpdateData(BaseModel):
    """Update entity data (partial updates allowed)"""
    organization_id: Optional[str] = None
    target: Optional[str] = None
    prompt_text: Optional[str] = None
    model_version: Optional[str] = None
    active: Optional[bool] = None
    created_at: Optional[datetime] = None


class PromptsResponse(BaseModel):
    """Entity response schema"""
    id: int
    organization_id: Optional[str] = None
    target: str
    prompt_text: str
    model_version: Optional[str] = None
    active: Optional[bool] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class PromptsListResponse(BaseModel):
    """List response schema"""
    items: List[PromptsResponse]
    total: int
    skip: int
    limit: int


class PromptsBatchCreateRequest(BaseModel):
    """Batch create request"""
    items: List[PromptsData]


class PromptsBatchUpdateItem(BaseModel):
    """Batch update item"""
    id: int
    updates: PromptsUpdateData


class PromptsBatchUpdateRequest(BaseModel):
    """Batch update request"""
    items: List[PromptsBatchUpdateItem]


class PromptsBatchDeleteRequest(BaseModel):
    """Batch delete request"""
    ids: List[int]


# ---------- Routes ----------
@router.get("", response_model=PromptsListResponse)
async def query_promptss(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    """Query promptss with filtering, sorting, and pagination"""
    logger.debug(f"Querying promptss: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")
    
    service = PromptsService(db)
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
        logger.debug(f"Found {result['total']} promptss")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error querying promptss: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/all", response_model=PromptsListResponse)
async def query_promptss_all(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    # Query promptss with filtering, sorting, and pagination without user limitation
    logger.debug(f"Querying promptss: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")

    service = PromptsService(db)
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
        logger.debug(f"Found {result['total']} promptss")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error querying promptss: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/{id}", response_model=PromptsResponse)
async def get_prompts(
    id: int,
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    """Get a single prompts by ID"""
    logger.debug(f"Fetching prompts with id: {id}, fields={fields}")
    
    service = PromptsService(db)
    try:
        result = await service.get_by_id(id)
        if not result:
            logger.warning(f"Prompts with id {id} not found")
            raise HTTPException(status_code=404, detail="Prompts not found")
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching prompts {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("", response_model=PromptsResponse, status_code=201)
async def create_prompts(
    data: PromptsData,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new prompts"""
    logger.debug(f"Creating new prompts with data: {data}")
    
    service = PromptsService(db)
    try:
        result = await service.create(data.model_dump())
        if not result:
            raise HTTPException(status_code=400, detail="Failed to create prompts")
        
        # Audit logging
        try:
            await AuditService.log_crud_operation(
                db=db,
                actor_user_id=str(current_user.id),
                action="create",
                entity_type="prompts",
                entity_id=str(result.id),
                new_data=data.model_dump(),
                organization_id=data.organization_id,
                role=current_user.role,
            )
        except Exception as audit_error:
            logger.error(f"Audit logging failed: {audit_error}")
        
        logger.info(f"Prompts created successfully with id: {result.id}")
        return result
    except ValueError as e:
        logger.error(f"Validation error creating prompts: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating prompts: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/batch", response_model=List[PromptsResponse], status_code=201)
async def create_promptss_batch(
    request: PromptsBatchCreateRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create multiple promptss in a single request"""
    logger.debug(f"Batch creating {len(request.items)} promptss")
    
    service = PromptsService(db)
    results = []
    
    try:
        for item_data in request.items:
            result = await service.create(item_data.model_dump())
            if result:
                results.append(result)
                
                # Audit logging
                try:
                    await AuditService.log_crud_operation(
                        db=db,
                        actor_user_id=str(current_user.id),
                        action="create",
                        entity_type="prompts",
                        entity_id=str(result.id),
                        new_data=item_data.model_dump(),
                        organization_id=item_data.organization_id,
                        role=current_user.role,
                    )
                except Exception as audit_error:
                    logger.error(f"Audit logging failed: {audit_error}")
        
        logger.info(f"Batch created {len(results)} promptss successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch create: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch create failed: {str(e)}")


@router.put("/batch", response_model=List[PromptsResponse])
async def update_promptss_batch(
    request: PromptsBatchUpdateRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update multiple promptss in a single request"""
    logger.debug(f"Batch updating {len(request.items)} promptss")
    
    service = PromptsService(db)
    results = []
    
    try:
        for item in request.items:
            # Get old data before update
            old_entity = await service.get_by_id(item.id)
            old_data = {k: v for k, v in old_entity.__dict__.items() if not k.startswith('_')} if old_entity else None
            
            # Only include non-None values for partial updates
            update_dict = {k: v for k, v in item.updates.model_dump().items() if v is not None}
            result = await service.update(item.id, update_dict)
            if result:
                results.append(result)
                
                # Audit logging
                try:
                    await AuditService.log_crud_operation(
                        db=db,
                        actor_user_id=str(current_user.id),
                        action="update",
                        entity_type="prompts",
                        entity_id=str(item.id),
                        old_data=old_data,
                        new_data=update_dict,
                        organization_id=str(result.organization_id) if result.organization_id else None,
                        role=current_user.role,
                    )
                except Exception as audit_error:
                    logger.error(f"Audit logging failed: {audit_error}")
        
        logger.info(f"Batch updated {len(results)} promptss successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch update: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch update failed: {str(e)}")


@router.put("/{id}", response_model=PromptsResponse)
async def update_prompts(
    id: int,
    data: PromptsUpdateData,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update an existing prompts"""
    logger.debug(f"Updating prompts {id} with data: {data}")

    service = PromptsService(db)
    try:
        # Get old data before update
        old_entity = await service.get_by_id(id)
        if not old_entity:
            logger.warning(f"Prompts with id {id} not found for update")
            raise HTTPException(status_code=404, detail="Prompts not found")
        
        old_data = {k: v for k, v in old_entity.__dict__.items() if not k.startswith('_')}
        
        # Only include non-None values for partial updates
        update_dict = {k: v for k, v in data.model_dump().items() if v is not None}
        result = await service.update(id, update_dict)
        
        # Audit logging
        try:
            await AuditService.log_crud_operation(
                db=db,
                actor_user_id=str(current_user.id),
                action="update",
                entity_type="prompts",
                entity_id=str(id),
                old_data=old_data,
                new_data=update_dict,
                organization_id=str(result.organization_id) if result.organization_id else None,
                role=current_user.role,
            )
        except Exception as audit_error:
            logger.error(f"Audit logging failed: {audit_error}")
        
        logger.info(f"Prompts {id} updated successfully")
        return result
    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"Validation error updating prompts {id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error updating prompts {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.delete("/batch")
async def delete_promptss_batch(
    request: PromptsBatchDeleteRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete multiple promptss by their IDs"""
    logger.debug(f"Batch deleting {len(request.ids)} promptss")
    
    service = PromptsService(db)
    deleted_count = 0
    
    try:
        for item_id in request.ids:
            # Get old data before delete
            old_entity = await service.get_by_id(item_id)
            old_data = {k: v for k, v in old_entity.__dict__.items() if not k.startswith('_')} if old_entity else None
            
            success = await service.delete(item_id)
            if success:
                deleted_count += 1
                
                # Audit logging
                try:
                    await AuditService.log_crud_operation(
                        db=db,
                        actor_user_id=str(current_user.id),
                        action="delete",
                        entity_type="prompts",
                        entity_id=str(item_id),
                        old_data=old_data,
                        organization_id=str(old_entity.organization_id) if old_entity and old_entity.organization_id else None,
                        role=current_user.role,
                    )
                except Exception as audit_error:
                    logger.error(f"Audit logging failed: {audit_error}")
        
        logger.info(f"Batch deleted {deleted_count} promptss successfully")
        return {"message": f"Successfully deleted {deleted_count} promptss", "deleted_count": deleted_count}
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch delete: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch delete failed: {str(e)}")


@router.delete("/{id}")
async def delete_prompts(
    id: int,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a single prompts by ID"""
    logger.debug(f"Deleting prompts with id: {id}")
    
    service = PromptsService(db)
    try:
        # Get old data before delete
        old_entity = await service.get_by_id(id)
        if not old_entity:
            logger.warning(f"Prompts with id {id} not found for deletion")
            raise HTTPException(status_code=404, detail="Prompts not found")
        
        old_data = {k: v for k, v in old_entity.__dict__.items() if not k.startswith('_')}
        
        success = await service.delete(id)
        
        # Audit logging
        try:
            await AuditService.log_crud_operation(
                db=db,
                actor_user_id=str(current_user.id),
                action="delete",
                entity_type="prompts",
                entity_id=str(id),
                old_data=old_data,
                organization_id=str(old_entity.organization_id) if old_entity.organization_id else None,
                role=current_user.role,
            )
        except Exception as audit_error:
            logger.error(f"Audit logging failed: {audit_error}")
        
        logger.info(f"Prompts {id} deleted successfully")
        return {"message": "Prompts deleted successfully", "id": id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting prompts {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")