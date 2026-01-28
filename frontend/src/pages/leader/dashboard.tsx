import { useEffect, useState } from 'react';
import { Users, TrendingUp, Activity, AlertCircle, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api-client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface TeamMember {
  user_id: string;
  full_name: string;
  email: string;
  role: string;
}

interface BiometricScan {
  id: string;
  user_id: string;
  created_at: string;
  ai_stress?: number;
  ai_fatigue?: number;
  wellness_index_score?: number;
  heart_rate?: number;
}

interface TeamMetrics {
  avg_stress?: number;
  avg_fatigue?: number;
  avg_wellness?: number;
  total_scans: number;
}

interface DashboardData {
  department_id: string;
  organization_id: string;
  team_size: number;
  team_members: TeamMember[];
  recent_scans: BiometricScan[];
  team_metrics: TeamMetrics;
  total_scans: number;
}

export default function LeaderDashboard() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    const timestamp = new Date().toISOString();
    console.log(`🎯 [LEADER DASHBOARD] START - Loading data at ${timestamp}`);
    
    try {
      setLoading(true);
      setError(null);
      
      console.log(`🔑 [LEADER DASHBOARD] Checking authentication...`);
      const session = await apiClient.auth.getSession();
      console.log(`🔐 [LEADER DASHBOARD] Session exists: ${!!session}, Token length: ${session?.access_token?.length || 0}`);
      
      if (!session?.access_token) {
        throw new Error('No estás autenticado. Por favor, inicia sesión nuevamente.');
      }

      console.log(`📡 [LEADER DASHBOARD] Calling API...`);
      const response = await apiClient.dashboards.leader();

      console.log(`✅ [LEADER DASHBOARD] Response received`);
      console.log(`📊 [LEADER DASHBOARD] Data keys:`, Object.keys(response || {}));
      console.log(`📋 [LEADER DASHBOARD] Full data:`, response);
      
      setData(response);
      console.log(`✅ [LEADER DASHBOARD] SUCCESS`);
      
    } catch (err: any) {
      console.error(`❌ [LEADER DASHBOARD] ERROR`);
      console.error(`📛 [LEADER DASHBOARD] Error:`, err);
      
      const errorMsg = err?.message || err?.data?.detail || err?.response?.data?.detail || 'Error al cargar el dashboard';
      console.error(`📛 [LEADER DASHBOARD] Error message: ${errorMsg}`);
      
      setError(errorMsg);
      toast({
        title: 'Error',
        description: errorMsg,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      console.log(`🏁 [LEADER DASHBOARD] Finished`);
    }
  };

  const getStressLevel = (stress?: number) => {
    if (!stress) return { label: 'N/A', variant: 'outline' as const };
    if (stress < 30) return { label: 'Bajo', variant: 'default' as const };
    if (stress < 60) return { label: 'Moderado', variant: 'secondary' as const };
    return { label: 'Alto', variant: 'destructive' as const };
  };

  const getWellnessLevel = (wellness?: number) => {
    if (!wellness) return { label: 'N/A', variant: 'outline' as const };
    if (wellness >= 75) return { label: 'Excelente', variant: 'default' as const };
    if (wellness >= 60) return { label: 'Bueno', variant: 'secondary' as const };
    return { label: 'Requiere Atención', variant: 'destructive' as const };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando dashboard...</p>
        </div>
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
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>No se encontraron datos del equipo</AlertDescription>
        </Alert>
      </div>
    );
  }

  const recentScans = data.recent_scans || [];
  const teamMembers = data.team_members || [];
  const teamMetrics: TeamMetrics = data.team_metrics || { total_scans: 0 };

  const membersWithScans = teamMembers.map((member) => {
    const memberScans = recentScans.filter((scan) => scan.user_id === member.user_id);
    const latestScan = memberScans.length > 0 ? memberScans[0] : null;
    return {
      ...member,
      latestScan,
      scanCount: memberScans.length,
    };
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard de Líder</h1>
        <Badge variant="outline" className="text-sm">
          <Calendar className="h-3 w-3 mr-1" />
          Últimos 30 días
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tamaño del Equipo</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.team_size}</div>
            <p className="text-xs text-muted-foreground">miembros activos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Escaneos Totales</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.total_scans}</div>
            <p className="text-xs text-muted-foreground">últimos 30 días</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estrés Promedio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {teamMetrics.avg_stress ? teamMetrics.avg_stress.toFixed(1) : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {teamMetrics.avg_stress && (
                <Badge variant={getStressLevel(teamMetrics.avg_stress).variant} className="text-xs">
                  {getStressLevel(teamMetrics.avg_stress).label}
                </Badge>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bienestar Promedio</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {teamMetrics.avg_wellness ? teamMetrics.avg_wellness.toFixed(1) : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {teamMetrics.avg_wellness && (
                <Badge variant={getWellnessLevel(teamMetrics.avg_wellness).variant} className="text-xs">
                  {getWellnessLevel(teamMetrics.avg_wellness).label}
                </Badge>
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Estado del Equipo</CardTitle>
        </CardHeader>
        <CardContent>
          {membersWithScans.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay miembros del equipo para mostrar
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Escaneos</TableHead>
                  <TableHead>Último Estrés</TableHead>
                  <TableHead>Último Bienestar</TableHead>
                  <TableHead>Última Medición</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {membersWithScans.map((member) => (
                  <TableRow key={member.user_id}>
                    <TableCell className="font-medium">{member.full_name}</TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {member.role}
                      </Badge>
                    </TableCell>
                    <TableCell>{member.scanCount}</TableCell>
                    <TableCell>
                      {member.latestScan?.ai_stress ? (
                        <Badge variant={getStressLevel(member.latestScan.ai_stress).variant}>
                          {member.latestScan.ai_stress.toFixed(1)}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {member.latestScan?.wellness_index_score ? (
                        <Badge variant={getWellnessLevel(member.latestScan.wellness_index_score).variant}>
                          {member.latestScan.wellness_index_score.toFixed(1)}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {member.latestScan ? (
                        <span className="text-sm text-muted-foreground">
                          {new Date(member.latestScan.created_at).toLocaleDateString('es-ES', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">Sin datos</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {recentScans.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentScans.slice(0, 10).map((scan) => {
                const member = teamMembers.find((m) => m.user_id === scan.user_id);
                return (
                  <div key={scan.id} className="flex items-center justify-between border-b pb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{member?.full_name || 'Usuario desconocido'}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(scan.created_at).toLocaleString('es-ES', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {scan.ai_stress && (
                        <Badge variant={getStressLevel(scan.ai_stress).variant}>
                          Estrés: {scan.ai_stress.toFixed(1)}
                        </Badge>
                      )}
                      {scan.wellness_index_score && (
                        <Badge variant={getWellnessLevel(scan.wellness_index_score).variant}>
                          Bienestar: {scan.wellness_index_score.toFixed(1)}
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}