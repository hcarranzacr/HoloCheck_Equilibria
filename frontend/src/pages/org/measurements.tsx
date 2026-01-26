import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Search } from 'lucide-react';

interface Measurement {
  id: string;
  user_id: string;
  health_score: number;
  measurement_date: string;
  user_name: string;
  department_name: string;
}

export default function OrgMeasurements() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadMeasurements();
  }, []);

  async function loadMeasurements() {
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

      // Get measurements for the organization
      const measurementsResponse = await apiClient.measurements.listAll({
        query: JSON.stringify({ organization_id: profile.organization_id }),
        sort: '-measurement_date',
        limit: 100
      });

      // Get user profiles to map user names and departments
      const userIds = [...new Set(measurementsResponse.items.map((m: any) => m.user_id))];
      const usersResponse = await apiClient.userProfiles.listAll({
        query: JSON.stringify({ user_id: { $in: userIds } })
      });

      // Get departments
      const deptIds = [...new Set(usersResponse.items.map((u: any) => u.department_id).filter(Boolean))];
      const deptsResponse = await apiClient.departments.listAll({
        query: JSON.stringify({ id: { $in: deptIds } })
      });

      const userMap = new Map(usersResponse.items.map((u: any) => [u.user_id, u]));
      const deptMap = new Map(deptsResponse.items.map((d: any) => [d.id, d.name]));

      const formattedMeasurements = measurementsResponse.items.map((m: any) => {
        const userProfile = userMap.get(m.user_id);
        return {
          id: m.id,
          user_id: m.user_id,
          health_score: m.health_score,
          measurement_date: m.measurement_date,
          user_name: userProfile?.full_name || 'Usuario',
          department_name: deptMap.get(userProfile?.department_id) || 'Sin departamento',
        };
      });

      setMeasurements(formattedMeasurements);
    } catch (error) {
      console.error('Error loading measurements:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las mediciones',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  const filteredMeasurements = measurements.filter(m =>
    m.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.department_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <h1 className="text-3xl font-bold text-slate-900">Mediciones</h1>
        <p className="text-slate-600 mt-2">Historial de mediciones de la organización</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historial de Mediciones</CardTitle>
          <CardDescription>
            {filteredMeasurements.length} medición(es) encontrada(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Buscar por usuario o departamento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Departamento</TableHead>
                  <TableHead>Índice de Salud</TableHead>
                  <TableHead>Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMeasurements.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-slate-500">
                      No se encontraron mediciones
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMeasurements.map((measurement) => (
                    <TableRow key={measurement.id}>
                      <TableCell className="font-medium">{measurement.user_name}</TableCell>
                      <TableCell>{measurement.department_name}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          measurement.health_score >= 7 ? 'bg-green-100 text-green-800' :
                          measurement.health_score >= 5 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {measurement.health_score.toFixed(1)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {new Date(measurement.measurement_date).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}