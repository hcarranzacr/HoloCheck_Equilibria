import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Building2, Activity, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function OrgDashboard() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDepartments: 0,
    totalMeasurements: 0,
    avgHealthScore: 0,
  });
  const [orgName, setOrgName] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      setLoading(true);
      
      // Get current user's organization
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();

      if (!profile?.organization_id) return;

      // Get organization name
      const { data: org } = await supabase
        .from('organizations')
        .select('name')
        .eq('id', profile.organization_id)
        .single();

      if (org) setOrgName(org.name);

      // Get stats
      const [usersResult, deptsResult, measurementsResult] = await Promise.all([
        supabase
          .from('user_profiles')
          .select('id', { count: 'exact' })
          .eq('organization_id', profile.organization_id),
        supabase
          .from('departments')
          .select('id', { count: 'exact' })
          .eq('organization_id', profile.organization_id),
        supabase
          .from('measurements')
          .select('health_score')
          .eq('organization_id', profile.organization_id),
      ]);

      const totalUsers = usersResult.count || 0;
      const totalDepartments = deptsResult.count || 0;
      const measurements = measurementsResult.data || [];
      const totalMeasurements = measurements.length;
      const avgHealthScore = measurements.length > 0
        ? measurements.reduce((sum, m) => sum + (m.health_score || 0), 0) / measurements.length
        : 0;

      setStats({
        totalUsers,
        totalDepartments,
        totalMeasurements,
        avgHealthScore: Math.round(avgHealthScore * 10) / 10,
      });
    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast({
        title: 'Error',
        description: 'No se pudo cargar el dashboard',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard Organizacional</h1>
        <p className="text-slate-600 mt-2">{orgName}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Usuarios activos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Departamentos</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDepartments}</div>
            <p className="text-xs text-muted-foreground">Departamentos activos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mediciones</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMeasurements}</div>
            <p className="text-xs text-muted-foreground">Total realizadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Salud Promedio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgHealthScore}</div>
            <p className="text-xs text-muted-foreground">Índice de salud</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resumen Organizacional</CardTitle>
          <CardDescription>Vista general de la organización</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600">
            Esta es la vista de dashboard para administradores de organización. 
            Aquí podrás ver métricas clave y el estado general de tu organización.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}