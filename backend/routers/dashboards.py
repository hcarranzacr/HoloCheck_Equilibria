"""
Dashboard API Router
Provides aggregated data for different dashboard views including evolution charts
MIGRATED TO SUPABASE API - NO SQLAlchemy
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from datetime import datetime, timedelta
from typing import Optional
import logging

from core.supabase_client import get_supabase_admin
from dependencies.auth import get_current_user
from schemas.auth import UserResponse

router = APIRouter(prefix="/api/v1/dashboards", tags=["dashboards"])
logger = logging.getLogger(__name__)


# =====================================================
# EMPLOYEE DASHBOARD ENDPOINTS
# =====================================================

@router.get("/employee")
async def get_employee_dashboard(
    current_user: UserResponse = Depends(get_current_user),
):
    """
    Get dashboard data for an employee
    """
    try:
        logger.info(f"🔍 DASHBOARD DEBUG - Fetching employee dashboard for user_id: {current_user.id}")
        
        supabase = get_supabase_admin()
        
        # Get user profile
        profile_response = supabase.table('user_profiles')\
            .select('*')\
            .eq('user_id', str(current_user.id))\
            .execute()
        
        if not profile_response.data or len(profile_response.data) == 0:
            logger.error(f"❌ DASHBOARD ERROR - No profile found for user_id: {current_user.id}")
            raise HTTPException(
                status_code=404,
                detail=f"User profile not found for user_id: {current_user.id}"
            )
        
        profile = profile_response.data[0]
        logger.info(f"✅ DASHBOARD DEBUG - Found profile: {profile.get('full_name')}")
        
        # Get biometric measurements for this user
        measurements_response = supabase.table('biometric_measurements')\
            .select('*')\
            .eq('user_id', str(current_user.id))\
            .order('created_at', desc=True)\
            .execute()
        
        measurements = measurements_response.data
        logger.info(f"🔍 DASHBOARD DEBUG - Found {len(measurements)} biometric measurements")
        
        if not measurements:
            logger.warning(f"⚠️ DASHBOARD WARNING - No biometric measurements for user_id: {current_user.id}")
            
            return {
                "profile": {
                    "id": profile.get('id'),
                    "user_id": profile.get('user_id'),
                    "full_name": profile.get('full_name'),
                    "email": profile.get('email'),
                    "role": profile.get('role'),
                    "organization_id": profile.get('organization_id'),
                    "department_id": profile.get('department_id'),
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
        logger.info(f"✅ DASHBOARD DEBUG - Latest scan: {latest.get('created_at')}")
        
        return {
            "profile": {
                "id": profile.get('id'),
                "user_id": profile.get('user_id'),
                "full_name": profile.get('full_name'),
                "email": profile.get('email'),
                "role": profile.get('role'),
                "organization_id": profile.get('organization_id'),
                "department_id": profile.get('department_id'),
            },
            "latest_scan": {
                "id": latest.get('id'),
                "created_at": latest.get('created_at'),
                "heart_rate": latest.get('heart_rate'),
                "stress_level": latest.get('ai_stress'),
                "recovery_score": latest.get('ai_recovery'),
                "bmi": latest.get('bmi'),
            },
            "scan_history": [
                {
                    "id": m.get('id'),
                    "created_at": m.get('created_at'),
                    "heart_rate": m.get('heart_rate'),
                    "stress_level": m.get('ai_stress'),
                    "recovery_score": m.get('ai_recovery'),
                }
                for m in measurements[:10]  # Last 10 scans
            ],
            "health_metrics": {
                "heart_rate": latest.get('heart_rate'),
                "stress_level": latest.get('ai_stress'),
                "recovery_score": latest.get('ai_recovery'),
                "bmi": latest.get('bmi'),
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


@router.get("/employee/evolution")
async def get_employee_evolution(
    months: int = Query(default=6, ge=1, le=24, description="Number of months to fetch"),
    current_user: UserResponse = Depends(get_current_user),
):
    """
    Get personal evolution data for employee dashboard
    Returns monthly aggregated biometric metrics
    ADAPTIVE: If no data in requested period, automatically expands to show all available data
    """
    try:
        logger.info(f"📊 [EMPLOYEE EVOLUTION] Fetching data for user {current_user.id}, months={months}")
        
        supabase = get_supabase_admin()
        
        # First, check if user has ANY data at all
        count_response = supabase.table('biometric_measurements')\
            .select('id', count='exact')\
            .eq('user_id', str(current_user.id))\
            .execute()
        
        total_count = count_response.count if hasattr(count_response, 'count') else 0
        logger.info(f"📊 [EMPLOYEE EVOLUTION] Total measurements: {total_count}")
        
        if total_count == 0:
            logger.warning(f"⚠️ [EMPLOYEE EVOLUTION] No data found for user {current_user.id}")
            return {
                "data": [],
                "period": f"last_{months}_months",
                "user_id": str(current_user.id),
                "total_points": 0,
                "message": "No biometric measurements found"
            }
        
        # Get all measurements for aggregation
        all_measurements_response = supabase.table('biometric_measurements')\
            .select('created_at, ai_stress, ai_fatigue, ai_recovery, ai_cognitive_load, mental_score')\
            .eq('user_id', str(current_user.id))\
            .order('created_at', desc=False)\
            .execute()
        
        measurements = all_measurements_response.data
        
        # Calculate date threshold
        from datetime import datetime, timedelta
        threshold_date = datetime.now() - timedelta(days=months * 30)
        
        # Group by month and calculate averages
        monthly_data = {}
        for m in measurements:
            created_at = m.get('created_at')
            if not created_at:
                continue
            
            # Parse date
            if isinstance(created_at, str):
                date_obj = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
            else:
                date_obj = created_at
            
            # Month key
            month_key = date_obj.strftime('%Y-%m')
            month_start = date_obj.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            
            if month_key not in monthly_data:
                monthly_data[month_key] = {
                    'month': month_key,
                    'month_start': month_start,
                    'ai_stress': [],
                    'ai_fatigue': [],
                    'ai_recovery': [],
                    'ai_cognitive_load': [],
                    'mental_score': [],
                    'scan_count': 0
                }
            
            monthly_data[month_key]['scan_count'] += 1
            if m.get('ai_stress') is not None:
                monthly_data[month_key]['ai_stress'].append(float(m.get('ai_stress')))
            if m.get('ai_fatigue') is not None:
                monthly_data[month_key]['ai_fatigue'].append(float(m.get('ai_fatigue')))
            if m.get('ai_recovery') is not None:
                monthly_data[month_key]['ai_recovery'].append(float(m.get('ai_recovery')))
            if m.get('ai_cognitive_load') is not None:
                monthly_data[month_key]['ai_cognitive_load'].append(float(m.get('ai_cognitive_load')))
            if m.get('mental_score') is not None:
                monthly_data[month_key]['mental_score'].append(float(m.get('mental_score')))
        
        # Calculate averages and wellness_index
        data = []
        for month_key in sorted(monthly_data.keys()):
            month_info = monthly_data[month_key]
            
            avg_stress = sum(month_info['ai_stress']) / len(month_info['ai_stress']) if month_info['ai_stress'] else None
            avg_fatigue = sum(month_info['ai_fatigue']) / len(month_info['ai_fatigue']) if month_info['ai_fatigue'] else None
            avg_recovery = sum(month_info['ai_recovery']) / len(month_info['ai_recovery']) if month_info['ai_recovery'] else None
            avg_cognitive_load = sum(month_info['ai_cognitive_load']) / len(month_info['ai_cognitive_load']) if month_info['ai_cognitive_load'] else None
            avg_mental_score = sum(month_info['mental_score']) / len(month_info['mental_score']) if month_info['mental_score'] else None
            
            # Calculate wellness_index: (100 - ai_stress + 100 - ai_fatigue + ai_recovery) / 3
            wellness_index_score = None
            if avg_stress is not None and avg_fatigue is not None and avg_recovery is not None:
                wellness_index_score = (100 - avg_stress + 100 - avg_fatigue + avg_recovery) / 3
            
            data.append({
                "month": month_key,
                "month_start": month_info['month_start'].isoformat(),
                "wellness_index_score": wellness_index_score,
                "ai_stress": avg_stress,
                "ai_fatigue": avg_fatigue,
                "ai_recovery": avg_recovery,
                "ai_cognitive_load": avg_cognitive_load,
                "mental_score": avg_mental_score,
                "scan_count": month_info['scan_count'],
            })
        
        # Filter by requested months if data exists
        if len(data) > months:
            data = data[-months:]
            actual_period = f"last_{months}_months"
        else:
            actual_period = f"all_{len(data)}_months"
        
        logger.info(f"✅ [EMPLOYEE EVOLUTION] Returning {len(data)} data points, period: {actual_period}")
        if data:
            logger.info(f"📊 [EMPLOYEE EVOLUTION] Sample data point: {data[0]}")
        
        return {
            "data": data,
            "period": actual_period,
            "user_id": str(current_user.id),
            "total_points": len(data),
        }
        
    except Exception as e:
        logger.error(f"❌ [EMPLOYEE EVOLUTION] Error: {e}")
        import traceback
        logger.error(f"❌ [EMPLOYEE EVOLUTION] Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch employee evolution: {str(e)}"
        )


# =====================================================
# LEADER DASHBOARD ENDPOINTS
# =====================================================

@router.get("/leader")
async def get_leader_dashboard(
    current_user: UserResponse = Depends(get_current_user),
):
    """
    Get dashboard data for a team leader
    """
    try:
        supabase = get_supabase_admin()
        
        # Get user profile
        profile_response = supabase.table('user_profiles')\
            .select('*')\
            .eq('user_id', str(current_user.id))\
            .execute()
        
        if not profile_response.data or len(profile_response.data) == 0:
            raise HTTPException(
                status_code=404,
                detail="User profile not found"
            )
        
        profile = profile_response.data[0]
        
        # Get team members (same department)
        if not profile.get('department_id'):
            return {
                "profile": {
                    "id": profile.get('id'),
                    "full_name": profile.get('full_name'),
                    "role": profile.get('role'),
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
        
        team_response = supabase.table('user_profiles')\
            .select('*')\
            .eq('department_id', profile.get('department_id'))\
            .execute()
        
        team_members = team_response.data
        
        return {
            "profile": {
                "id": profile.get('id'),
                "full_name": profile.get('full_name'),
                "role": profile.get('role'),
                "department_id": profile.get('department_id'),
            },
            "team_metrics": {
                "total_members": len(team_members),
                "scans_this_week": 0,
                "average_stress": None,
                "high_risk_count": 0,
            },
            "team_members": [
                {
                    "id": member.get('id'),
                    "full_name": member.get('full_name'),
                    "email": member.get('email'),
                    "role": member.get('role'),
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


@router.get("/leader/team-evolution")
async def get_team_evolution(
    months: int = Query(default=6, ge=1, le=24, description="Number of months to fetch"),
    current_user: UserResponse = Depends(get_current_user),
):
    """
    Get team evolution data for leader dashboard using vw_department_insight_timeline
    Returns monthly department insights
    """
    try:
        logger.info(f"📊 [TEAM EVOLUTION] Fetching data for user {current_user.id}, months={months}")
        
        supabase = get_supabase_admin()
        
        # Get user's department
        profile_response = supabase.table('user_profiles')\
            .select('department_id')\
            .eq('user_id', str(current_user.id))\
            .execute()
        
        if not profile_response.data or not profile_response.data[0].get('department_id'):
            raise HTTPException(
                status_code=404,
                detail="User profile or department not found"
            )
        
        department_id = profile_response.data[0].get('department_id')
        logger.info(f"📊 [TEAM EVOLUTION] Department ID: {department_id}")
        
        # Get data from view
        view_response = supabase.table('vw_department_insight_timeline')\
            .select('*')\
            .eq('department_id', department_id)\
            .order('created_at', desc=False)\
            .execute()
        
        rows = view_response.data
        logger.info(f"📊 [TEAM EVOLUTION] Query executed, found {len(rows)} months of data from vw_department_insight_timeline")
        
        data = [
            {
                "analysis_period": row.get('created_at', '')[:7] if row.get('created_at') else None,
                "month_start": row.get('created_at'),
                "wellness_index": row.get('wellness_index'),
                "avg_stress": row.get('avg_stress'),
                "avg_fatigue": row.get('avg_fatigue'),
                "avg_recovery": row.get('avg_recovery'),
                "avg_cognitive_load": row.get('avg_cognitive_load'),
                "burnout_risk_score": row.get('burnout_risk_score'),
                "employees_scanned": row.get('employee_count', 0),
                "total_scans": row.get('employee_count', 0),
            }
            for row in rows
        ]
        
        # Filter by requested months
        if len(data) > months:
            data = data[-months:]
        
        logger.info(f"✅ [TEAM EVOLUTION] Returning {len(data)} data points")
        if data:
            logger.info(f"📊 [TEAM EVOLUTION] Sample data point: {data[0]}")
        
        return {
            "data": data,
            "period": f"last_{months}_months" if len(data) > 0 else "all_available_data",
            "department_id": department_id,
            "total_points": len(data)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ [TEAM EVOLUTION] Error: {e}")
        import traceback
        logger.error(f"❌ [TEAM EVOLUTION] Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch team evolution: {str(e)}"
        )


# =====================================================
# HR DASHBOARD ENDPOINTS
# =====================================================

@router.get("/hr")
async def get_hr_dashboard(
    current_user: UserResponse = Depends(get_current_user),
):
    """
    Get dashboard data for HR
    """
    try:
        supabase = get_supabase_admin()
        
        # Get user profile
        profile_response = supabase.table('user_profiles')\
            .select('*')\
            .eq('user_id', str(current_user.id))\
            .execute()
        
        if not profile_response.data or len(profile_response.data) == 0:
            raise HTTPException(
                status_code=404,
                detail="User profile not found"
            )
        
        profile = profile_response.data[0]
        
        # Get all employees in organization
        if not profile.get('organization_id'):
            return {
                "profile": {
                    "id": profile.get('id'),
                    "full_name": profile.get('full_name'),
                    "role": profile.get('role'),
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
        
        employees_response = supabase.table('user_profiles')\
            .select('*')\
            .eq('organization_id', profile.get('organization_id'))\
            .execute()
        
        employees = employees_response.data
        
        # Count unique departments
        unique_departments = set(e.get('department_id') for e in employees if e.get('department_id'))
        
        return {
            "profile": {
                "id": profile.get('id'),
                "full_name": profile.get('full_name'),
                "role": profile.get('role'),
                "organization_id": profile.get('organization_id'),
            },
            "organization_metrics": {
                "total_employees": len(employees),
                "scans_this_month": 0,
                "average_wellness": None,
                "departments_count": len(unique_departments),
            },
            "employees": [
                {
                    "id": emp.get('id'),
                    "full_name": emp.get('full_name'),
                    "email": emp.get('email'),
                    "role": emp.get('role'),
                    "department_id": emp.get('department_id'),
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


@router.get("/hr/organization-evolution")
async def get_organization_evolution(
    months: int = Query(default=12, ge=1, le=24, description="Number of months to fetch"),
    current_user: UserResponse = Depends(get_current_user),
):
    """
    Get organization-wide evolution data for HR dashboard using organization_insights table
    Returns monthly organization insights
    """
    try:
        logger.info(f"📊 [ORG EVOLUTION] Fetching data for user {current_user.id}, months={months}")
        
        supabase = get_supabase_admin()
        
        # Get user's organization
        profile_response = supabase.table('user_profiles')\
            .select('organization_id')\
            .eq('user_id', str(current_user.id))\
            .execute()
        
        if not profile_response.data or not profile_response.data[0].get('organization_id'):
            raise HTTPException(
                status_code=404,
                detail="User profile or organization not found"
            )
        
        organization_id = profile_response.data[0].get('organization_id')
        logger.info(f"📊 [ORG EVOLUTION] Organization ID: {organization_id}")
        
        # Get data from organization_insights
        insights_response = supabase.table('organization_insights')\
            .select('*')\
            .eq('organization_id', organization_id)\
            .order('analysis_date', desc=False)\
            .execute()
        
        rows = insights_response.data
        logger.info(f"📊 [ORG EVOLUTION] Query executed, found {len(rows)} months of data from organization_insights")
        
        data = [
            {
                "month": row.get('analysis_date', '')[:7] if row.get('analysis_date') else None,
                "analysis_date": row.get('analysis_date'),
                "wellness_index": float(100 - (row.get('stress_index', 0) * 20)) if row.get('stress_index') is not None else None,
                "stress_index": row.get('stress_index'),
                "burnout_risk": row.get('burnout_risk'),
                "sleep_index": row.get('sleep_index'),
                "actuarial_risk": row.get('actuarial_risk'),
                "claim_risk": row.get('claim_risk'),
                "total_employees": row.get('total_employees', 0),
            }
            for row in rows
        ]
        
        # Filter by requested months
        if len(data) > months:
            data = data[-months:]
        
        logger.info(f"✅ [ORG EVOLUTION] Returning {len(data)} data points")
        if data:
            logger.info(f"📊 [ORG EVOLUTION] Sample data point: {data[0]}")
        
        return {
            "data": data,
            "period": f"last_{months}_months" if len(data) > 0 else "all_available_data",
            "organization_id": organization_id,
            "total_points": len(data)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ [ORG EVOLUTION] Error: {e}")
        import traceback
        logger.error(f"❌ [ORG EVOLUTION] Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch organization evolution: {str(e)}"
        )


# =====================================================
# ADMIN DASHBOARD ENDPOINTS
# =====================================================

@router.get("/admin/usage-trends")
async def get_usage_trends(
    months: int = Query(default=12, ge=1, le=24, description="Number of months to fetch"),
    current_user: UserResponse = Depends(get_current_user),
):
    """
    Get usage trends for admin dashboard
    Returns monthly usage summary
    """
    try:
        logger.info(f"📊 [USAGE TRENDS] Fetching data for user {current_user.id}, months={months}")
        
        supabase = get_supabase_admin()
        
        # Get user's organization
        profile_response = supabase.table('user_profiles')\
            .select('organization_id')\
            .eq('user_id', str(current_user.id))\
            .execute()
        
        if not profile_response.data or not profile_response.data[0].get('organization_id'):
            raise HTTPException(
                status_code=404,
                detail="User profile or organization not found"
            )
        
        organization_id = profile_response.data[0].get('organization_id')
        logger.info(f"📊 [USAGE TRENDS] Organization ID: {organization_id}")
        
        # Get data from organization_usage_summary
        usage_response = supabase.table('organization_usage_summary')\
            .select('*')\
            .eq('organization_id', organization_id)\
            .order('month', desc=False)\
            .execute()
        
        rows = usage_response.data
        logger.info(f"📊 [USAGE TRENDS] Query executed, found {len(rows)} months of data")
        
        data = [
            {
                "month": row.get('month', '')[:7] if row.get('month') else None,
                "total_scans": row.get('total_scans', 0),
                "total_valid_scans": row.get('total_valid_scans', 0),
                "total_invalid_scans": row.get('total_scans', 0) - row.get('total_valid_scans', 0),
                "total_prompts_used": row.get('total_ai_tokens_used', 0),
                "total_department_analyses": row.get('total_department_analyses', 0),
                "total_organization_analyses": row.get('total_organization_analyses', 0),
            }
            for row in rows
        ]
        
        # Filter by requested months
        if len(data) > months:
            data = data[-months:]
        
        logger.info(f"✅ [USAGE TRENDS] Returning {len(data)} data points")
        if data:
            logger.info(f"📊 [USAGE TRENDS] Sample data point: {data[0]}")
        
        return {
            "data": data,
            "period": f"last_{months}_months" if len(data) > 0 else "all_available_data",
            "organization_id": organization_id,
            "total_points": len(data)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ [USAGE TRENDS] Error: {e}")
        import traceback
        logger.error(f"❌ [USAGE TRENDS] Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch usage trends: {str(e)}"
        )