import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import BiometricGaugeWithInfo from '@/components/dashboard/BiometricGaugeWithInfo';
import {
  Building2,
  Users,
  Activity,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Heart,
  Brain,
  RefreshCw,
  Gift,
  Shield,
  Sparkles,
  Battery,
  Target,
  Zap,
  Moon,
  Calendar
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface OrganizationInsight {
  id: string;
  organization_id: string;
  analysis_date: string;
  total_employees: number;
  stress_index: number;
  burnout_risk: number;
  sleep_index: number;
  actuarial_risk: number;
  claim_risk: number;
  avg_fatigue: number;
  avg_cognitive_load: number;
  avg_recovery: number;
  avg_bio_age_gap: number;
  wellness_index: number;
  insight_summary: string;
  stress_level_flag: string;
  burnout_risk_flag: string;
  wellness_trend: string;
  risk_score: number;
  percentile_in_org: number;
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
  department_id: string;
  ai_stress: number;
  ai_fatigue: number;
  wellness_index_score: number;
  nivel_riesgo: string;
  created_at: string;
}

interface DepartmentInsight {
  id: string;
  department_id: string;
  insight_summary: string;
  wellness_trend: string;
  stress_level_flag: string;
  created_at: string;
  department_name?: string;
}

interface LoyaltyProgram {
  benefit_id: string;
  benefit_title: string;
  benefit_description: string;
  partner_name: string;
  partner_sector: string;
  indicator_code: string;
  relevance_level: string;
  tags: string[];
  link_url: string;
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
    console.log(`${emoji} [HR Dashboard] ${action}:`, details);
  } catch (error) {
    console.error('❌ [HR Dashboard] Error logging activity:', error);
  }
}

