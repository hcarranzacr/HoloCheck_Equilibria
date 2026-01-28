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
        logger.info(f"📋 [get_user_profile_data] Fetching profile for user_id: {user_id}")
        supabase = get_supabase_client()
        
        # Get user profile
        profile_result = supabase.table('user_profiles').select('*').eq('user_id', user_id).execute()
        
        if not profile_result.data:
            logger.error(f"❌ [get_user_profile_data] No profile found for user_id: {user_id}")
            raise HTTPException(status_code=404, detail="User profile not found")
        
        profile = profile_result.data[0]
        logger.info(f"✅ [get_user_profile_data] Profile found: email={profile.get('email')}, org_id={profile.get('organization_id')}, dept_id={profile.get('department_id')}")
        
        # Get organization data
        org_id = profile.get('organization_id')
        org_data = None
        if org_id:
            logger.info(f"🏢 [get_user_profile_data] Fetching organization: {org_id}")
            org_result = supabase.table('organizations').select('*').eq('id', org_id).execute()
            if org_result.data:
                org_data = org_result.data[0]
                logger.info(f"✅ [get_user_profile_data] Organization found: {org_data.get('name')}")
            else:
                logger.warning(f"⚠️ [get_user_profile_data] Organization not found: {org_id}")
        
        # Get department data
        dept_id = profile.get('department_id')
        dept_data = None
        if dept_id:
            logger.info(f"🏛️ [get_user_profile_data] Fetching department: {dept_id}")
            dept_result = supabase.table('departments').select('*').eq('id', dept_id).execute()
            if dept_result.data:
                dept_data = dept_result.data[0]
                logger.info(f"✅ [get_user_profile_data] Department found: {dept_data.get('name')}")
            else:
                logger.warning(f"⚠️ [get_user_profile_data] Department not found: {dept_id}")
        
        return {
            'profile': profile,
            'organization': org_data,
            'department': dept_data
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ [get_user_profile_data] Error: {type(e).__name__}: {e}", exc_info=True)
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
        logger.info(f"🎯 [LEADER DASHBOARD] START - user_id: {current_user.id}, email: {current_user.email}")
        
        # Get user profile data
        logger.info(f"📋 [LEADER DASHBOARD] Step 1: Fetching user profile data")
        user_data = await get_user_profile_data(current_user.id)
        profile = user_data['profile']
        organization_id = profile.get('organization_id')
        department_id = profile.get('department_id')
        
        logger.info(f"✅ [LEADER DASHBOARD] Profile loaded: org_id={organization_id}, dept_id={department_id}")
        
        if not organization_id or not department_id:
            error_msg = f"User profile missing organization_id={organization_id} or department_id={department_id}"
            logger.error(f"❌ [LEADER DASHBOARD] {error_msg}")
            raise HTTPException(status_code=400, detail="User profile missing organization or department information")
        
        supabase = get_supabase_client()
        
        # Get team members in the same department
        logger.info(f"👥 [LEADER DASHBOARD] Step 2: Fetching team members (org={organization_id}, dept={department_id})")
        team_result = supabase.table('user_profiles').select('user_id, full_name, email, role').eq(
            'organization_id', organization_id
        ).eq('department_id', department_id).execute()
        
        team_members = team_result.data or []
        logger.info(f"✅ [LEADER DASHBOARD] Found {len(team_members)} team members")
        
        if team_members:
            logger.debug(f"📧 [LEADER DASHBOARD] Team emails: {[m.get('email') for m in team_members]}")
        
        team_user_ids = [member['user_id'] for member in team_members]
        
        # Get latest biometric measurements for team
        logger.info(f"📊 [LEADER DASHBOARD] Step 3: Fetching biometric measurements for {len(team_user_ids)} users")
        measurements = []
        if team_user_ids:
            # Get the most recent measurement for each team member
            for idx, user_id in enumerate(team_user_ids, 1):
                logger.debug(f"🔍 [LEADER DASHBOARD] Fetching measurement {idx}/{len(team_user_ids)} for user: {user_id}")
                measurement_result = supabase.table('biometric_measurements').select('*').eq(
                    'user_id', user_id
                ).order('created_at', desc=True).limit(1).execute()
                
                if measurement_result.data:
                    measurements.extend(measurement_result.data)
                    logger.debug(f"✅ [LEADER DASHBOARD] Measurement found for user {user_id}")
                else:
                    logger.debug(f"⚠️ [LEADER DASHBOARD] No measurement for user {user_id}")
        
        logger.info(f"✅ [LEADER DASHBOARD] Total measurements retrieved: {len(measurements)}")
        
        # Calculate team statistics
        logger.info(f"📈 [LEADER DASHBOARD] Step 4: Calculating team statistics")
        total_members = len(team_members)
        members_with_data = len(measurements)
        
        avg_stress = 0
        avg_wellness = 0
        if measurements:
            stress_values = [m.get('ai_stress', 0) or 0 for m in measurements]
            wellness_values = [m.get('wellness_index_score', 0) or 0 for m in measurements]
            avg_stress = sum(stress_values) / len(measurements)
            avg_wellness = sum(wellness_values) / len(measurements)
            logger.info(f"📊 [LEADER DASHBOARD] Stats: avg_stress={avg_stress:.1f}, avg_wellness={avg_wellness:.1f}")
        else:
            logger.warning(f"⚠️ [LEADER DASHBOARD] No measurements available for statistics")
        
        response = {
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
        
        logger.info(f"✅ [LEADER DASHBOARD] SUCCESS - Returning data with {total_members} members, {len(measurements)} measurements")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ [LEADER DASHBOARD] FAILED - {type(e).__name__}: {e}", exc_info=True)
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
        logger.info(f"🎯 [HR DASHBOARD] START - user_id: {current_user.id}, email: {current_user.email}")
        
        # Get user profile data
        logger.info(f"📋 [HR DASHBOARD] Step 1: Fetching user profile data")
        user_data = await get_user_profile_data(current_user.id)
        profile = user_data['profile']
        organization_id = profile.get('organization_id')
        
        logger.info(f"✅ [HR DASHBOARD] Profile loaded: org_id={organization_id}")
        
        if not organization_id:
            error_msg = f"User profile missing organization_id={organization_id}"
            logger.error(f"❌ [HR DASHBOARD] {error_msg}")
            raise HTTPException(status_code=400, detail="User profile missing organization information")
        
        supabase = get_supabase_client()
        
        # Get all employees in the organization
        logger.info(f"👥 [HR DASHBOARD] Step 2: Fetching all employees in organization {organization_id}")
        employees_result = supabase.table('user_profiles').select('user_id, full_name, email, role, department_id').eq(
            'organization_id', organization_id
        ).execute()
        
        employees = employees_result.data or []
        logger.info(f"✅ [HR DASHBOARD] Found {len(employees)} employees")
        
        employee_user_ids = [emp['user_id'] for emp in employees]
        
        # Get departments
        logger.info(f"🏛️ [HR DASHBOARD] Step 3: Fetching departments")
        departments_result = supabase.table('departments').select('*').eq(
            'organization_id', organization_id
        ).execute()
        departments = departments_result.data or []
        logger.info(f"✅ [HR DASHBOARD] Found {len(departments)} departments")
        
        # Get latest measurements for all employees
        logger.info(f"📊 [HR DASHBOARD] Step 4: Fetching measurements for {len(employee_user_ids)} employees")
        measurements = []
        if employee_user_ids:
            for idx, user_id in enumerate(employee_user_ids, 1):
                logger.debug(f"🔍 [HR DASHBOARD] Fetching measurement {idx}/{len(employee_user_ids)} for user: {user_id}")
                measurement_result = supabase.table('biometric_measurements').select('*').eq(
                    'user_id', user_id
                ).order('created_at', desc=True).limit(1).execute()
                
                if measurement_result.data:
                    measurements.extend(measurement_result.data)
        
        logger.info(f"✅ [HR DASHBOARD] Total measurements retrieved: {len(measurements)}")
        
        # Calculate organization statistics
        logger.info(f"📈 [HR DASHBOARD] Step 5: Calculating organization statistics")
        total_employees = len(employees)
        employees_with_data = len(measurements)
        
        avg_stress = 0
        avg_wellness = 0
        high_risk_count = 0
        
        if measurements:
            stress_values = [m.get('ai_stress', 0) or 0 for m in measurements]
            wellness_values = [m.get('wellness_index_score', 0) or 0 for m in measurements]
            avg_stress = sum(stress_values) / len(measurements)
            avg_wellness = sum(wellness_values) / len(measurements)
            high_risk_count = sum(1 for m in measurements if (m.get('ai_stress', 0) or 0) > 70)
            logger.info(f"📊 [HR DASHBOARD] Stats: avg_stress={avg_stress:.1f}, avg_wellness={avg_wellness:.1f}, high_risk={high_risk_count}")
        else:
            logger.warning(f"⚠️ [HR DASHBOARD] No measurements available for statistics")
        
        response = {
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
        
        logger.info(f"✅ [HR DASHBOARD] SUCCESS - Returning data with {total_employees} employees, {len(departments)} departments, {len(measurements)} measurements")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ [HR DASHBOARD] FAILED - {type(e).__name__}: {e}", exc_info=True)
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
        logger.info(f"🎯 [ADMIN DASHBOARD] START - user_id: {current_user.id}, email: {current_user.email}")
        
        # Get user profile data
        logger.info(f"📋 [ADMIN DASHBOARD] Step 1: Fetching user profile data")
        user_data = await get_user_profile_data(current_user.id)
        profile = user_data['profile']
        organization_id = profile.get('organization_id')
        
        logger.info(f"✅ [ADMIN DASHBOARD] Profile loaded: org_id={organization_id}")
        
        if not organization_id:
            error_msg = f"User profile missing organization_id={organization_id}"
            logger.error(f"❌ [ADMIN DASHBOARD] {error_msg}")
            raise HTTPException(status_code=400, detail="User profile missing organization information")
        
        supabase = get_supabase_client()
        
        # Get organization data
        logger.info(f"🏢 [ADMIN DASHBOARD] Step 2: Fetching organization details")
        org_result = supabase.table('organizations').select('*').eq('id', organization_id).execute()
        organization = org_result.data[0] if org_result.data else None
        logger.info(f"✅ [ADMIN DASHBOARD] Organization: {organization.get('name') if organization else 'Not found'}")
        
        # Get all users in organization
        logger.info(f"👥 [ADMIN DASHBOARD] Step 3: Fetching all users")
        users_result = supabase.table('user_profiles').select('*').eq('organization_id', organization_id).execute()
        users = users_result.data or []
        logger.info(f"✅ [ADMIN DASHBOARD] Found {len(users)} users")
        
        # Get departments
        logger.info(f"🏛️ [ADMIN DASHBOARD] Step 4: Fetching departments")
        departments_result = supabase.table('departments').select('*').eq('organization_id', organization_id).execute()
        departments = departments_result.data or []
        logger.info(f"✅ [ADMIN DASHBOARD] Found {len(departments)} departments")
        
        # Calculate statistics
        logger.info(f"📈 [ADMIN DASHBOARD] Step 5: Calculating statistics")
        total_users = len(users)
        active_users = sum(1 for u in users if u.get('status') == 'active')
        logger.info(f"📊 [ADMIN DASHBOARD] Stats: total_users={total_users}, active_users={active_users}")
        
        response = {
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
        
        logger.info(f"✅ [ADMIN DASHBOARD] SUCCESS - Returning data with {total_users} users, {len(departments)} departments")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ [ADMIN DASHBOARD] FAILED - {type(e).__name__}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error loading admin dashboard: {str(e)}")