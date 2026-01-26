"""
Dashboard Router - HoloCheck Equilibria
Provides aggregated dashboard endpoints for different user roles.
"""

import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from dependencies.auth import get_current_user
from schemas.auth import UserResponse as User
from services.dashboard_service import DashboardService
from services.audit_service import AuditService

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/v1/dashboards",
    tags=["dashboards"]
)


@router.get("/employee")
async def get_employee_dashboard(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get employee dashboard with personal biometric data and trends.
    """
    try:
        logger.info(f"Employee dashboard requested by user {current_user.id}")
        
        # Create service instance
        service = DashboardService(db)
        dashboard_data = await service.get_employee_dashboard(str(current_user.id))
        
        # Audit log
        try:
            await AuditService.log_crud_operation(
                db=db,
                user_id=str(current_user.id),
                action="view",
                table_name="dashboards",
                record_id="employee",
                new_data={"dashboard_type": "employee", "user_id": str(current_user.id)}
            )
        except Exception as audit_error:
            logger.error(f"Audit logging failed: {audit_error}")
        
        return dashboard_data
        
    except Exception as e:
        logger.error(f"Error getting employee dashboard: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error loading dashboard: {str(e)}"
        )


@router.get("/leader")
async def get_leader_dashboard(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get leader dashboard with team metrics and department insights.
    """
    try:
        logger.info(f"Leader dashboard requested by user {current_user.id}")
        
        # Create service instance
        service = DashboardService(db)
        dashboard_data = await service.get_leader_dashboard(str(current_user.id))
        
        # Audit log
        try:
            await AuditService.log_crud_operation(
                db=db,
                user_id=str(current_user.id),
                action="view",
                table_name="dashboards",
                record_id="leader",
                new_data={"dashboard_type": "leader", "user_id": str(current_user.id)}
            )
        except Exception as audit_error:
            logger.error(f"Audit logging failed: {audit_error}")
        
        return dashboard_data
        
    except Exception as e:
        logger.error(f"Error getting leader dashboard: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error loading dashboard: {str(e)}"
        )


@router.get("/hr")
async def get_hr_dashboard(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get HR dashboard with organization-wide metrics and insights.
    """
    try:
        logger.info(f"HR dashboard requested by user {current_user.id}")
        
        # Create service instance
        service = DashboardService(db)
        dashboard_data = await service.get_hr_dashboard(str(current_user.id))
        
        # Audit log
        try:
            await AuditService.log_crud_operation(
                db=db,
                user_id=str(current_user.id),
                action="view",
                table_name="dashboards",
                record_id="hr",
                new_data={"dashboard_type": "hr", "user_id": str(current_user.id)}
            )
        except Exception as audit_error:
            logger.error(f"Audit logging failed: {audit_error}")
        
        return dashboard_data
        
    except Exception as e:
        logger.error(f"Error getting hr dashboard: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error loading dashboard: {str(e)}"
        )


@router.get("/admin")
async def get_admin_dashboard(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get admin dashboard with operational metrics and consumption control.
    """
    try:
        logger.info(f"Admin dashboard requested by user {current_user.id}")
        
        # Create service instance
        service = DashboardService(db)
        dashboard_data = await service.get_admin_dashboard(str(current_user.id))
        
        # Audit log
        try:
            await AuditService.log_crud_operation(
                db=db,
                user_id=str(current_user.id),
                action="view",
                table_name="dashboards",
                record_id="admin",
                new_data={"dashboard_type": "admin", "user_id": str(current_user.id)}
            )
        except Exception as audit_error:
            logger.error(f"Audit logging failed: {audit_error}")
        
        return dashboard_data
        
    except Exception as e:
        logger.error(f"Error getting admin dashboard: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error loading dashboard: {str(e)}"
        )