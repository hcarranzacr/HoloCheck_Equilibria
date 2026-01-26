import json
import logging
from typing import List, Optional

from datetime import datetime, date

from fastapi import APIRouter, Body, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from services.departments import DepartmentsService
from services.audit_service import AuditService
from dependencies.auth import get_current_user
from schemas.auth import UserResponse

# Set up logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/entities/departments", tags=["departments"])


# ---------- Pydantic Schemas ----------
class DepartmentsData(BaseModel):
    """Entity data schema (for create/update)"""
    organization_id: str
    name: str
    created_at: Optional[datetime] = None


class DepartmentsUpdateData(BaseModel):
    """Update entity data (partial updates allowed)"""
    organization_id: Optional[str] = None
    name: Optional[str] = None
    created_at: Optional[datetime] = None


class DepartmentsResponse(BaseModel):
    """Entity response schema"""
    id: str
    organization_id: str
    name: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class DepartmentsListResponse(BaseModel):
    """List response schema"""
    items: List[DepartmentsResponse]
    total: int
    skip: int
    limit: int


class DepartmentsBatchCreateRequest(BaseModel):
    """Batch create request"""
    items: List[DepartmentsData]


class DepartmentsBatchUpdateItem(BaseModel):
    """Batch update item"""
    id: int
    updates: DepartmentsUpdateData


class DepartmentsBatchUpdateRequest(BaseModel):
    """Batch update request"""
    items: List[DepartmentsBatchUpdateItem]


class DepartmentsBatchDeleteRequest(BaseModel):
    """Batch delete request"""
    ids: List[int]


