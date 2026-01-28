"""
Dashboard API Router
Provides endpoints for different dashboard views (Leader, HR, Admin)
"""
import logging
from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from dependencies.auth import get_current_user
from schemas.auth import UserResponse
from core.supabase_client import get_supabase_client

router = APIRouter(prefix="/api/v1/dashboards", tags=["dashboards"])
logger = logging.getLogger(__name__)


async def get_user_profile_data(user_id: str) -> Dict[str, Any]:
    """Get user profile data including organization and department info"""
    try:
        supabase = get_supabase_client()
        
        # Get user profile
        profile_result = supabase.table('user_profiles').select('*').eq('user_id', user_id).execute()
        
        if not profile_result.data:
            logger.warning(f"No profile found for user_id: {user_id}")
            raise HTTPException(status_code=404, detail="User profile not found")
        
        profile = profile_result.data[0]
        
        # Get organization data
        org_id = profile.get('organization_id')
        org_data = None
        if org_id:
            org_result = supabase.table('organizations').select('*').eq('id', org_id).execute()
            if org_result.data:
                org_data = org_result.data[0]
        
        # Get department data
        dept_id = profile.get('department_id')
        dept_data = None
        if dept_id:
            dept_result = supabase.table('departments').select('*').eq('id', dept_id).execute()
            if dept_result.data:
                dept_data = dept_result.data[0]
        
        return {
            'profile': profile,
            'organization': org_data,
            'department': dept_data
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting user profile data: {e}")
        raise HTTPException(status_code=500, detail=f"Error loading profile: {str(e)}")


@router.get("/leader")
async def get_leader_dashboard(
    current_user: UserResponse = Depends(get_current_user),
    time_period: Optional[str] = Query("month", regex="^(week|month|quarter|year)$")
):
    """
    Get leader dashboard data showing team metrics
    """
    try:
        logger.info(f"Loading leader dashboard for user: {current_user.id}")
        
        # Get user profile data
        user_data = await get_user_profile_data(current_user.id)
        profile = user_data['profile']
        organization_id = profile.get('organization_id')
        department_id = profile.get('department_id')
        
        if not organization_id or not department_id:
            raise HTTPException(
                status_code=400, 
                detail="User profile missing organization or department information"
            )
        
        supabase = get_supabase_client()
        
        # Get team members in the same department
        team_result = supabase.table('user_profiles').select('user_id, full_name, email, role').eq(
            'organization_id', organization_id
        ).eq('department_id', department_id).execute()
        
        team_members = team_result.data or []
        team_user_ids = [member['user_id'] for member in team_members]
        
        # Get latest biometric measurements for team
        measurements = []
        if team_user_ids:
            # Get the most recent measurement for each team member
            for user_id in team_user_ids:
                measurement_result = supabase.table('biometric_measurements').select('*').eq(
                    'user_id', user_id
                ).order('created_at', desc=True).limit(1).execute()
                
                if measurement_result.data:
                    measurements.extend(measurement_result.data)
        
        # Calculate team statistics
        total_members = len(team_members)
        members_with_data = len(measurements)
        
        avg_stress = 0
        avg_wellness = 0
        if measurements:
            avg_stress = sum(m.get('ai_stress', 0) or 0 for m in measurements) / len(measurements)
            avg_wellness = sum(m.get('wellness_index_score', 0) or 0 for m in measurements) / len(measurements)
        
        return {
            "user_profile": profile,
            "organization": user_data['organization'],
            "department": user_data['department'],
            "team_summary": {
                "total_members": total_members,
                "members_with_data": members_with_data,
                "avg_stress_level": round(avg_stress, 1),
                "avg_wellness_score": round(avg_wellness, 1)
            },
            "team_members": team_members,
            "team_measurements": measurements,
            "time_period": time_period
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error loading leader dashboard: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error loading leader dashboard: {str(e)}")


@router.get("/hr")
async def get_hr_dashboard(
    current_user: UserResponse = Depends(get_current_user),
    time_period: Optional[str] = Query("month", regex="^(week|month|quarter|year)$")
):
    """
    Get HR dashboard data showing organization-wide metrics
    """
    try:
        logger.info(f"Loading HR dashboard for user: {current_user.id}")
        
        # Get user profile data
        user_data = await get_user_profile_data(current_user.id)
        profile = user_data['profile']
        organization_id = profile.get('organization_id')
        
        if not organization_id:
            raise HTTPException(
                status_code=400, 
                detail="User profile missing organization information"
            )
        
        supabase = get_supabase_client()
        
        # Get all employees in the organization
        employees_result = supabase.table('user_profiles').select('user_id, full_name, email, role, department_id').eq(
            'organization_id', organization_id
        ).execute()
        
        employees = employees_result.data or []
        employee_user_ids = [emp['user_id'] for emp in employees]
        
        # Get departments
        departments_result = supabase.table('departments').select('*').eq(
            'organization_id', organization_id
        ).execute()
        departments = departments_result.data or []
        
        # Get latest measurements for all employees
        measurements = []
        if employee_user_ids:
            for user_id in employee_user_ids:
                measurement_result = supabase.table('biometric_measurements').select('*').eq(
                    'user_id', user_id
                ).order('created_at', desc=True).limit(1).execute()
                
                if measurement_result.data:
                    measurements.extend(measurement_result.data)
        
        # Calculate organization statistics
        total_employees = len(employees)
        employees_with_data = len(measurements)
        
        avg_stress = 0
        avg_wellness = 0
        high_risk_count = 0
        
        if measurements:
            avg_stress = sum(m.get('ai_stress', 0) or 0 for m in measurements) / len(measurements)
            avg_wellness = sum(m.get('wellness_index_score', 0) or 0 for m in measurements) / len(measurements)
            high_risk_count = sum(1 for m in measurements if (m.get('ai_stress', 0) or 0) > 70)
        
        return {
            "user_profile": profile,
            "organization": user_data['organization'],
            "organization_summary": {
                "total_employees": total_employees,
                "employees_with_data": employees_with_data,
                "avg_stress_level": round(avg_stress, 1),
                "avg_wellness_score": round(avg_wellness, 1),
                "high_risk_employees": high_risk_count,
                "total_departments": len(departments)
            },
            "departments": departments,
            "employees": employees,
            "measurements": measurements,
            "time_period": time_period
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error loading HR dashboard: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error loading HR dashboard: {str(e)}")


@router.get("/admin")
async def get_admin_dashboard(
    current_user: UserResponse = Depends(get_current_user),
    time_period: Optional[str] = Query("month", regex="^(week|month|quarter|year)$")
):
    """
    Get admin dashboard data showing platform-wide metrics
    """
    try:
        logger.info(f"Loading admin dashboard for user: {current_user.id}")
        
        # Get user profile data
        user_data = await get_user_profile_data(current_user.id)
        profile = user_data['profile']
        organization_id = profile.get('organization_id')
        
        if not organization_id:
            raise HTTPException(
                status_code=400, 
                detail="User profile missing organization information"
            )
        
        supabase = get_supabase_client()
        
        # Get organization data
        org_result = supabase.table('organizations').select('*').eq('id', organization_id).execute()
        organization = org_result.data[0] if org_result.data else None
        
        # Get all users in organization
        users_result = supabase.table('user_profiles').select('*').eq('organization_id', organization_id).execute()
        users = users_result.data or []
        
        # Get departments
        departments_result = supabase.table('departments').select('*').eq('organization_id', organization_id).execute()
        departments = departments_result.data or []
        
        # Calculate statistics
        total_users = len(users)
        active_users = sum(1 for u in users if u.get('status') == 'active')
        
        return {
            "user_profile": profile,
            "organization": organization,
            "platform_summary": {
                "total_users": total_users,
                "active_users": active_users,
                "total_departments": len(departments),
                "organization_name": organization.get('name') if organization else 'N/A'
            },
            "users": users,
            "departments": departments,
            "time_period": time_period
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error loading admin dashboard: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error loading admin dashboard: {str(e)}")