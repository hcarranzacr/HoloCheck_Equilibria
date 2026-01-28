import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Users, 
  Building2,
  TrendingUp, 
  TrendingDown, 
  Activity,
  AlertTriangle,
  Shield,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

interface OrganizationMetrics {
  total_employees: number;
  total_departments: number;
  scanned_employees: number;
  avg_stress_level: number;
  avg_energy_level: number;
  avg_focus_level: number;
  high_risk_count: number;
  medium_risk_count: number;
  low_risk_count: number;
}

interface DepartmentMetrics {
  department_id: number;
  department_name: string;
  total_employees: number;
  scanned_employees: number;
  avg_stress_level: number;
  high_risk_count: number;
  last_updated: string;
}

interface OrganizationInsight {
  id: number;
  insight_type: string;
  insight_text: string;
  severity: string;
  created_at: string;
}

interface EmployeeAtRisk {
  user_id: string;
  full_name: string;
  department_name: string;
  risk_level: string;
  avg_stress_level: number;
  last_scan_date: string;
  scan_count: number;
}

export default function HRDashboard() {
  const [orgMetrics, setOrgMetrics] = useState<OrganizationMetrics | null>(null);
  const [deptMetrics, setDeptMetrics] = useState<DepartmentMetrics[]>([]);
  const [insights, setInsights] = useState<OrganizationInsight[]>([]);
  const [atRiskEmployees, setAtRiskEmployees] = useState<EmployeeAtRisk[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboardData = async () => {
    try {
      setError(null);
      
      // Load organization-wide metrics
      const orgResponse = await apiClient.get('/api/v1/organization-metrics/summary');
      setOrgMetrics(orgResponse.data);

      // Load all department metrics
      const deptResponse = await apiClient.get('/api/v1/department-metrics/all');
      setDeptMetrics(deptResponse.data.items || []);

      // Load organization insights
      const insightsResponse = await apiClient.get('/api/v1/organization-insights', {
        params: { limit: 10, sort: '-created_at' }
      });
      setInsights(insightsResponse.data.items || []);

      // Load employees at risk
      const riskResponse = await apiClient.get('/api/v1/employees/at-risk');
      setAtRiskEmployees(riskResponse.data.items || []);

    } catch (err: any) {
      const errorMsg = err?.response?.data?.detail || err?.message || 'Error loading dashboard data';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const getRiskColor = (risk: string) => {
    switch (risk?.toLowerCase()) {
      case 'high': return 'destructive';
      case 'medium': return 'warning';
      case 'low': return 'default';
      default: return 'secondary';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'warning';
      case 'low': return 'default';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={handleRefresh} className="mt-4">
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">HR Dashboard</h1>
          <p className="text-muted-foreground">Organization-wide health and wellness overview</p>
        </div>
        <Button onClick={handleRefresh} disabled={refreshing} variant="outline">
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orgMetrics?.total_employees || 0}</div>
            <p className="text-xs text-muted-foreground">
              {orgMetrics?.scanned_employees || 0} scanned
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orgMetrics?.total_departments || 0}</div>
            <p className="text-xs text-muted-foreground">Active departments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Stress Level</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orgMetrics?.avg_stress_level?.toFixed(1) || 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {orgMetrics?.avg_stress_level > 7 ? (
                <span className="text-red-500 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" /> High
                </span>
              ) : (
                <span className="text-green-500 flex items-center">
                  <TrendingDown className="h-3 w-3 mr-1" /> Normal
                </span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">At Risk</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {orgMetrics?.high_risk_count || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {orgMetrics?.medium_risk_count || 0} medium, {orgMetrics?.low_risk_count || 0} low
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="departments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="at-risk">At Risk Employees</TabsTrigger>
          <TabsTrigger value="insights">Organization Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="departments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Department Overview</CardTitle>
              <CardDescription>Health metrics across all departments</CardDescription>
            </CardHeader>
            <CardContent>
              {deptMetrics.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No department data available</p>
              ) : (
                <div className="space-y-4">
                  {deptMetrics.map((dept) => (
                    <div key={dept.department_id} className="flex items-center justify-between border-b pb-4 last:border-0">
                      <div className="space-y-1">
                        <p className="font-medium">{dept.department_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {dept.total_employees} employees • {dept.scanned_employees} scanned
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            Avg Stress: {dept.avg_stress_level?.toFixed(1) || 'N/A'}
                          </p>
                          <p className="text-sm text-red-500">
                            {dept.high_risk_count || 0} at risk
                          </p>
                        </div>
                        <Badge variant={dept.high_risk_count > 0 ? 'destructive' : 'default'}>
                          {dept.high_risk_count > 0 ? 'Attention' : 'Good'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="at-risk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Employees At Risk</CardTitle>
              <CardDescription>Employees requiring attention or support</CardDescription>
            </CardHeader>
            <CardContent>
              {atRiskEmployees.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No at-risk employees</p>
              ) : (
                <div className="space-y-4">
                  {atRiskEmployees.map((employee, idx) => (
                    <div key={idx} className="flex items-center justify-between border-b pb-4 last:border-0">
                      <div className="space-y-1">
                        <p className="font-medium">{employee.full_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {employee.department_name} • {employee.scan_count} scans
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Last scan: {new Date(employee.last_scan_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            Avg Stress: {employee.avg_stress_level?.toFixed(1)}
                          </p>
                        </div>
                        <Badge variant={getRiskColor(employee.risk_level)}>
                          {employee.risk_level}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Organization Insights</CardTitle>
              <CardDescription>AI-generated insights for the entire organization</CardDescription>
            </CardHeader>
            <CardContent>
              {insights.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No insights available</p>
              ) : (
                <div className="space-y-4">
                  {insights.map((insight) => (
                    <div key={insight.id} className="border-l-4 border-primary pl-4 py-2">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <Badge variant={getSeverityColor(insight.severity)}>
                              {insight.severity}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {insight.insight_type}
                            </span>
                          </div>
                          <p className="text-sm">{insight.insight_text}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(insight.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}