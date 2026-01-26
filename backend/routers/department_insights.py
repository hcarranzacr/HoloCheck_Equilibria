import json
import logging
from typing import List, Optional

from datetime import datetime, date

from fastapi import APIRouter, Body, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from services.department_insights import Department_insightsService
from services.audit_service import AuditService
from dependencies.auth import get_current_user
from schemas.auth import UserResponse

# Set up logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/entities/department_insights", tags=["department_insights"])


# ---------- Pydantic Schemas ----------
class Department_insightsData(BaseModel):
    """Entity data schema (for create/update)"""
    department_id: str
    period_start: Optional[date] = None
    period_end: Optional[date] = None
    avg_health_score: float = None
    avg_stress: float = None
    avg_recovery: float = None
    participation_rate: float = None
    high_risk_count: int = None
    summary: str = None
    recommendations: Optional[List[str]] = None
    created_at: Optional[datetime] = None


class Department_insightsUpdateData(BaseModel):
    """Update entity data (partial updates allowed)"""
    department_id: Optional[str] = None
    period_start: Optional[date] = None
    period_end: Optional[date] = None
    avg_health_score: Optional[float] = None
    avg_stress: Optional[float] = None
    avg_recovery: Optional[float] = None
    participation_rate: Optional[float] = None
    high_risk_count: Optional[int] = None
    summary: Optional[str] = None
    recommendations: Optional[List[str]] = None
    created_at: Optional[datetime] = None


class Department_insightsResponse(BaseModel):
    """Entity response schema"""
    id: str
    user_id: str
    department_id: str
    period_start: Optional[date] = None
    period_end: Optional[date] = None
    avg_health_score: Optional[float] = None
    avg_stress: Optional[float] = None
    avg_recovery: Optional[float] = None
    participation_rate: Optional[float] = None
    high_risk_count: Optional[int] = None
    summary: Optional[str] = None
    recommendations: Optional[List[str]] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class Department_insightsListResponse(BaseModel):
    """List response schema"""
    items: List[Department_insightsResponse]
    total: int
    skip: int
    limit: int


class Department_insightsBatchCreateRequest(BaseModel):
    """Batch create request"""
    items: List[Department_insightsData]


class Department_insightsBatchUpdateItem(BaseModel):
    """Batch update item"""
    id: int
    updates: Department_insightsUpdateData


class Department_insightsBatchUpdateRequest(BaseModel):
    """Batch update request"""
    items: List[Department_insightsBatchUpdateItem]


class Department_insightsBatchDeleteRequest(BaseModel):
    """Batch delete request"""
    ids: List[int]


