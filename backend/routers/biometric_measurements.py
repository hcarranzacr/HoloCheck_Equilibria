import json
import logging
from typing import List, Optional

from datetime import datetime, date

from fastapi import APIRouter, Body, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from services.biometric_measurements import Biometric_measurementsService
from services.audit_service import AuditService
from dependencies.auth import get_current_user
from schemas.auth import UserResponse

# Set up logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/entities/biometric_measurements", tags=["biometric_measurements"])


# ---------- Pydantic Schemas ----------
class Biometric_measurementsData(BaseModel):
    """Entity data schema (for create/update)"""
    measurement_id: str
    heart_rate: float = None
    respiration_rate: float = None
    bp_systolic: float = None
    bp_diastolic: float = None
    sdnn: float = None
    rmssd: float = None
    ai_stress: float = None
    ai_fatigue: float = None
    ai_cognitive_load: float = None
    ai_recovery: float = None
    mental_score: float = None
    bio_age_basic: float = None
    cvd_risk: float = None
    health_score: float = None
    vital_score: float = None
    physio_score: float = None
    risks_score: float = None
    quality_score: float = None
    raw_data: Optional[dict] = None
    created_at: Optional[datetime] = None


class Biometric_measurementsUpdateData(BaseModel):
    """Update entity data (partial updates allowed)"""
    measurement_id: Optional[str] = None
    heart_rate: Optional[float] = None
    respiration_rate: Optional[float] = None
    bp_systolic: Optional[float] = None
    bp_diastolic: Optional[float] = None
    sdnn: Optional[float] = None
    rmssd: Optional[float] = None
    ai_stress: Optional[float] = None
    ai_fatigue: Optional[float] = None
    ai_cognitive_load: Optional[float] = None
    ai_recovery: Optional[float] = None
    mental_score: Optional[float] = None
    bio_age_basic: Optional[float] = None
    cvd_risk: Optional[float] = None
    health_score: Optional[float] = None
    vital_score: Optional[float] = None
    physio_score: Optional[float] = None
    risks_score: Optional[float] = None
    quality_score: Optional[float] = None
    raw_data: Optional[dict] = None
    created_at: Optional[datetime] = None


class Biometric_measurementsResponse(BaseModel):
    """Entity response schema"""
    id: str
    user_id: str
    measurement_id: str
    heart_rate: Optional[float] = None
    respiration_rate: Optional[float] = None
    bp_systolic: Optional[float] = None
    bp_diastolic: Optional[float] = None
    sdnn: Optional[float] = None
    rmssd: Optional[float] = None
    ai_stress: Optional[float] = None
    ai_fatigue: Optional[float] = None
    ai_cognitive_load: Optional[float] = None
    ai_recovery: Optional[float] = None
    mental_score: Optional[float] = None
    bio_age_basic: Optional[float] = None
    cvd_risk: Optional[float] = None
    health_score: Optional[float] = None
    vital_score: Optional[float] = None
    physio_score: Optional[float] = None
    risks_score: Optional[float] = None
    quality_score: Optional[float] = None
    raw_data: Optional[dict] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class Biometric_measurementsListResponse(BaseModel):
    """List response schema"""
    items: List[Biometric_measurementsResponse]
    total: int
    skip: int
    limit: int


class Biometric_measurementsBatchCreateRequest(BaseModel):
    """Batch create request"""
    items: List[Biometric_measurementsData]


class Biometric_measurementsBatchUpdateItem(BaseModel):
    """Batch update item"""
    id: int
    updates: Biometric_measurementsUpdateData


class Biometric_measurementsBatchUpdateRequest(BaseModel):
    """Batch update request"""
    items: List[Biometric_measurementsBatchUpdateItem]


class Biometric_measurementsBatchDeleteRequest(BaseModel):
    """Batch delete request"""
    ids: List[int]