# ---------- Routes ----------
@router.get("", response_model=DepartmentsListResponse)
async def query_departmentss(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    """Query departmentss with filtering, sorting, and pagination"""
    logger.debug(f"Querying departmentss: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")
    
    service = DepartmentsService(db)
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
        logger.debug(f"Found {result['total']} departmentss")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error querying departmentss: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/all", response_model=DepartmentsListResponse)
async def query_departmentss_all(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    # Query departmentss with filtering, sorting, and pagination without user limitation
    logger.debug(f"Querying departmentss: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")

    service = DepartmentsService(db)
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
        logger.debug(f"Found {result['total']} departmentss")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error querying departmentss: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/{id}", response_model=DepartmentsResponse)
async def get_departments(
    id: int,
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    """Get a single departments by ID"""
    logger.debug(f"Fetching departments with id: {id}, fields={fields}")
    
    service = DepartmentsService(db)
    try:
        result = await service.get_by_id(id)
        if not result:
            logger.warning(f"Departments with id {id} not found")
            raise HTTPException(status_code=404, detail="Departments not found")
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching departments {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("", response_model=DepartmentsResponse, status_code=201)
async def create_departments(
    data: DepartmentsData,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new departments"""
    logger.debug(f"Creating new departments with data: {data}")
    
    service = DepartmentsService(db)
    try:
        result = await service.create(data.model_dump())
        if not result:
            raise HTTPException(status_code=400, detail="Failed to create departments")
        
        # Audit logging
        try:
            await AuditService.log_crud_operation(
                db=db,
                actor_user_id=str(current_user.id),
                action="create",
                entity_type="departments",
                entity_id=str(result.id),
                new_data=data.model_dump(),
                organization_id=str(result.organization_id),
                department_id=str(result.id),
                role=current_user.role,
            )
        except Exception as audit_error:
            logger.error(f"Audit logging failed: {audit_error}")
        
        logger.info(f"Departments created successfully with id: {result.id}")
        return result
    except ValueError as e:
        logger.error(f"Validation error creating departments: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating departments: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/batch", response_model=List[DepartmentsResponse], status_code=201)
async def create_departmentss_batch(
    request: DepartmentsBatchCreateRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create multiple departmentss in a single request"""
    logger.debug(f"Batch creating {len(request.items)} departmentss")
    
    service = DepartmentsService(db)
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
                        entity_type="departments",
                        entity_id=str(result.id),
                        new_data=item_data.model_dump(),
                        organization_id=str(result.organization_id),
                        department_id=str(result.id),
                        role=current_user.role,
                    )
                except Exception as audit_error:
                    logger.error(f"Audit logging failed: {audit_error}")
        
        logger.info(f"Batch created {len(results)} departmentss successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch create: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch create failed: {str(e)}")


@router.put("/batch", response_model=List[DepartmentsResponse])
async def update_departmentss_batch(
    request: DepartmentsBatchUpdateRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update multiple departmentss in a single request"""
    logger.debug(f"Batch updating {len(request.items)} departmentss")
    
    service = DepartmentsService(db)
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
                        entity_type="departments",
                        entity_id=str(item.id),
                        old_data=old_data,
                        new_data=update_dict,
                        organization_id=str(result.organization_id),
                        department_id=str(result.id),
                        role=current_user.role,
                    )
                except Exception as audit_error:
                    logger.error(f"Audit logging failed: {audit_error}")
        
        logger.info(f"Batch updated {len(results)} departmentss successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch update: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch update failed: {str(e)}")


@router.put("/{id}", response_model=DepartmentsResponse)
async def update_departments(
    id: int,
    data: DepartmentsUpdateData,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update an existing departments"""
    logger.debug(f"Updating departments {id} with data: {data}")

    service = DepartmentsService(db)
    try:
        # Get old data before update
        old_entity = await service.get_by_id(id)
        if not old_entity:
            logger.warning(f"Departments with id {id} not found for update")
            raise HTTPException(status_code=404, detail="Departments not found")
        
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
                entity_type="departments",
                entity_id=str(id),
                old_data=old_data,
                new_data=update_dict,
                organization_id=str(result.organization_id),
                department_id=str(result.id),
                role=current_user.role,
            )
        except Exception as audit_error:
            logger.error(f"Audit logging failed: {audit_error}")
        
        logger.info(f"Departments {id} updated successfully")
        return result
    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"Validation error updating departments {id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error updating departments {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.delete("/batch")
async def delete_departmentss_batch(
    request: DepartmentsBatchDeleteRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete multiple departmentss by their IDs"""
    logger.debug(f"Batch deleting {len(request.ids)} departmentss")
    
    service = DepartmentsService(db)
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
                        entity_type="departments",
                        entity_id=str(item_id),
                        old_data=old_data,
                        organization_id=str(old_entity.organization_id) if old_entity else None,
                        department_id=str(old_entity.id) if old_entity else None,
                        role=current_user.role,
                    )
                except Exception as audit_error:
                    logger.error(f"Audit logging failed: {audit_error}")
        
        logger.info(f"Batch deleted {deleted_count} departmentss successfully")
        return {"message": f"Successfully deleted {deleted_count} departmentss", "deleted_count": deleted_count}
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch delete: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch delete failed: {str(e)}")


@router.delete("/{id}")
async def delete_departments(
    id: int,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a single departments by ID"""
    logger.debug(f"Deleting departments with id: {id}")
    
    service = DepartmentsService(db)
    try:
        # Get old data before delete
        old_entity = await service.get_by_id(id)
        if not old_entity:
            logger.warning(f"Departments with id {id} not found for deletion")
            raise HTTPException(status_code=404, detail="Departments not found")
        
        old_data = {k: v for k, v in old_entity.__dict__.items() if not k.startswith('_')}
        
        success = await service.delete(id)
        
        # Audit logging
        try:
            await AuditService.log_crud_operation(
                db=db,
                actor_user_id=str(current_user.id),
                action="delete",
                entity_type="departments",
                entity_id=str(id),
                old_data=old_data,
                organization_id=str(old_entity.organization_id),
                department_id=str(old_entity.id),
                role=current_user.role,
            )
        except Exception as audit_error:
            logger.error(f"Audit logging failed: {audit_error}")
        
        logger.info(f"Departments {id} deleted successfully")
        return {"message": "Departments deleted successfully", "id": id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting departments {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")