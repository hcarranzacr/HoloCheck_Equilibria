import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  TrendingUp, 
  TrendingDown, 
  Activity,
  AlertTriangle,
  Calendar,
  Heart,
  Brain,
  Battery,
  RefreshCw,
  Gift,
  Target
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface DepartmentInsight {
  id: string;
  department_id: string;
  employee_count: number;
  avg_stress: number;
  avg_fatigue: number;
  avg_cognitive_load: number;
  avg_recovery: number;
  avg_bio_age_gap: number;
  burnout_risk_score: number;
  wellness_index: number;
  insight_summary: string;
  stress_level_flag: string;
  burnout_risk_flag: string;
  wellness_trend: string;
  risk_score: number;
  percentile_in_org: number;
  created_at: string;
}

interface DepartmentMetrics {
  department_id: string;
  department_name: string;
  employee_count: number;
  avg_stress: number;
  avg_fatigue: number;
  avg_cognitive_load: number;
  avg_recovery: number;
  avg_bio_age: number;
  avg_wellness_index: number;
}

interface EmployeeAtRisk {
  user_id: string;
  full_name: string;
  email: string;
  ai_stress: number;
  ai_fatigue: number;
  ai_recovery: number;
  wellness_index_score: number;
  nivel_riesgo: string;
  created_at: string;
}

interface LoyaltyProgram {
  benefit_id: string;
  benefit_title: string;
  benefit_description: string;
  partner_name: string;
  indicator_code: string;
  relevance_level: string;
  tags: string[];
  link_url: string;
}

interface LatestScan {
  user_id: string;
  full_name: string;
  ai_stress: number;
  ai_fatigue: number;
  ai_recovery: number;
  wellness_index_score: number;
  created_at: string;
}

// Centralized logging function
async function logActivity(action: string, details: any, level: 'info' | 'warning' | 'error' = 'info') {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('system_logs').insert({
      user_id: user?.id,
      action,
      details: JSON.stringify(details),
      level,
      created_at: new Date().toISOString()
    });
    
    const emoji = level === 'error' ? '❌' : level === 'warning' ? '⚠️' : '✅';
    console.log(`${emoji} [Leader Dashboard] ${action}:`, details);
  } catch (error) {
    console.error('❌ [Leader Dashboard] Error logging activity:', error);
  }
}

