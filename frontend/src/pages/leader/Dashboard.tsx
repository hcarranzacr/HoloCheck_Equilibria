import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import BiometricGaugeWithInfo from '@/components/dashboard/BiometricGaugeWithInfo';
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
  Target,
  Zap,
  Shield,
  Sparkles,
  Clock
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

interface TeamEvolutionData {
  analysis_period: string;
  month_start: string;
  wellness_index: number;
  avg_stress: number;
  avg_fatigue: number;
  avg_recovery: number;
  avg_cognitive_load: number;
  burnout_risk_score: number;
  employees_scanned: number;
  total_scans: number;
}

export default function LeaderDashboard() {
  const [insights, setInsights] = useState<DepartmentInsight | null>(null);
  const [metrics, setMetrics] = useState<DepartmentMetrics | null>(null);
  const [employeesAtRisk, setEmployeesAtRisk] = useState<EmployeeAtRisk[]>([]);
  const [loyaltyPrograms, setLoyaltyPrograms] = useState<LoyaltyProgram[]>([]);
  const [latestScans, setLatestScans] = useState<LatestScan[]>([]);
  const [evolutionData, setEvolutionData] = useState<TeamEvolutionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingEvolution, setLoadingEvolution] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [userDepartmentId, setUserDepartmentId] = useState<string | null>(null);

  const loadDashboardData = async () => {
    try {
      setError(null);
      console.log('📊 [Leader Dashboard] Loading data...');

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
        throw new Error('Error loading user profile');
      }

      const deptId = profile.department_id;
      const orgId = profile.organization_id;
      setUserDepartmentId(deptId);

      // Load department insights
      const { data: insightsData, error: insightsError } = await supabase
        .from('department_insights')
        .select('*')
        .eq('department_id', deptId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!insightsError) {
        setInsights(insightsData);
      }

      // Load department metrics
      const { data: metricsData, error: metricsError } = await supabase
        .from('vw_current_department_metrics')
        .select('*')
        .eq('department_id', deptId)
        .single();

      if (!metricsError) {
        setMetrics(metricsData);
      }

      // Load employees at risk from department
      const { data: riskData, error: riskError } = await supabase
        .from('vw_employees_at_risk')
        .select('*')
        .eq('department_id', deptId)
        .order('ai_stress', { ascending: false });

      if (!riskError) {
        setEmployeesAtRisk(riskData || []);
      }

      // Load loyalty programs relevant to department
      const { data: programsData, error: programsError } = await supabase
        .from('vw_active_partner_programs_by_org')
        .select('*')
        .eq('organization_id', orgId)
        .limit(5);

      if (!programsError) {
        setLoyaltyPrograms(programsData || []);
      }

      // Load latest scans from department
      const { data: deptUsers, error: usersError } = await supabase
        .from('user_profiles')
        .select('user_id')
        .eq('department_id', deptId);

      if (!usersError) {
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

          if (!scansError) {
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
          }
        }
      }

      console.log('✅ [Leader Dashboard] Data loaded');
      setLastUpdated(new Date());

    } catch (err: any) {
      const errorMsg = err?.message || 'Error loading dashboard data';
      console.error('❌ [Leader Dashboard] Error:', errorMsg);
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadEvolutionData = async () => {
    try {
      console.log('📈 [Leader Dashboard] Loading team evolution data...');
      setLoadingEvolution(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch('/api/v1/dashboards/leader/team-evolution?months=6', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch team evolution data');
      }

      const result = await response.json();
      setEvolutionData(result.data || []);
      console.log('✅ [Leader Dashboard] Evolution data loaded:', result.data?.length || 0, 'points');
    } catch (error) {
      console.error('Error loading team evolution data:', error);
    } finally {
      setLoadingEvolution(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
    loadEvolutionData();
  }, []);

  const handleRefresh = () => {
    console.log('🔄 [Leader Dashboard] Manual refresh triggered');
    setRefreshing(true);
    loadDashboardData();
    loadEvolutionData();
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

  const wellnessScore = insights?.wellness_index || metrics?.avg_wellness_index || 0;
  const wellnessInfo = getWellnessLabel(wellnessScore);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header with Gradient */}
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 p-8 text-white shadow-xl">
        <div className="absolute inset-0 bg-grid-white/10"></div>
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Dashboard del Líder</h1>
              <p className="text-blue-100 flex items-center gap-2">
                <Users className="h-4 w-4" />
                {metrics?.department_name || 'Tu Departamento'} - {metrics?.employee_count || 0} Colaboradores
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Button onClick={handleRefresh} disabled={refreshing} variant="secondary" size="sm">
                <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                Actualizar
              </Button>
              {lastUpdated && (
                <div className="flex items-center gap-2 text-sm text-blue-100">
                  <Clock className="h-4 w-4" />
                  <span>{lastUpdated.toLocaleTimeString('es-ES')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Wellness Score - Large Display */}
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-6xl font-bold mb-2">{wellnessScore.toFixed(1)}</div>
              <div className="text-sm text-blue-100">Índice de Bienestar</div>
            </div>
            <div className="flex flex-col gap-2">
              <Badge className={`${wellnessInfo.color} text-white text-lg px-4 py-2`}>
                {wellnessInfo.label}
              </Badge>
              <div className="flex items-center gap-2 text-sm">
                {getTrendIcon(insights?.wellness_trend || '')}
                <span className="text-blue-100">{insights?.wellness_trend || 'estable'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Team Evolution Chart */}
      <Card className="bg-white rounded-xl shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            Evolución del Equipo (Últimos 6 meses)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingEvolution ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : evolutionData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={evolutionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="analysis_period" 
                  tick={{ fontSize: 12 }}
                />
                <YAxis domain={[0, 100]} />
                <Tooltip 
                  formatter={(value: number) => value.toFixed(1)}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="wellness_index" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="Índice de Bienestar"
                  dot={{ fill: '#3b82f6' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="avg_stress" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  name="Estrés Promedio"
                  dot={{ fill: '#ef4444' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="burnout_risk_score" 
                  stroke="#f59e0b" 
                  strokeWidth={2}
                  name="Riesgo de Burnout"
                  dot={{ fill: '#f59e0b' }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No hay suficientes datos para mostrar la evolución</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Biometric Gauges Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <BiometricGaugeWithInfo
          title="Índice de Bienestar"
          value={wellnessScore}
          indicatorCode="wellness_index_score"
          icon={<Heart className="h-5 w-5" />}
        />
        
        <BiometricGaugeWithInfo
          title="Nivel de Estrés"
          value={parseFloat(String(insights?.avg_stress || metrics?.avg_stress || '0'))}
          indicatorCode="ai_stress"
          icon={<Brain className="h-5 w-5" />}
        />

        <BiometricGaugeWithInfo
          title="Índice de Fatiga"
          value={parseFloat(String(insights?.avg_fatigue || metrics?.avg_fatigue || '0'))}
          indicatorCode="ai_fatigue"
          icon={<Battery className="h-5 w-5" />}
        />

        <BiometricGaugeWithInfo
          title="Carga Cognitiva"
          value={parseFloat(String(insights?.avg_cognitive_load || metrics?.avg_cognitive_load || '0'))}
          indicatorCode="ai_cognitive_load"
          icon={<Target className="h-5 w-5" />}
        />

        <BiometricGaugeWithInfo
          title="Capacidad de Recuperación"
          value={parseFloat(String(insights?.avg_recovery || metrics?.avg_recovery || '0'))}
          indicatorCode="ai_recovery"
          icon={<Zap className="h-5 w-5" />}
        />

        <BiometricGaugeWithInfo
          title="Riesgo de Burnout"
          value={parseFloat(String(insights?.burnout_risk_score || '0')) * 10}
          indicatorCode="mental_stress_index"
          icon={<Shield className="h-5 w-5" />}
        />
      </div>

      {/* Insights Card */}
      {insights && (
        <Card className="border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              Análisis del Equipo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-lg">{insights.insight_summary}</p>
            <div className="flex flex-wrap gap-3">
              <Badge variant={getFlagColor(insights.stress_level_flag)} className="text-sm">
                Estrés: {insights.stress_level_flag}
              </Badge>
              <Badge variant={getFlagColor(insights.burnout_risk_flag)} className="text-sm">
                Burnout: {insights.burnout_risk_flag}
              </Badge>
              <Badge variant="outline" className="text-sm">
                Percentil: {insights.percentile_in_org}%
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="at-risk" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="at-risk">
            <AlertTriangle className="h-4 w-4 mr-2" />
            En Riesgo ({employeesAtRisk.length})
          </TabsTrigger>
          <TabsTrigger value="scans">
            <Activity className="h-4 w-4 mr-2" />
            Últimos Scans
          </TabsTrigger>
          <TabsTrigger value="programs">
            <Gift className="h-4 w-4 mr-2" />
            Programas ({loyaltyPrograms.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="at-risk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Colaboradores en Riesgo</CardTitle>
              <CardDescription>Requieren atención o seguimiento</CardDescription>
            </CardHeader>
            <CardContent>
              {employeesAtRisk.length === 0 ? (
                <div className="text-center py-12">
                  <Shield className="h-12 w-12 mx-auto text-green-500 mb-4" />
                  <p className="text-lg font-medium text-green-600">¡Excelente!</p>
                  <p className="text-muted-foreground">No hay colaboradores en riesgo</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {employeesAtRisk.map((employee) => (
                    <div 
                      key={employee.user_id} 
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="space-y-2 flex-1">
                        <p className="font-medium">{employee.full_name}</p>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Estrés</p>
                            <Progress 
                              value={employee.ai_stress} 
                              className="h-2"
                            />
                            <p className="text-xs font-medium mt-1">{employee.ai_stress?.toFixed(1)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Fatiga</p>
                            <Progress 
                              value={employee.ai_fatigue} 
                              className="h-2"
                            />
                            <p className="text-xs font-medium mt-1">{employee.ai_fatigue?.toFixed(1)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Bienestar</p>
                            <Progress 
                              value={employee.wellness_index_score} 
                              className="h-2"
                            />
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
                <div className="space-y-3">
                  {latestScans.map((scan, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="space-y-1">
                        <p className="font-medium">{scan.full_name}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(scan.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-sm font-medium">Bienestar: {scan.wellness_index_score?.toFixed(1)}</p>
                          <p className="text-xs text-muted-foreground">Estrés: {scan.ai_stress?.toFixed(1)}</p>
                        </div>
                        <Badge variant={scan.wellness_index_score >= 70 ? 'default' : 'warning'}>
                          {scan.wellness_index_score >= 70 ? 'Bien' : 'Atención'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="programs" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {loyaltyPrograms.length === 0 ? (
              <Card className="col-span-2">
                <CardContent className="py-12 text-center">
                  <Gift className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No hay programas disponibles</p>
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
                      <Badge variant="outline">{program.partner_name}</Badge>
                      {program.indicator_code && (
                        <Badge variant="secondary">{program.indicator_code}</Badge>
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
                          Ver más detalles
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