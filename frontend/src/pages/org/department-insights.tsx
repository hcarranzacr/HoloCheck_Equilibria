// @ts-nocheck
import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { TrendingUp, Users, Activity, AlertCircle } from 'lucide-react';

interface Department {
  id: string;
  name: string;
}

interface DepartmentStats {
  totalUsers: number;
  totalMeasurements: number;
  avgHealthScore: number;
  activeUsers: number;
}

export default function DepartmentInsights() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDept, setSelectedDept] = useState<string>('');
  const [stats, setStats] = useState<DepartmentStats>({
    totalUsers: 0,
    totalMeasurements: 0,
    avgHealthScore: 0,
    activeUsers: 0,
  });

  useEffect(() => {
    loadDepartments();
  }, []);

  useEffect(() => {
    if (selectedDept) {
      loadDepartmentStats(selectedDept);
    }
  }, [selectedDept]);

  async function loadDepartments() {
    try {
      setLoading(true);
      
      // Get current user from backend
      const user = await apiClient.auth.me();
      if (!user) return;

      // Get user's organization_id from their profile
      const profileResponse = await apiClient.userProfiles.list({
        query: JSON.stringify({ user_id: user.id }),
        limit: 1
      });

      const profile = profileResponse?.items?.[0];
      if (!profile?.organization_id) return;

      // Get departments for the organization
      const response = await apiClient.departments.listAll({
        query: JSON.stringify({ 
          organization_id: profile.organization_id,
          is_active: true 
        }),
        sort: 'name'
      });

      const depts = response.items.map((d: any) => ({
        id: d.id,
        name: d.name
      }));

      setDepartments(depts);
      
      if (depts.length > 0) {
        setSelectedDept(depts[0].id);
      }
    } catch (error) {
      console.error('Error loading departments:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los departamentos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  async function loadDepartmentStats(deptId: string) {
    try {
      // Get users for the department
      const usersResponse = await apiClient.userProfiles.listAll({
        query: JSON.stringify({ department_id: deptId })
      });

      const users = usersResponse.items || [];
      const totalUsers = users.length;
      const activeUsers = users.filter((u: any) => u.is_active).length;

      // Get measurements for these users
      const userIds = users.map((u: any) => u.user_id);
      const measurementsResponse = await apiClient.measurements.listAll({
        query: JSON.stringify({ user_id: { $in: userIds } })
      });

      const measurements = measurementsResponse.items || [];
      const totalMeasurements = measurements.length;
      const avgHealthScore = totalMeasurements > 0
        ? measurements.reduce((sum: number, m: any) => sum + (m.health_score || 0), 0) / totalMeasurements
        : 0;

      setStats({
        totalUsers,
        totalMeasurements,
        avgHealthScore: Math.round(avgHealthScore * 10) / 10,
        activeUsers,
      });
    } catch (error) {
      console.error('Error loading department stats:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las estadísticas',
        variant: 'destructive',
      });
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
        <h1 className="text-3xl font-bold text-slate-900">Insights Departamentales</h1>
        <p className="text-slate-600 mt-2">Análisis detallado por departamento</p>
      </div>

      <div className="w-full max-w-xs">
        <Select value={selectedDept} onValueChange={setSelectedDept}>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona un departamento" />
          </SelectTrigger>
          <SelectContent>
            {departments.map((dept) => (
              <SelectItem key={dept.id} value={dept.id}>
                {dept.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedDept && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeUsers} activos
              </p>
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

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estado</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.avgHealthScore >= 7 ? '✅' : stats.avgHealthScore >= 5 ? '⚠️' : '❌'}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.avgHealthScore >= 7 ? 'Saludable' : stats.avgHealthScore >= 5 ? 'Atención' : 'Crítico'}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Análisis Departamental</CardTitle>
          <CardDescription>Vista detallada del departamento seleccionado</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600">
            Esta sección muestra métricas clave del departamento seleccionado, 
            incluyendo el número de usuarios, mediciones realizadas y el índice 
            de salud promedio del equipo.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}