import { apiClient } from './api-client';

export interface DashboardStats {
  totalScans: number;
  activeUsers: number;
  avgHealthScore: number;
  criticalAlerts: number;
  trends?: {
    scans: number;
    users: number;
    health: number;
  };
}

export interface BiometricData {
  timestamp: string;
  value: number;
  indicator: string;
}

export interface DepartmentStats {
  department_id: string;
  department_name: string;
  employee_count: number;
  avg_health_score: number;
  recent_scans: number;
}

/**
 * Fetch dashboard statistics for different roles
 */
export async function fetchDashboardStats(role: string, params?: any): Promise<DashboardStats> {
  try {
    let data;
    
    switch (role) {
      case 'admin_global':
      case 'admin':
        data = await apiClient.dashboards.admin(params);
        break;
      case 'rrhh':
      case 'hr_manager':
        data = await apiClient.dashboards.hr(params);
        break;
      case 'leader':
        data = await apiClient.dashboards.leader(params);
        break;
      default:
        data = await apiClient.dashboards.getStats(params);
    }

    return {
      totalScans: data?.total_scans || 0,
      activeUsers: data?.active_users || 0,
      avgHealthScore: data?.avg_health_score || 0,
      criticalAlerts: data?.critical_alerts || 0,
      trends: data?.trends,
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      totalScans: 0,
      activeUsers: 0,
      avgHealthScore: 0,
      criticalAlerts: 0,
    };
  }
}

/**
 * Fetch biometric measurements for a user or department
 */
export async function fetchBiometricData(
  userId?: string,
  departmentId?: string,
  limit = 10
): Promise<BiometricData[]> {
  try {
    let measurements;

    if (userId) {
      measurements = await apiClient.getMeasurementHistory(userId, limit);
    } else {
      measurements = await apiClient.getAllMeasurements(limit);
    }

    return measurements.map((m: any) => ({
      timestamp: m.measurement_timestamp,
      value: m.global_health_score || 0,
      indicator: 'health_score',
    }));
  } catch (error) {
    console.error('Error fetching biometric data:', error);
    return [];
  }
}

/**
 * Fetch department statistics
 */
export async function fetchDepartmentStats(organizationId?: string): Promise<DepartmentStats[]> {
  try {
    const query = organizationId ? { organization_id: organizationId } : {};
    const response = await apiClient.departments.query({
      query,
      limit: 100,
    });

    const departments = response.items || [];

    // Get user counts per department
    const userResponse = await apiClient.userProfiles.listAll({ limit: 10000 });
    const users = userResponse.items || [];

    // Get recent measurements
    const measurements = await apiClient.getAllMeasurements(1000);

    return departments.map((dept: any) => {
      const deptUsers = users.filter((u: any) => u.department_id === dept.id);
      const deptMeasurements = measurements.filter((m: any) => 
        deptUsers.some((u: any) => u.user_id === m.user_id)
      );

      const avgScore = deptMeasurements.length > 0
        ? deptMeasurements.reduce((sum: number, m: any) => sum + (m.global_health_score || 0), 0) / deptMeasurements.length
        : 0;

      return {
        department_id: dept.id,
        department_name: dept.name,
        employee_count: deptUsers.length,
        avg_health_score: avgScore,
        recent_scans: deptMeasurements.length,
      };
    });
  } catch (error) {
    console.error('Error fetching department stats:', error);
    return [];
  }
}

/**
 * Get indicator value from measurement data
 */
export function getIndicatorValue(measurement: any, indicatorCode: string): number {
  if (!measurement) return 0;
  
  const code = String(indicatorCode);
  const value = measurement[code];
  
  if (typeof value === 'number' && !isNaN(value)) {
    return value;
  }
  
  return 0;
}

/**
 * Format health score for display
 */
export function formatHealthScore(score: number): string {
  if (isNaN(score)) return '0';
  return score.toFixed(1);
}

/**
 * Get risk level color
 */
export function getRiskLevelColor(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  if (score >= 40) return 'text-orange-600';
  return 'text-red-600';
}

/**
 * Calculate trend percentage
 */
export function calculateTrend(current: number, previous: number): number {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}