export default function HRDashboard() {
  const [orgInsight, setOrgInsight] = useState<OrganizationInsight | null>(null);
  const [deptMetrics, setDeptMetrics] = useState<DepartmentMetrics[]>([]);
  const [employeesAtRisk, setEmployeesAtRisk] = useState<EmployeeAtRisk[]>([]);
  const [deptInsights, setDeptInsights] = useState<DepartmentInsight[]>([]);
  const [loyaltyPrograms, setLoyaltyPrograms] = useState<LoyaltyProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedRiskLevel, setSelectedRiskLevel] = useState<string>('all');

  const loadDashboardData = async () => {
    try {
      setError(null);
      console.log('📊 [HR Dashboard] Loading data...');
      await logActivity('dashboard_load_start', { dashboard: 'hr' }, 'info');

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        console.error('❌ [HR Dashboard] Error loading profile:', profileError);
        await logActivity('profile_load_error', { error: profileError.message }, 'error');
        throw new Error('Error loading user profile');
      }

      const orgId = profile.organization_id;
      console.log('✅ [HR Dashboard] User organization:', orgId);

      // Load organization insights
      const { data: insightData, error: insightError } = await supabase
        .from('organization_insights')
        .select('*')
        .eq('organization_id', orgId)
        .order('analysis_date', { ascending: false })
        .limit(1)
        .single();

      if (insightError) {
        console.error('⚠️ [HR Dashboard] No organization insights found:', insightError);
        await logActivity('org_insight_load_warning', { error: insightError.message }, 'warning');
      } else {
        setOrgInsight(insightData);
        console.log('✅ [HR Dashboard] Organization insight loaded:', insightData);
        await logActivity('org_insight_loaded', { organization_id: orgId }, 'info');
      }

      // Load department metrics - need to get departments first
      const { data: departments, error: deptsError } = await supabase
        .from('departments')
        .select('id')
        .eq('organization_id', orgId);

      if (deptsError) {
        console.error('⚠️ [HR Dashboard] Error loading departments:', deptsError);
      } else {
        const deptIds = departments?.map(d => d.id) || [];
        
        if (deptIds.length > 0) {
          const { data: metricsData, error: metricsError } = await supabase
            .from('vw_current_department_metrics')
            .select('*')
            .in('department_id', deptIds)
            .order('avg_wellness_index', { ascending: false });

          if (metricsError) {
            console.error('⚠️ [HR Dashboard] Error loading department metrics:', metricsError);
          } else {
            setDeptMetrics(metricsData || []);
            console.log('✅ [HR Dashboard] Department metrics loaded:', metricsData?.length);
            await logActivity('dept_metrics_loaded', { count: metricsData?.length }, 'info');
          }
        }
      }

      // Load employees at risk (organization-wide)
      const { data: riskData, error: riskError } = await supabase
        .from('vw_employees_at_risk')
        .select('*')
        .eq('organization_id', orgId)
        .order('ai_stress', { ascending: false });

      if (riskError) {
        console.error('⚠️ [HR Dashboard] Error loading at-risk employees:', riskError);
        await logActivity('at_risk_load_warning', { error: riskError.message }, 'warning');
      } else {
        setEmployeesAtRisk(riskData || []);
        console.log('✅ [HR Dashboard] At-risk employees loaded:', riskData?.length);
        await logActivity('at_risk_loaded', { count: riskData?.length }, 'info');
      }

      // Load department insights
      if (departments && departments.length > 0) {
        const deptIds = departments.map(d => d.id);
        
        const { data: insightsData, error: insightsError } = await supabase
          .from('department_insights')
          .select(`
            id,
            department_id,
            insight_summary,
            wellness_trend,
            stress_level_flag,
            created_at,
            departments!inner(name)
          `)
          .in('department_id', deptIds)
          .order('created_at', { ascending: false })
          .limit(6);

        if (insightsError) {
          console.error('⚠️ [HR Dashboard] Error loading department insights:', insightsError);
        } else {
          const formattedInsights = insightsData?.map(insight => ({
            ...insight,
            department_name: (insight.departments as any)?.name || 'Unknown'
          })) || [];
          
          setDeptInsights(formattedInsights);
          console.log('✅ [HR Dashboard] Department insights loaded:', formattedInsights.length);
          await logActivity('dept_insights_loaded', { count: formattedInsights.length }, 'info');
        }
      }

      // Load loyalty programs
      const { data: programsData, error: programsError } = await supabase
        .from('vw_active_partner_programs_by_org')
        .select('*')
        .eq('organization_id', orgId)
        .eq('benefit_active', true)
        .order('relevance_level', { ascending: false });

      if (programsError) {
        console.error('⚠️ [HR Dashboard] Error loading loyalty programs:', programsError);
        await logActivity('programs_load_warning', { error: programsError.message }, 'warning');
      } else {
        setLoyaltyPrograms(programsData || []);
        console.log('✅ [HR Dashboard] Loyalty programs loaded:', programsData?.length);
        await logActivity('programs_loaded', { count: programsData?.length }, 'info');
      }

      await logActivity('dashboard_load_complete', { dashboard: 'hr' }, 'info');

    } catch (err: any) {
      const errorMsg = err?.message || 'Error loading dashboard data';
      console.error('❌ [HR Dashboard] Error:', errorMsg);
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
    console.log('🔄 [HR Dashboard] Refreshing data...');
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

  const getWellnessLabel = (score: number) => {
    if (score >= 80) return { label: 'Excelente', color: 'bg-green-500' };
    if (score >= 60) return { label: 'Bueno', color: 'bg-blue-500' };
    if (score >= 40) return { label: 'Regular', color: 'bg-yellow-500' };
    return { label: 'Necesita Atención', color: 'bg-red-500' };
  };

  const filteredEmployees = employeesAtRisk.filter(emp => {
    if (selectedDepartment !== 'all' && emp.department_id !== selectedDepartment) return false;
    if (selectedRiskLevel !== 'all' && emp.nivel_riesgo !== selectedRiskLevel) return false;
    return true;
  });

  const riskCounts = {
    critico: employeesAtRisk.filter(e => e.nivel_riesgo === 'CRÍTICO').length,
    alto: employeesAtRisk.filter(e => e.nivel_riesgo === 'ALTO').length,
    moderado: employeesAtRisk.filter(e => e.nivel_riesgo === 'MODERADO').length,
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-32 rounded-full mx-auto" />
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

  const wellnessScore = orgInsight?.wellness_index || 0;
  const wellnessInfo = getWellnessLabel(wellnessScore);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header with Gradient */}
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 p-8 text-white shadow-xl">
        <div className="absolute inset-0 bg-grid-white/10"></div>
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Dashboard de RRHH</h1>
              <p className="text-blue-100 flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Vista Organizacional - {orgInsight?.total_employees || 0} Colaboradores
              </p>
            </div>
            <Button onClick={handleRefresh} disabled={refreshing} variant="secondary" size="sm">
              <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
          </div>

          {/* Wellness Score - Large Display */}
          {orgInsight && (
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-6xl font-bold mb-2">{wellnessScore.toFixed(1)}</div>
                <div className="text-sm text-blue-100">Índice de Bienestar Organizacional</div>
              </div>
              <div className="flex flex-col gap-2">
                <Badge className={`${wellnessInfo.color} text-white text-lg px-4 py-2`}>
                  {wellnessInfo.label}
                </Badge>
                {orgInsight.wellness_trend && (
                  <div className="flex items-center gap-2 text-sm">
                    {getTrendIcon(orgInsight.wellness_trend)}
                    <span className="text-blue-100">{orgInsight.wellness_trend}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Organization Biometric Gauges */}
      {orgInsight && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <BiometricGaugeWithInfo
            title="Índice de Bienestar"
            value={orgInsight.wellness_index || 0}
            indicatorCode="wellness_index_score"
            icon={<Heart className="h-5 w-5" />}
          />
          
          <BiometricGaugeWithInfo
            title="Nivel de Estrés"
            value={orgInsight.stress_index || 0}
            indicatorCode="ai_stress"
            icon={<Brain className="h-5 w-5" />}
          />

          <BiometricGaugeWithInfo
            title="Índice de Fatiga"
            value={orgInsight.avg_fatigue || 0}
            indicatorCode="ai_fatigue"
            icon={<Battery className="h-5 w-5" />}
          />

          <BiometricGaugeWithInfo
            title="Carga Cognitiva"
            value={orgInsight.avg_cognitive_load || 0}
            indicatorCode="ai_cognitive_load"
            icon={<Target className="h-5 w-5" />}
          />

          <BiometricGaugeWithInfo
            title="Capacidad de Recuperación"
            value={orgInsight.avg_recovery || 0}
            indicatorCode="ai_recovery"
            icon={<Zap className="h-5 w-5" />}
          />

          <BiometricGaugeWithInfo
            title="Riesgo de Burnout"
            value={(orgInsight.burnout_risk || 0) * 10}
            indicatorCode="mental_stress_index"
            icon={<Shield className="h-5 w-5" />}
          />

          <BiometricGaugeWithInfo
            title="Índice de Sueño"
            value={orgInsight.sleep_index || 0}
            indicatorCode="sleep_quality"
            icon={<Moon className="h-5 w-5" />}
          />

          <BiometricGaugeWithInfo
            title="Brecha Edad Biológica"
            value={orgInsight.avg_bio_age_gap || 0}
            indicatorCode="biological_age"
            icon={<Calendar className="h-5 w-5" />}
          />
        </div>
      )}

      {/* Stats Cards */}
      {orgInsight && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                Total Colaboradores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{orgInsight.total_employees}</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                Riesgo Actuarial
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{orgInsight.actuarial_risk?.toFixed(1)}</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Shield className="h-4 w-4 text-red-600" />
                Riesgo de Reclamaciones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{orgInsight.claim_risk?.toFixed(1)}%</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="h-4 w-4 text-purple-600" />
                Puntuación de Riesgo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{orgInsight.risk_score?.toFixed(1)}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Insights Card */}
      {orgInsight?.insight_summary && (
        <Card className="border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              Análisis Organizacional
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-lg">{orgInsight.insight_summary}</p>
            <div className="flex flex-wrap gap-3">
              {orgInsight.stress_level_flag && (
                <Badge variant={getFlagColor(orgInsight.stress_level_flag)} className="text-sm">
                  Estrés: {orgInsight.stress_level_flag}
                </Badge>
              )}
              {orgInsight.burnout_risk_flag && (
                <Badge variant={getFlagColor(orgInsight.burnout_risk_flag)} className="text-sm">
                  Burnout: {orgInsight.burnout_risk_flag}
                </Badge>
              )}
              {orgInsight.percentile_in_org && (
                <Badge variant="outline" className="text-sm">
                  Percentil: {orgInsight.percentile_in_org}%
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Risk Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              Riesgo Crítico
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{riskCounts.critico}</div>
            <p className="text-xs text-muted-foreground">Requieren atención inmediata</p>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Shield className="h-4 w-4 text-orange-600" />
              Riesgo Alto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{riskCounts.alto}</div>
            <p className="text-xs text-muted-foreground">Necesitan seguimiento</p>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="h-4 w-4 text-yellow-600" />
              Riesgo Moderado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{riskCounts.moderado}</div>
            <p className="text-xs text-muted-foreground">En observación</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="departments" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="departments">
            <Building2 className="h-4 w-4 mr-2" />
            Departamentos ({deptMetrics.length})
          </TabsTrigger>
          <TabsTrigger value="at-risk">
            <AlertTriangle className="h-4 w-4 mr-2" />
            En Riesgo ({employeesAtRisk.length})
          </TabsTrigger>
          <TabsTrigger value="insights">
            <Sparkles className="h-4 w-4 mr-2" />
            Insights ({deptInsights.length})
          </TabsTrigger>
          <TabsTrigger value="programs">
            <Gift className="h-4 w-4 mr-2" />
            Programas ({loyaltyPrograms.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="departments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Comparativa por Departamentos</CardTitle>
              <CardDescription>Métricas de salud y bienestar por área</CardDescription>
            </CardHeader>
            <CardContent>
              {deptMetrics.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No hay datos de departamentos</p>
              ) : (
                <div className="space-y-4">
                  {deptMetrics.map((dept) => (
                    <div key={dept.department_id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-lg">{dept.department_name}</h4>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {dept.employee_count} colaboradores
                          </p>
                        </div>
                        <Badge variant="outline" className="text-base px-3 py-1">
                          Bienestar: {dept.avg_wellness_index?.toFixed(1)}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Estrés</p>
                          <div className="flex items-center gap-2">
                            <Progress value={parseFloat(dept.avg_stress || '0')} className="flex-1 h-2" />
                            <span className="text-sm font-medium">{dept.avg_stress?.toFixed(1)}</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Fatiga</p>
                          <div className="flex items-center gap-2">
                            <Progress value={parseFloat(dept.avg_fatigue || '0')} className="flex-1 h-2" />
                            <span className="text-sm font-medium">{dept.avg_fatigue?.toFixed(1)}</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Recuperación</p>
                          <div className="flex items-center gap-2">
                            <Progress value={parseFloat(dept.avg_recovery || '0')} className="flex-1 h-2" />
                            <span className="text-sm font-medium">{dept.avg_recovery?.toFixed(1)}</span>
                          </div>
                        </div>
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
              <CardTitle>Colaboradores en Riesgo</CardTitle>
              <CardDescription>
                <div className="flex gap-4 mt-2">
                  <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="border rounded px-3 py-2 text-sm"
                  >
                    <option value="all">Todos los departamentos</option>
                    {deptMetrics.map(dept => (
                      <option key={dept.department_id} value={dept.department_id}>
                        {dept.department_name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedRiskLevel}
                    onChange={(e) => setSelectedRiskLevel(e.target.value)}
                    className="border rounded px-3 py-2 text-sm"
                  >
                    <option value="all">Todos los niveles</option>
                    <option value="CRÍTICO">Crítico</option>
                    <option value="ALTO">Alto</option>
                    <option value="MODERADO">Moderado</option>
                  </select>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredEmployees.length === 0 ? (
                <div className="text-center py-12">
                  <Shield className="h-12 w-12 mx-auto text-green-500 mb-4" />
                  <p className="text-lg font-medium text-green-600">¡Excelente!</p>
                  <p className="text-muted-foreground">No hay colaboradores en riesgo con los filtros seleccionados</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredEmployees.map((employee) => (
                    <div key={employee.user_id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="space-y-2 flex-1">
                        <p className="font-medium">{employee.full_name}</p>
                        <p className="text-sm text-muted-foreground">{employee.email}</p>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Estrés</p>
                            <Progress value={employee.ai_stress} className="h-2" />
                            <p className="text-xs font-medium mt-1">{employee.ai_stress?.toFixed(1)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Fatiga</p>
                            <Progress value={employee.ai_fatigue} className="h-2" />
                            <p className="text-xs font-medium mt-1">{employee.ai_fatigue?.toFixed(1)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Bienestar</p>
                            <Progress value={employee.wellness_index_score} className="h-2" />
                            <p className="text-xs font-medium mt-1">{employee.wellness_index_score?.toFixed(1)}</p>
                          </div>
                        </div>
                      </div>
                      <Badge variant={getRiskColor(employee.nivel_riesgo)} className="ml-4">
                        {employee.nivel_riesgo}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {deptInsights.length === 0 ? (
              <Card className="col-span-2">
                <CardContent className="py-12 text-center">
                  <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No hay insights disponibles</p>
                </CardContent>
              </Card>
            ) : (
              deptInsights.map((insight) => (
                <Card key={insight.id} className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-purple-600" />
                      {insight.department_name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm">{insight.insight_summary}</p>
                    <div className="flex gap-2">
                      <Badge variant={getFlagColor(insight.stress_level_flag)}>
                        {insight.stress_level_flag}
                      </Badge>
                      <div className="flex items-center gap-1">
                        {getTrendIcon(insight.wellness_trend)}
                        <span className="text-xs">{insight.wellness_trend}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="programs" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {loyaltyPrograms.length === 0 ? (
              <Card className="col-span-3">
                <CardContent className="py-12 text-center">
                  <Gift className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No hay programas activos</p>
                </CardContent>
              </Card>
            ) : (
              loyaltyPrograms.map((program) => (
                <Card key={program.benefit_id} className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Gift className="h-4 w-4 text-purple-600" />
                      {program.benefit_title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {program.benefit_description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="text-xs">{program.partner_name}</Badge>
                      <Badge variant="secondary" className="text-xs">{program.partner_sector}</Badge>
                      {program.indicator_code && (
                        <Badge variant="default" className="text-xs">{program.indicator_code}</Badge>
                      )}
                      {program.relevance_level && (
                        <Badge className={
                          program.relevance_level === 'alto' ? 'bg-green-500' :
                          program.relevance_level === 'moderado' ? 'bg-yellow-500' :
                          'bg-blue-500'
                        }>
                          {program.relevance_level}
                        </Badge>
                      )}
                    </div>
                    {program.link_url && (
                      <Button size="sm" variant="outline" className="w-full" asChild>
                        <a href={program.link_url} target="_blank" rel="noopener noreferrer">
                          Ver detalles
                        </a>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}