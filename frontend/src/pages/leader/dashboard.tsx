import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { MetricCard, TeamMemberCard, InsightPanel, BiometricTable } from '@/components/dashboard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Users, Activity, TrendingUp, AlertCircle, Brain, Battery } from 'lucide-react';
import { toast } from 'sonner';

interface LeaderDashboardData {
  department_id: string;
  team_size: number;
  team_members: any[];
  recent_scans: any[];
  team_metrics: {
    avg_stress: number;
    avg_fatigue: number;
    avg_cognitive_load: number;
    avg_recovery: number;
    avg_wellness: number;
    total_scans: number;
  };
  department_insights: any;
  total_scans: number;
}

export default function LeaderDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<LeaderDashboardData | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.dashboards.leader();
      setData(response);
      console.log('✅ Leader dashboard data loaded:', response);
    } catch (err: any) {
      console.error('❌ Error loading leader dashboard:', err);
      setError(err.response?.data?.detail || err.message || 'Error al cargar datos del dashboard');
      toast.error('Error al cargar dashboard');
    } finally {
      setLoading(false);
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
          <AlertDescription>No hay datos disponibles para tu departamento</AlertDescription>
        </Alert>
      </div>
    );
  }

  const metrics = data.team_metrics || {};
  const insights = data.department_insights;

  // Prepare insights for InsightPanel
  const insightsList = insights ? [
    {
      id: '1',
      type: metrics.avg_stress > 60 ? 'danger' : metrics.avg_stress > 40 ? 'warning' : 'success' as any,
      title: 'Nivel de Estrés del Equipo',
      description: `El promedio de estrés del equipo es ${metrics.avg_stress?.toFixed(1)}%`,
      metric: 'Estrés Promedio',
      value: metrics.avg_stress
    },
    {
      id: '2',
      type: metrics.avg_fatigue > 60 ? 'danger' : metrics.avg_fatigue > 40 ? 'warning' : 'success' as any,
      title: 'Nivel de Fatiga del Equipo',
      description: `El promedio de fatiga del equipo es ${metrics.avg_fatigue?.toFixed(1)}%`,
      metric: 'Fatiga Promedio',
      value: metrics.avg_fatigue
    },
    {
      id: '3',
      type: insights.burnout_risk_score > 70 ? 'danger' : insights.burnout_risk_score > 40 ? 'warning' : 'info' as any,
      title: 'Riesgo de Burnout',
      description: insights.insight_summary || 'Monitoreo continuo del bienestar del equipo',
      metric: 'Score de Riesgo',
      value: insights.burnout_risk_score
    }
  ] : [];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard del Equipo</h1>
          <p className="text-muted-foreground">
            {data.team_size} miembros • {data.total_scans} escaneos totales
          </p>
        </div>
        <Button size="lg">
          <Users className="mr-2 h-5 w-5" />
          Gestionar Equipo
        </Button>
      </div>

      {/* Métricas del equipo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          title="Tamaño del Equipo"
          value={data.team_size}
          icon={Users}
          status="neutral"
          description="Miembros activos"
        />
        
        <MetricCard
          title="Estrés Promedio"
          value={metrics.avg_stress?.toFixed(1) || 0}
          unit="%"
          icon={Brain}
          status={metrics.avg_stress > 60 ? 'danger' : metrics.avg_stress > 40 ? 'warning' : 'success'}
        />
        
        <MetricCard
          title="Fatiga Promedio"
          value={metrics.avg_fatigue?.toFixed(1) || 0}
          unit="%"
          icon={Battery}
          status={metrics.avg_fatigue > 60 ? 'danger' : metrics.avg_fatigue > 40 ? 'warning' : 'success'}
        />
        
        <MetricCard
          title="Recuperación Promedio"
          value={metrics.avg_recovery?.toFixed(1) || 0}
          unit="%"
          icon={TrendingUp}
          status={metrics.avg_recovery < 40 ? 'danger' : metrics.avg_recovery < 70 ? 'warning' : 'success'}
        />
        
        <MetricCard
          title="Bienestar Promedio"
          value={metrics.avg_wellness?.toFixed(1) || 0}
          icon={Activity}
          status="neutral"
          description="Índice general"
        />
      </div>

      {/* Insights departamentales */}
      {insightsList.length > 0 && (
        <InsightPanel
          title="Insights del Departamento"
          description="Análisis automático del bienestar del equipo"
          insights={insightsList}
        />
      )}

      {/* Miembros del equipo */}
      <Card>
        <CardHeader>
          <CardTitle>Miembros del Equipo</CardTitle>
          <CardDescription>Estado de salud de cada colaborador</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.team_members.map((member) => {
              // Find latest scan for this member
              const memberScans = data.recent_scans.filter(
                scan => scan.user_id === member.user_id
              );
              const latestScan = memberScans[0];

              return (
                <TeamMemberCard
                  key={member.user_id}
                  member={{
                    ...member,
                    last_scan: latestScan ? {
                      date: latestScan.created_at,
                      stress: latestScan.ai_stress,
                      fatigue: latestScan.ai_fatigue,
                      wellness: latestScan.wellness_index_score
                    } : undefined,
                    status: latestScan ? 'active' : 'inactive'
                  }}
                  showDetails={true}
                />
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Escaneos recientes del equipo */}
      {data.recent_scans && data.recent_scans.length > 0 && (
        <BiometricTable
          title="Escaneos Recientes del Equipo"
          description="Últimas mediciones biométricas del departamento"
          measurements={data.recent_scans.map(scan => {
            const member = data.team_members.find(m => m.user_id === scan.user_id);
            return {
              ...scan,
              user_name: member?.full_name || 'Usuario'
            };
          })}
          showUser={true}
          maxRows={10}
        />
      )}
    </div>
  );
}