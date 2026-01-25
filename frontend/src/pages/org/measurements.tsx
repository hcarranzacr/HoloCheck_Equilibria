import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
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
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();

      if (!profile?.organization_id) return;

      const { data } = await supabase
        .from('measurements')
        .select(`
          id,
          user_id,
          health_score,
          measurement_date,
          user_profiles!inner (
            full_name,
            departments (name)
          )
        `)
        .eq('organization_id', profile.organization_id)
        .order('measurement_date', { ascending: false })
        .limit(100);

      const formattedMeasurements = (data || []).map(m => ({
        id: m.id,
        user_id: m.user_id,
        health_score: m.health_score,
        measurement_date: m.measurement_date,
        user_name: (m.user_profiles as any)?.full_name || 'Usuario',
        department_name: (m.user_profiles as any)?.departments?.name || 'Sin departamento',
      }));

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