# ---------- NEW: Custom API endpoints for frontend ----------
@router.get("/latest/{user_id}", response_model=Optional[Biometric_measurementsResponse])
async def get_latest_measurement(
    user_id: str,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get the latest biometric measurement for a user"""
    logger.debug(f"Fetching latest measurement for user_id: {user_id}")
    
    service = Biometric_measurementsService(db)
    try:
        result = await service.get_latest_by_user(user_id)
        if not result:
            logger.info(f"No measurements found for user {user_id}")
            return None
        
        return result
    except Exception as e:
        logger.error(f"Error fetching latest measurement for user {user_id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/history/{user_id}", response_model=List[Biometric_measurementsResponse])
async def get_measurement_history(
    user_id: str,
    limit: int = Query(30, ge=1, le=100),
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get measurement history for a user (last N measurements)"""
    logger.debug(f"Fetching measurement history for user_id: {user_id}, limit: {limit}")
    
    service = Biometric_measurementsService(db)
    try:
        results = await service.get_history_by_user(user_id, limit=limit)
        logger.info(f"Found {len(results)} measurements for user {user_id}")
        return results
    except Exception as e:
        logger.error(f"Error fetching measurement history for user {user_id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


# ---------- Routes ----------
@router.get("", response_model=Biometric_measurementsListResponse)
async def query_biometric_measurementss(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Query biometric_measurementss with filtering, sorting, and pagination (user can only see their own records)"""
    logger.debug(f"Querying biometric_measurementss: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")
    
    service = Biometric_measurementsService(db)
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
        logger.debug(f"Found {result['total']} biometric_measurementss")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error querying biometric_measurementss: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/all", response_model=Biometric_measurementsListResponse)
async def query_biometric_measurementss_all(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    # Query biometric_measurementss with filtering, sorting, and pagination without user limitation
    logger.debug(f"Querying biometric_measurementss: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")

    service = Biometric_measurementsService(db)
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
        logger.debug(f"Found {result['total']} biometric_measurementss")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error querying biometric_measurementss: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/{id}", response_model=Biometric_measurementsResponse)
async def get_biometric_measurements(
    id: int,
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a single biometric_measurements by ID (user can only see their own records)"""
    logger.debug(f"Fetching biometric_measurements with id: {id}, fields={fields}")
    
    service = Biometric_measurementsService(db)
    try:
        result = await service.get_by_id(id, user_id=str(current_user.id))
        if not result:
            logger.warning(f"Biometric_measurements with id {id} not found")
            raise HTTPException(status_code=404, detail="Biometric_measurements not found")
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching biometric_measurements {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("", response_model=Biometric_measurementsResponse, status_code=201)
async def create_biometric_measurements(
    data: Biometric_measurementsData,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new biometric_measurements"""
    logger.debug(f"Creating new biometric_measurements with data: {data}")
    
    service = Biometric_measurementsService(db)
    try:
        result = await service.create(data.model_dump(), user_id=str(current_user.id))
        if not result:
            raise HTTPException(status_code=400, detail="Failed to create biometric_measurements")
        
        # Audit logging
        try:
            await AuditService.log_crud_operation(
                db=db,
                actor_user_id=str(current_user.id),
                action="create",
                entity_type="biometric_measurements",
                entity_id=str(result.id),
                new_data=data.model_dump(),
                role=current_user.role,
            )
        except Exception as audit_error:
            logger.error(f"Audit logging failed: {audit_error}")
        
        logger.info(f"Biometric_measurements created successfully with id: {result.id}")
        return result
    except ValueError as e:
        logger.error(f"Validation error creating biometric_measurements: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating biometric_measurements: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/batch", response_model=List[Biometric_measurementsResponse], status_code=201)
async def create_biometric_measurementss_batch(
    request: Biometric_measurementsBatchCreateRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create multiple biometric_measurementss in a single request"""
    logger.debug(f"Batch creating {len(request.items)} biometric_measurementss")
    
    service = Biometric_measurementsService(db)
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
                        entity_type="biometric_measurements",
                        entity_id=str(result.id),
                        new_data=item_data.model_dump(),
                        role=current_user.role,
                    )
                except Exception as audit_error:
                    logger.error(f"Audit logging failed: {audit_error}")
        
        logger.info(f"Batch created {len(results)} biometric_measurementss successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch create: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch create failed: {str(e)}")


@router.put("/batch", response_model=List[Biometric_measurementsResponse])
async def update_biometric_measurementss_batch(
    request: Biometric_measurementsBatchUpdateRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update multiple biometric_measurementss in a single request (requires ownership)"""
    logger.debug(f"Batch updating {len(request.items)} biometric_measurementss")
    
    service = Biometric_measurementsService(db)
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
                        entity_type="biometric_measurements",
                        entity_id=str(item.id),
                        old_data=old_data,
                        new_data=update_dict,
                        role=current_user.role,
                    )
                except Exception as audit_error:
                    logger.error(f"Audit logging failed: {audit_error}")
        
        logger.info(f"Batch updated {len(results)} biometric_measurementss successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch update: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch update failed: {str(e)}")


@router.put("/{id}", response_model=Biometric_measurementsResponse)
async def update_biometric_measurements(
    id: int,
    data: Biometric_measurementsUpdateData,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update an existing biometric_measurements (requires ownership)"""
    logger.debug(f"Updating biometric_measurements {id} with data: {data}")

    service = Biometric_measurementsService(db)
    try:
        # Get old data before update
        old_entity = await service.get_by_id(id, user_id=str(current_user.id))
        if not old_entity:
            logger.warning(f"Biometric_measurements with id {id} not found for update")
            raise HTTPException(status_code=404, detail="Biometric_measurements not found")
        
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
                entity_type="biometric_measurements",
                entity_id=str(id),
                old_data=old_data,
                new_data=update_dict,
                role=current_user.role,
            )
        except Exception as audit_error:
            logger.error(f"Audit logging failed: {audit_error}")
        
        logger.info(f"Biometric_measurements {id} updated successfully")
        return result
    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"Validation error updating biometric_measurements {id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error updating biometric_measurements {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.delete("/batch")
async def delete_biometric_measurementss_batch(
    request: Biometric_measurementsBatchDeleteRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete multiple biometric_measurementss by their IDs (requires ownership)"""
    logger.debug(f"Batch deleting {len(request.ids)} biometric_measurementss")
    
    service = Biometric_measurementsService(db)
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
                        entity_type="biometric_measurements",
                        entity_id=str(item_id),
                        old_data=old_data,
                        role=current_user.role,
                    )
                except Exception as audit_error:
                    logger.error(f"Audit logging failed: {audit_error}")
        
        logger.info(f"Batch deleted {deleted_count} biometric_measurementss successfully")
        return {"message": f"Successfully deleted {deleted_count} biometric_measurementss", "deleted_count": deleted_count}
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch delete: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch delete failed: {str(e)}")


@router.delete("/{id}")
async def delete_biometric_measurements(
    id: int,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a single biometric_measurements by ID (requires ownership)"""
    logger.debug(f"Deleting biometric_measurements with id: {id}")
    
    service = Biometric_measurementsService(db)
    try:
        # Get old data before delete
        old_entity = await service.get_by_id(id, user_id=str(current_user.id))
        if not old_entity:
            logger.warning(f"Biometric_measurements with id {id} not found for deletion")
            raise HTTPException(status_code=404, detail="Biometric_measurements not found")
        
        old_data = {k: v for k, v in old_entity.__dict__.items() if not k.startswith('_')}
        
        success = await service.delete(id, user_id=str(current_user.id))
        
        # Audit logging
        try:
            await AuditService.log_crud_operation(
                db=db,
                actor_user_id=str(current_user.id),
                action="delete",
                entity_type="biometric_measurements",
                entity_id=str(id),
                old_data=old_data,
                role=current_user.role,
            )
        except Exception as audit_error:
            logger.error(f"Audit logging failed: {audit_error}")
        
        logger.info(f"Biometric_measurements {id} deleted successfully")
        return {"message": "Biometric_measurements deleted successfully", "id": id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting biometric_measurements {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")