export default function LeaderDashboard() {
  const [insights, setInsights] = useState<DepartmentInsight | null>(null);
  const [metrics, setMetrics] = useState<DepartmentMetrics | null>(null);
  const [employeesAtRisk, setEmployeesAtRisk] = useState<EmployeeAtRisk[]>([]);
  const [loyaltyPrograms, setLoyaltyPrograms] = useState<LoyaltyProgram[]>([]);
  const [latestScans, setLatestScans] = useState<LatestScan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [userDepartmentId, setUserDepartmentId] = useState<string | null>(null);

  const loadDashboardData = async () => {
    try {
      setError(null);
      console.log('📊 [Leader Dashboard] Loading data...');
      await logActivity('dashboard_load_start', { dashboard: 'leader' }, 'info');

      // Get current user and department
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('department_id, organization_id')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        console.error('❌ [Leader Dashboard] Error loading profile:', profileError);
        await logActivity('profile_load_error', { error: profileError.message }, 'error');
        throw new Error('Error loading user profile');
      }

      const deptId = profile.department_id;
      const orgId = profile.organization_id;
      setUserDepartmentId(deptId);
      console.log('✅ [Leader Dashboard] User department:', deptId);

      // Load department insights
      const { data: insightsData, error: insightsError } = await supabase
        .from('department_insights')
        .select('*')
        .eq('department_id', deptId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (insightsError) {
        console.error('⚠️ [Leader Dashboard] No insights found:', insightsError);
        await logActivity('insights_load_warning', { error: insightsError.message }, 'warning');
      } else {
        setInsights(insightsData);
        console.log('✅ [Leader Dashboard] Insights loaded:', insightsData);
        await logActivity('insights_loaded', { department_id: deptId }, 'info');
      }

      // Load department metrics
      const { data: metricsData, error: metricsError } = await supabase
        .from('vw_current_department_metrics')
        .select('*')
        .eq('department_id', deptId)
        .single();

      if (metricsError) {
        console.error('⚠️ [Leader Dashboard] No metrics found:', metricsError);
        await logActivity('metrics_load_warning', { error: metricsError.message }, 'warning');
      } else {
        setMetrics(metricsData);
        console.log('✅ [Leader Dashboard] Metrics loaded:', metricsData);
        await logActivity('metrics_loaded', { department_id: deptId }, 'info');
      }

      // Load employees at risk from department
      const { data: riskData, error: riskError } = await supabase
        .from('vw_employees_at_risk')
        .select('*')
        .eq('department_id', deptId)
        .order('ai_stress', { ascending: false });

      if (riskError) {
        console.error('⚠️ [Leader Dashboard] Error loading at-risk employees:', riskError);
        await logActivity('at_risk_load_warning', { error: riskError.message }, 'warning');
      } else {
        setEmployeesAtRisk(riskData || []);
        console.log('✅ [Leader Dashboard] At-risk employees loaded:', riskData?.length);
        await logActivity('at_risk_loaded', { count: riskData?.length }, 'info');
      }

      // Load loyalty programs relevant to department
      const { data: programsData, error: programsError } = await supabase
        .from('vw_active_partner_programs_by_org')
        .select('*')
        .eq('organization_id', orgId)
        .limit(5);

      if (programsError) {
        console.error('⚠️ [Leader Dashboard] Error loading loyalty programs:', programsError);
        await logActivity('programs_load_warning', { error: programsError.message }, 'warning');
      } else {
        setLoyaltyPrograms(programsData || []);
        console.log('✅ [Leader Dashboard] Loyalty programs loaded:', programsData?.length);
        await logActivity('programs_loaded', { count: programsData?.length }, 'info');
      }

      // Load latest scans from department
      const { data: deptUsers, error: usersError } = await supabase
        .from('user_profiles')
        .select('user_id')
        .eq('department_id', deptId);

      if (usersError) {
        console.error('⚠️ [Leader Dashboard] Error loading department users:', usersError);
      } else {
        const userIds = deptUsers?.map(u => u.user_id) || [];
        
        if (userIds.length > 0) {
          const { data: scansData, error: scansError } = await supabase
            .from('biometric_measurements')
            .select(`
              user_id,
              ai_stress,
              ai_fatigue,
              ai_recovery,
              wellness_index_score,
              created_at,
              user_profiles!inner(full_name)
            `)
            .in('user_id', userIds)
            .order('created_at', { ascending: false })
            .limit(10);

          if (scansError) {
            console.error('⚠️ [Leader Dashboard] Error loading scans:', scansError);
          } else {
            const formattedScans = scansData?.map(scan => ({
              user_id: scan.user_id,
              full_name: (scan.user_profiles as any)?.full_name || 'Unknown',
              ai_stress: scan.ai_stress || 0,
              ai_fatigue: scan.ai_fatigue || 0,
              ai_recovery: scan.ai_recovery || 0,
              wellness_index_score: scan.wellness_index_score || 0,
              created_at: scan.created_at
            })) || [];
            
            setLatestScans(formattedScans);
            console.log('✅ [Leader Dashboard] Scans loaded:', formattedScans.length);
            await logActivity('scans_loaded', { count: formattedScans.length }, 'info');
          }
        }
      }

      await logActivity('dashboard_load_complete', { dashboard: 'leader' }, 'info');

    } catch (err: any) {
      const errorMsg = err?.message || 'Error loading dashboard data';
      console.error('❌ [Leader Dashboard] Error:', errorMsg);
      setError(errorMsg);
      toast.error(errorMsg);
      await logActivity('dashboard_load_error', { error: errorMsg }, 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleRefresh = () => {
    console.log('🔄 [Leader Dashboard] Refreshing data...');
    setRefreshing(true);
    loadDashboardData();
  };

  const getFlagColor = (flag: string) => {
    switch (flag?.toLowerCase()) {
      case 'rojo': return 'destructive';
      case 'amarillo': return 'warning';
      case 'verde': return 'default';
      default: return 'secondary';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk?.toUpperCase()) {
      case 'CRÍTICO': return 'destructive';
      case 'ALTO': return 'destructive';
      case 'MODERADO': return 'warning';
      case 'BAJO': return 'default';
      default: return 'secondary';
    }
  };

  const getTrendIcon = (trend: string) => {
    if (trend?.includes('mejora')) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend?.includes('deterioro')) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Activity className="h-4 w-4 text-blue-500" />;
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
          <h1 className="text-3xl font-bold">Dashboard del Líder</h1>
          <p className="text-muted-foreground">
            {metrics?.department_name || 'Tu Departamento'} - Resumen de Bienestar
          </p>
        </div>
        <Button onClick={handleRefresh} disabled={refreshing} variant="outline">
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Colaboradores</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.employee_count || 0}</div>
            <p className="text-xs text-muted-foreground">
              En tu departamento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nivel de Estrés</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {insights?.avg_stress?.toFixed(1) || metrics?.avg_stress?.toFixed(1) || 'N/A'}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={getFlagColor(insights?.stress_level_flag || 'verde')}>
                {insights?.stress_level_flag || 'Normal'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Índice de Bienestar</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {insights?.wellness_index?.toFixed(1) || metrics?.avg_wellness_index?.toFixed(1) || 'N/A'}
            </div>
            <div className="flex items-center gap-1 mt-1">
              {getTrendIcon(insights?.wellness_trend || '')}
              <span className="text-xs text-muted-foreground">
                {insights?.wellness_trend || 'estable'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Riesgo de Burnout</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {insights?.burnout_risk_score?.toFixed(1) || 'N/A'}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={getFlagColor(insights?.burnout_risk_flag || 'verde')}>
                {insights?.burnout_risk_flag || 'Bajo'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Battery className="h-4 w-4" />
              Fatiga Promedio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {insights?.avg_fatigue?.toFixed(1) || metrics?.avg_fatigue?.toFixed(1) || 'N/A'}
            </div>
            <Progress 
              value={parseFloat(insights?.avg_fatigue || metrics?.avg_fatigue || '0')} 
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="h-4 w-4" />
              Carga Cognitiva
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {insights?.avg_cognitive_load?.toFixed(1) || metrics?.avg_cognitive_load?.toFixed(1) || 'N/A'}
            </div>
            <Progress 
              value={parseFloat(insights?.avg_cognitive_load || metrics?.avg_cognitive_load || '0')} 
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Recuperación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {insights?.avg_recovery?.toFixed(1) || metrics?.avg_recovery?.toFixed(1) || 'N/A'}
            </div>
            <Progress 
              value={parseFloat(insights?.avg_recovery || metrics?.avg_recovery || '0')} 
              className="mt-2"
            />
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="insights" className="space-y-4">
        <TabsList>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="at-risk">En Riesgo ({employeesAtRisk.length})</TabsTrigger>
          <TabsTrigger value="scans">Últimos Scans</TabsTrigger>
          <TabsTrigger value="programs">Programas ({loyaltyPrograms.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Análisis del Departamento</CardTitle>
              <CardDescription>Insights generados automáticamente</CardDescription>
            </CardHeader>
            <CardContent>
              {insights ? (
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm">{insights.insight_summary}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Percentil en Organización</p>
                      <p className="text-2xl font-bold">{insights.percentile_in_org}%</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Brecha de Edad Biológica</p>
                      <p className="text-2xl font-bold">{insights.avg_bio_age_gap?.toFixed(1)} años</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">No hay insights disponibles</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="at-risk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Colaboradores en Riesgo</CardTitle>
              <CardDescription>Requieren atención o seguimiento</CardDescription>
            </CardHeader>
            <CardContent>
              {employeesAtRisk.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No hay colaboradores en riesgo</p>
              ) : (
                <div className="space-y-4">
                  {employeesAtRisk.map((employee) => (
                    <div key={employee.user_id} className="flex items-center justify-between border-b pb-4 last:border-0">
                      <div className="space-y-1">
                        <p className="font-medium">{employee.full_name}</p>
                        <div className="flex gap-2 text-sm text-muted-foreground">
                          <span>Estrés: {employee.ai_stress?.toFixed(1)}</span>
                          <span>•</span>
                          <span>Fatiga: {employee.ai_fatigue?.toFixed(1)}</span>
                          <span>•</span>
                          <span>Bienestar: {employee.wellness_index_score?.toFixed(1)}</span>
                        </div>
                      </div>
                      <Badge variant={getRiskColor(employee.nivel_riesgo)}>
                        {employee.nivel_riesgo}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scans" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Últimos Escaneos</CardTitle>
              <CardDescription>Mediciones recientes del equipo</CardDescription>
            </CardHeader>
            <CardContent>
              {latestScans.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No hay escaneos recientes</p>
              ) : (
                <div className="space-y-4">
                  {latestScans.map((scan, idx) => (
                    <div key={idx} className="flex items-center justify-between border-b pb-4 last:border-0">
                      <div className="space-y-1">
                        <p className="font-medium">{scan.full_name}</p>
                        <p className="text-sm text-muted-foreground">
                          <Calendar className="inline h-3 w-3 mr-1" />
                          {new Date(scan.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="text-sm">Estrés: {scan.ai_stress?.toFixed(1)}</p>
                        <p className="text-sm text-muted-foreground">
                          Bienestar: {scan.wellness_index_score?.toFixed(1)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="programs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Programas de Lealtad</CardTitle>
              <CardDescription>Beneficios disponibles para tu equipo</CardDescription>
            </CardHeader>
            <CardContent>
              {loyaltyPrograms.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No hay programas disponibles</p>
              ) : (
                <div className="space-y-4">
                  {loyaltyPrograms.map((program) => (
                    <div key={program.benefit_id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <Gift className="h-4 w-4 text-primary" />
                            <h4 className="font-semibold">{program.benefit_title}</h4>
                          </div>
                          <p className="text-sm text-muted-foreground">{program.benefit_description}</p>
                          <div className="flex gap-2">
                            <Badge variant="outline">{program.partner_name}</Badge>
                            {program.indicator_code && (
                              <Badge variant="secondary">{program.indicator_code}</Badge>
                            )}
                          </div>
                        </div>
                        {program.link_url && (
                          <Button size="sm" variant="outline" asChild>
                            <a href={program.link_url} target="_blank" rel="noopener noreferrer">
                              Ver más
                            </a>
                          </Button>
                        )}
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