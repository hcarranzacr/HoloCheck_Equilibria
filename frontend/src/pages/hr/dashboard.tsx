// @ts-nocheck
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { MetricCard, InsightPanel, TrendChart, ConsumptionWidget } from '@/components/dashboard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Building, Users, TrendingUp, AlertCircle, Activity, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';

interface HRDashboardData {
  organization_id: string;
  total_employees: number;
  organization_insights: any;
  department_insights: Array<{
    department_name: string;
    department_id: string;
    insights: any;
  }>;
  departments_count: number;
  usage_summary: any[];
}

export default function HRDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<HRDashboardData | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    const timestamp = new Date().toISOString();
    console.log(`🎯 [HR DASHBOARD] START - Loading data at ${timestamp}`);
    
    try {
      setLoading(true);
      setError(null);
      
      console.log(`🔑 [HR DASHBOARD] Checking authentication...`);
      const session = await apiClient.auth.getSession();
      console.log(`🔐 [HR DASHBOARD] Session exists: ${!!session}, Token length: ${session?.access_token?.length || 0}`);
      
      if (!session?.access_token) {
        throw new Error('No estás autenticado. Por favor, inicia sesión nuevamente.');
      }

      console.log(`📡 [HR DASHBOARD] Calling API...`);
      const response = await apiClient.dashboards.hr();
      
      console.log(`✅ [HR DASHBOARD] Response received`);
      console.log(`📊 [HR DASHBOARD] Data keys:`, Object.keys(response || {}));
      console.log(`📋 [HR DASHBOARD] Full data:`, response);
      
      setData(response);
      console.log(`✅ [HR DASHBOARD] SUCCESS`);
      
    } catch (err: any) {
      console.error(`❌ [HR DASHBOARD] ERROR`);
      console.error(`📛 [HR DASHBOARD] Error:`, err);
      
      const errorMsg = err?.message || err?.response?.data?.detail || err?.data?.detail || 'Error al cargar datos del dashboard';
      console.error(`📛 [HR DASHBOARD] Error message: ${errorMsg}`);
      
      setError(errorMsg);
      toast.error('Error al cargar dashboard');
    } finally {
      setLoading(false);
      console.log(`🏁 [HR DASHBOARD] Finished`);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-64 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={fetchDashboardData} className="mt-4">
          Reintentar
        </Button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertDescription>No hay datos disponibles para la organización</AlertDescription>
        </Alert>
      </div>
    );
  }

  const orgInsights = data.organization_insights || {};
  const currentUsage = data.usage_summary?.[0] || {};
  const departmentInsightsList = (data.department_insights || []);
  const usageTrendData = (data.usage_summary || []);

  const insightsPanelData = departmentInsightsList.map((dept, index) => ({
    id: `dept-${index}`,
    type: dept.insights?.burnout_risk_score > 70 ? 'danger' : 
          dept.insights?.burnout_risk_score > 40 ? 'warning' : 'success' as any,
    title: dept.department_name || 'Unknown Department',
    description: dept.insights?.insight_summary || 'Análisis del departamento',
    metric: 'Empleados',
    value: dept.insights?.employee_count || 0,
    department: dept.department_name || 'Unknown'
  }));

  const trendChartData = usageTrendData.map(usage => ({
    date: usage.month || '',
    value: usage.total_scans || 0
  })).reverse();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard de Recursos Humanos</h1>
          <p className="text-muted-foreground">
            Vista consolidada de la organización
          </p>
        </div>
        <Button size="lg">
          <BarChart3 className="mr-2 h-5 w-5" />
          Generar Reporte
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Empleados"
          value={data.total_employees || 0}
          icon={Users}
          status="neutral"
          description="Colaboradores activos"
        />
        
        <MetricCard
          title="Departamentos"
          value={data.departments_count || 0}
          icon={Building}
          status="neutral"
          description="Áreas organizacionales"
        />
        
        <MetricCard
          title="Índice de Estrés"
          value={orgInsights.stress_index?.toFixed(1) || '0'}
          icon={Activity}
          status={orgInsights.stress_index > 60 ? 'danger' : orgInsights.stress_index > 40 ? 'warning' : 'success'}
          description="Nivel organizacional"
        />
        
        <MetricCard
          title="Riesgo de Burnout"
          value={orgInsights.burnout_risk?.toFixed(1) || '0'}
          unit="%"
          icon={AlertCircle}
          status={orgInsights.burnout_risk > 70 ? 'danger' : orgInsights.burnout_risk > 40 ? 'warning' : 'success'}
          description="Evaluación global"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ConsumptionWidget
          title="Escaneos del Mes"
          description="Consumo mensual de escaneos biométricos"
          used={currentUsage.total_scans || 0}
          limit={currentUsage.total_scans ? currentUsage.total_scans * 1.5 : 1000}
          type="scans"
        />
        
        <ConsumptionWidget
          title="Prompts Utilizados"
          description="Consultas AI realizadas"
          used={currentUsage.total_prompts_used || 0}
          limit={currentUsage.total_prompts_used ? currentUsage.total_prompts_used * 1.5 : 500}
          type="prompts"
        />
        
        <ConsumptionWidget
          title="Tokens AI Consumidos"
          description="Uso de recursos de inteligencia artificial"
          used={currentUsage.total_ai_tokens_used || 0}
          limit={currentUsage.total_ai_tokens_used ? currentUsage.total_ai_tokens_used * 1.5 : 100000}
          type="tokens"
        />
      </div>

      {insightsPanelData.length > 0 && (
        <InsightPanel
          title="Insights por Departamento"
          description="Análisis comparativo de todas las áreas"
          insights={insightsPanelData}
          maxInsights={10}
        />
      )}

      {trendChartData.length > 1 && (
        <TrendChart
          title="Tendencia de Escaneos Mensuales"
          description="Evolución del uso de escaneos biométricos"
          data={trendChartData}
          color="#0ea5e9"
          height={300}
        />
      )}

      {departmentInsightsList.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resumen por Departamento</CardTitle>
            <CardDescription>Métricas clave de cada área organizacional</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {departmentInsightsList.map((dept, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-lg">{dept.department_name || 'Unknown Department'}</h3>
                    <span className="text-sm text-slate-500">
                      {dept.insights?.employee_count || 0} empleados
                    </span>
                  </div>
                  
                  {dept.insights && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-slate-500">Estrés Promedio</p>
                        <p className="font-semibold text-lg">
                          {dept.insights.avg_stress?.toFixed(1) || 'N/A'}%
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500">Fatiga Promedio</p>
                        <p className="font-semibold text-lg">
                          {dept.insights.avg_fatigue?.toFixed(1) || 'N/A'}%
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500">Riesgo Burnout</p>
                        <p className="font-semibold text-lg">
                          {dept.insights.burnout_risk_score?.toFixed(1) || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500">Índice Bienestar</p>
                        <p className="font-semibold text-lg">
                          {dept.insights.wellness_index?.toFixed(1) || 'N/A'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {departmentInsightsList.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Building className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <p className="text-slate-500">No hay datos de departamentos disponibles</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}