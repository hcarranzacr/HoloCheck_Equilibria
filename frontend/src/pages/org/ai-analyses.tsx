// @ts-nocheck
import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Search, Brain } from 'lucide-react';

interface AIAnalysis {
  id: string;
  user_id: string;
  analysis_type: string;
  analysis_result: any;
  created_at: string;
  user_name: string;
}

export default function OrgAIAnalyses() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [analyses, setAnalyses] = useState<AIAnalysis[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadAnalyses();
  }, []);

  async function loadAnalyses() {
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

      // Get AI analyses for the organization
      const response = await apiClient.aiAnalyses.listAll({
        query: JSON.stringify({ organization_id: profile.organization_id }),
        sort: '-created_at',
        limit: 50
      });

      // Get user profiles to map user names
      const userIds = [...new Set(response.items.map((a: any) => a.user_id))];
      const usersResponse = await apiClient.userProfiles.listAll({
        query: JSON.stringify({ user_id: { $in: userIds } })
      });

      const userMap = new Map(usersResponse.items.map((u: any) => [u.user_id, u.full_name || 'Usuario']));

      const formattedAnalyses = response.items.map((a: any) => ({
        id: a.id,
        user_id: a.user_id,
        analysis_type: a.analysis_type,
        analysis_result: a.analysis_result,
        created_at: a.created_at,
        user_name: userMap.get(a.user_id) || 'Usuario',
      }));

      setAnalyses(formattedAnalyses);
    } catch (error) {
      console.error('Error loading analyses:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los análisis',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  const filteredAnalyses = analyses.filter(a =>
    a.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.analysis_type.toLowerCase().includes(searchTerm.toLowerCase())
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
        <h1 className="text-3xl font-bold text-slate-900">Análisis IA</h1>
        <p className="text-slate-600 mt-2">Análisis generados por inteligencia artificial</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Historial de Análisis
          </CardTitle>
          <CardDescription>
            {filteredAnalyses.length} análisis encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Buscar análisis..."
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
                  <TableHead>Tipo de Análisis</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAnalyses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-slate-500">
                      No se encontraron análisis
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAnalyses.map((analysis) => (
                    <TableRow key={analysis.id}>
                      <TableCell className="font-medium">{analysis.user_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{analysis.analysis_type}</Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(analysis.created_at).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800">
                          Completado
                        </Badge>
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