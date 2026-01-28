"""
Dashboard API Router
Provides aggregated data for different dashboard views
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, text
from datetime import datetime, timedelta
import logging

from core.database import get_db
from dependencies.auth import get_current_user
from models.user_profiles import UserProfile
from models.biometric_measurements import Biometric_measurements
from schemas.auth import UserResponse

router = APIRouter(prefix="/api/v1/dashboards", tags=["dashboards"])
logger = logging.getLogger(__name__)


@router.get("/employee")
async def get_employee_dashboard(
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Get dashboard data for an employee
    """
    try:
        logger.info(f"🔍 DASHBOARD DEBUG - Fetching employee dashboard for user_id: {current_user.id}")
        
        # Get user profile
        profile_query = select(UserProfile).where(UserProfile.user_id == str(current_user.id))
        profile_result = await db.execute(profile_query)
        profile = profile_result.scalar_one_or_none()
        
        if not profile:
            logger.error(f"❌ DASHBOARD ERROR - No profile found for user_id: {current_user.id}")
            raise HTTPException(
                status_code=404,
                detail=f"User profile not found for user_id: {current_user.id}"
            )
        
        logger.info(f"✅ DASHBOARD DEBUG - Found profile: {profile.full_name}")
        
        # Get biometric measurements for this user
        measurements_query = select(Biometric_measurements).where(
            Biometric_measurements.user_id == str(current_user.id)
        ).order_by(Biometric_measurements.created_at.desc())
        
        measurements_result = await db.execute(measurements_query)
        measurements = measurements_result.scalars().all()
        
        logger.info(f"🔍 DASHBOARD DEBUG - Found {len(measurements)} biometric measurements")
        
        if not measurements:
            logger.warning(f"⚠️ DASHBOARD WARNING - No biometric measurements for user_id: {current_user.id}")
            
            # Check if ANY measurements exist in the table
            count_query = select(Biometric_measurements)
            count_result = await db.execute(count_query)
            all_measurements = count_result.scalars().all()
            
            logger.warning(f"⚠️ DASHBOARD WARNING - Total measurements in DB: {len(all_measurements)}")
            if all_measurements:
                logger.warning(f"⚠️ DASHBOARD WARNING - Sample user_ids in measurements: {[m.user_id for m in all_measurements[:5]]}")
            
            return {
                "profile": {
                    "id": str(profile.id),
                    "user_id": profile.user_id,
                    "full_name": profile.full_name,
                    "email": profile.email,
                    "role": profile.role,
                    "organization_id": str(profile.organization_id) if profile.organization_id else None,
                    "department_id": str(profile.department_id) if profile.department_id else None,
                },
                "latest_scan": None,
                "scan_history": [],
                "health_metrics": {
                    "heart_rate": None,
                    "stress_level": None,
                    "recovery_score": None,
                },
                "message": "No biometric scans found. Please complete your first scan."
            }
        
        # Get latest measurement
        latest = measurements[0]
        
        logger.info(f"✅ DASHBOARD DEBUG - Latest scan: {latest.created_at}")
        
        return {
            "profile": {
                "id": str(profile.id),
                "user_id": profile.user_id,
                "full_name": profile.full_name,
                "email": profile.email,
                "role": profile.role,
                "organization_id": str(profile.organization_id) if profile.organization_id else None,
                "department_id": str(profile.department_id) if profile.department_id else None,
            },
            "latest_scan": {
                "id": str(latest.id),
                "created_at": latest.created_at.isoformat() if latest.created_at else None,
                "heart_rate": latest.heart_rate,
                "stress_level": latest.ai_stress,
                "recovery_score": latest.ai_recovery,
                "bmi": latest.bmi,
            },
            "scan_history": [
                {
                    "id": str(m.id),
                    "created_at": m.created_at.isoformat() if m.created_at else None,
                    "heart_rate": m.heart_rate,
                    "stress_level": m.ai_stress,
                    "recovery_score": m.ai_recovery,
                }
                for m in measurements[:10]  # Last 10 scans
            ],
            "health_metrics": {
                "heart_rate": latest.heart_rate,
                "stress_level": latest.ai_stress,
                "recovery_score": latest.ai_recovery,
                "bmi": latest.bmi,
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ DASHBOARD ERROR - Unexpected error: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch employee dashboard: {str(e)}"
        )


@router.get("/leader")
async def get_leader_dashboard(
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Get dashboard data for a team leader
    """
    try:
        # Get user profile
        profile_query = select(UserProfile).where(UserProfile.user_id == str(current_user.id))
        profile_result = await db.execute(profile_query)
        profile = profile_result.scalar_one_or_none()
        
        if not profile:
            raise HTTPException(
                status_code=404,
                detail="User profile not found"
            )
        
        # Get team members (same department)
        if not profile.department_id:
            return {
                "profile": {
                    "id": str(profile.id),
                    "full_name": profile.full_name,
                    "role": profile.role,
                },
                "team_metrics": {
                    "total_members": 0,
                    "scans_this_week": 0,
                    "average_stress": None,
                    "high_risk_count": 0,
                },
                "team_members": [],
                "message": "No department assigned"
            }
        
        team_query = select(UserProfile).where(
            UserProfile.department_id == profile.department_id
        )
        team_result = await db.execute(team_query)
        team_members = team_result.scalars().all()
        
        return {
            "profile": {
                "id": str(profile.id),
                "full_name": profile.full_name,
                "role": profile.role,
                "department_id": str(profile.department_id),
            },
            "team_metrics": {
                "total_members": len(team_members),
                "scans_this_week": 0,  # TODO: Calculate from biometric_measurements
                "average_stress": None,
                "high_risk_count": 0,
            },
            "team_members": [
                {
                    "id": str(member.id),
                    "full_name": member.full_name,
                    "email": member.email,
                    "role": member.role,
                }
                for member in team_members
            ]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching leader dashboard: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch leader dashboard: {str(e)}"
        )


@router.get("/hr")
async def get_hr_dashboard(
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Get dashboard data for HR
    """
    try:
        # Get user profile
        profile_query = select(UserProfile).where(UserProfile.user_id == str(current_user.id))
        profile_result = await db.execute(profile_query)
        profile = profile_result.scalar_one_or_none()
        
        if not profile:
            raise HTTPException(
                status_code=404,
                detail="User profile not found"
            )
        
        # Get all employees in organization
        if not profile.organization_id:
            return {
                "profile": {
                    "id": str(profile.id),
                    "full_name": profile.full_name,
                    "role": profile.role,
                },
                "organization_metrics": {
                    "total_employees": 0,
                    "scans_this_month": 0,
                    "average_wellness": None,
                    "departments_count": 0,
                },
                "employees": [],
                "message": "No organization assigned"
            }
        
        employees_query = select(UserProfile).where(
            UserProfile.organization_id == profile.organization_id
        )
        employees_result = await db.execute(employees_query)
        employees = employees_result.scalars().all()
        
        return {
            "profile": {
                "id": str(profile.id),
                "full_name": profile.full_name,
                "role": profile.role,
                "organization_id": str(profile.organization_id),
            },
            "organization_metrics": {
                "total_employees": len(employees),
                "scans_this_month": 0,  # TODO: Calculate from biometric_measurements
                "average_wellness": None,
                "departments_count": len(set(e.department_id for e in employees if e.department_id)),
            },
            "employees": [
                {
                    "id": str(emp.id),
                    "full_name": emp.full_name,
                    "email": emp.email,
                    "role": emp.role,
                    "department_id": str(emp.department_id) if emp.department_id else None,
                }
                for emp in employees
            ]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching HR dashboard: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch HR dashboard: {str(e)}"
        )