# ---------- Routes ----------
@router.get("", response_model=Department_insightsListResponse)
async def query_department_insightss(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Query department_insightss with filtering, sorting, and pagination (user can only see their own records)"""
    logger.debug(f"Querying department_insightss: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")
    
    service = Department_insightsService(db)
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
        logger.debug(f"Found {result['total']} department_insightss")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error querying department_insightss: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/all", response_model=Department_insightsListResponse)
async def query_department_insightss_all(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    # Query department_insightss with filtering, sorting, and pagination without user limitation
    logger.debug(f"Querying department_insightss: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")

    service = Department_insightsService(db)
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
        logger.debug(f"Found {result['total']} department_insightss")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error querying department_insightss: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/{id}", response_model=Department_insightsResponse)
async def get_department_insights(
    id: int,
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a single department_insights by ID (user can only see their own records)"""
    logger.debug(f"Fetching department_insights with id: {id}, fields={fields}")
    
    service = Department_insightsService(db)
    try:
        result = await service.get_by_id(id, user_id=str(current_user.id))
        if not result:
            logger.warning(f"Department_insights with id {id} not found")
            raise HTTPException(status_code=404, detail="Department_insights not found")
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching department_insights {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("", response_model=Department_insightsResponse, status_code=201)
async def create_department_insights(
    data: Department_insightsData,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new department_insights"""
    logger.debug(f"Creating new department_insights with data: {data}")
    
    service = Department_insightsService(db)
    try:
        result = await service.create(data.model_dump(), user_id=str(current_user.id))
        if not result:
            raise HTTPException(status_code=400, detail="Failed to create department_insights")
        
        # Audit logging
        try:
            await AuditService.log_crud_operation(
                db=db,
                actor_user_id=str(current_user.id),
                action="create",
                entity_type="department_insights",
                entity_id=str(result.id),
                new_data=data.model_dump(),
                department_id=data.department_id,
                role=current_user.role,
            )
        except Exception as audit_error:
            logger.error(f"Audit logging failed: {audit_error}")
        
        logger.info(f"Department_insights created successfully with id: {result.id}")
        return result
    except ValueError as e:
        logger.error(f"Validation error creating department_insights: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating department_insights: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/batch", response_model=List[Department_insightsResponse], status_code=201)
async def create_department_insightss_batch(
    request: Department_insightsBatchCreateRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create multiple department_insightss in a single request"""
    logger.debug(f"Batch creating {len(request.items)} department_insightss")
    
    service = Department_insightsService(db)
    results = []
    
    try:
        for item_data in request.items:
            result = await service.create(item_data.model_dump(), user_id=str(current_user.id))
            if result:
                results.append(result)
                
                # Audit logging
                try:
                    await AuditService.log_crud_operation(
                        db=db,
                        actor_user_id=str(current_user.id),
                        action="create",
                        entity_type="department_insights",
                        entity_id=str(result.id),
                        new_data=item_data.model_dump(),
                        department_id=item_data.department_id,
                        role=current_user.role,
                    )
                except Exception as audit_error:
                    logger.error(f"Audit logging failed: {audit_error}")
        
        logger.info(f"Batch created {len(results)} department_insightss successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch create: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch create failed: {str(e)}")


@router.put("/batch", response_model=List[Department_insightsResponse])
async def update_department_insightss_batch(
    request: Department_insightsBatchUpdateRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update multiple department_insightss in a single request (requires ownership)"""
    logger.debug(f"Batch updating {len(request.items)} department_insightss")
    
    service = Department_insightsService(db)
    results = []
    
    try:
        for item in request.items:
            # Get old data before update
            old_entity = await service.get_by_id(item.id, user_id=str(current_user.id))
            old_data = {k: v for k, v in old_entity.__dict__.items() if not k.startswith('_')} if old_entity else None
            
            # Only include non-None values for partial updates
            update_dict = {k: v for k, v in item.updates.model_dump().items() if v is not None}
            result = await service.update(item.id, update_dict, user_id=str(current_user.id))
            if result:
                results.append(result)
                
                # Audit logging
                try:
                    await AuditService.log_crud_operation(
                        db=db,
                        actor_user_id=str(current_user.id),
                        action="update",
                        entity_type="department_insights",
                        entity_id=str(item.id),
                        old_data=old_data,
                        new_data=update_dict,
                        department_id=str(result.department_id),
                        role=current_user.role,
                    )
                except Exception as audit_error:
                    logger.error(f"Audit logging failed: {audit_error}")
        
        logger.info(f"Batch updated {len(results)} department_insightss successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch update: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch update failed: {str(e)}")


@router.put("/{id}", response_model=Department_insightsResponse)
async def update_department_insights(
    id: int,
    data: Department_insightsUpdateData,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update an existing department_insights (requires ownership)"""
    logger.debug(f"Updating department_insights {id} with data: {data}")

    service = Department_insightsService(db)
    try:
        # Get old data before update
        old_entity = await service.get_by_id(id, user_id=str(current_user.id))
        if not old_entity:
            logger.warning(f"Department_insights with id {id} not found for update")
            raise HTTPException(status_code=404, detail="Department_insights not found")
        
        old_data = {k: v for k, v in old_entity.__dict__.items() if not k.startswith('_')}
        
        # Only include non-None values for partial updates
        update_dict = {k: v for k, v in data.model_dump().items() if v is not None}
        result = await service.update(id, update_dict, user_id=str(current_user.id))
        
        # Audit logging
        try:
            await AuditService.log_crud_operation(
                db=db,
                actor_user_id=str(current_user.id),
                action="update",
                entity_type="department_insights",
                entity_id=str(id),
                old_data=old_data,
                new_data=update_dict,
                department_id=str(result.department_id),
                role=current_user.role,
            )
        except Exception as audit_error:
            logger.error(f"Audit logging failed: {audit_error}")
        
        logger.info(f"Department_insights {id} updated successfully")
        return result
    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"Validation error updating department_insights {id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error updating department_insights {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.delete("/batch")
async def delete_department_insightss_batch(
    request: Department_insightsBatchDeleteRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete multiple department_insightss by their IDs (requires ownership)"""
    logger.debug(f"Batch deleting {len(request.ids)} department_insightss")
    
    service = Department_insightsService(db)
    deleted_count = 0
    
    try:
        for item_id in request.ids:
            # Get old data before delete
            old_entity = await service.get_by_id(item_id, user_id=str(current_user.id))
            old_data = {k: v for k, v in old_entity.__dict__.items() if not k.startswith('_')} if old_entity else None
            
            success = await service.delete(item_id, user_id=str(current_user.id))
            if success:
                deleted_count += 1
                
                # Audit logging
                try:
                    await AuditService.log_crud_operation(
                        db=db,
                        actor_user_id=str(current_user.id),
                        action="delete",
                        entity_type="department_insights",
                        entity_id=str(item_id),
                        old_data=old_data,
                        department_id=str(old_entity.department_id) if old_entity else None,
                        role=current_user.role,
                    )
                except Exception as audit_error:
                    logger.error(f"Audit logging failed: {audit_error}")
        
        logger.info(f"Batch deleted {deleted_count} department_insightss successfully")
        return {"message": f"Successfully deleted {deleted_count} department_insightss", "deleted_count": deleted_count}
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch delete: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch delete failed: {str(e)}")


@router.delete("/{id}")
async def delete_department_insights(
    id: int,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a single department_insights by ID (requires ownership)"""
    logger.debug(f"Deleting department_insights with id: {id}")
    
    service = Department_insightsService(db)
    try:
        # Get old data before delete
        old_entity = await service.get_by_id(id, user_id=str(current_user.id))
        if not old_entity:
            logger.warning(f"Department_insights with id {id} not found for deletion")
            raise HTTPException(status_code=404, detail="Department_insights not found")
        
        old_data = {k: v for k, v in old_entity.__dict__.items() if not k.startswith('_')}
        
        success = await service.delete(id, user_id=str(current_user.id))
        
        # Audit logging
        try:
            await AuditService.log_crud_operation(
                db=db,
                actor_user_id=str(current_user.id),
                action="delete",
                entity_type="department_insights",
                entity_id=str(id),
                old_data=old_data,
                department_id=str(old_entity.department_id),
                role=current_user.role,
            )
        except Exception as audit_error:
            logger.error(f"Audit logging failed: {audit_error}")
        
        logger.info(f"Department_insights {id} deleted successfully")
        return {"message": "Department_insights deleted successfully", "id": id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting department_insights {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")