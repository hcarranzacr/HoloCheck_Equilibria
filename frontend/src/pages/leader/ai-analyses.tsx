import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getAIAnalyses } from '@/lib/supabase-admin';

export default function LeaderAIAnalyses() {
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalyses();
  }, []);

  async function loadAnalyses() {
    try {
      const data = await getAIAnalyses();
      setAnalyses(data);
    } catch (error) {
      console.error('Error loading AI analyses:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Análisis IA</h1>
        <p className="text-slate-600 mt-2">Insights generados para el equipo</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Análisis Recientes</CardTitle>
          <CardDescription>Recomendaciones y análisis del departamento</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyses.length === 0 ? (
              <p className="text-sm text-slate-600">No hay análisis disponibles</p>
            ) : (
              analyses.map((analysis) => (
                <div key={analysis.id} className="border-b pb-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Usuario: {analysis.user_id}</p>
                      <p className="text-xs text-slate-600">
                        {new Date(analysis.created_at).toLocaleString('es-MX')}
                      </p>
                    </div>
                    <Badge>{analysis.analysis_type}</Badge>
                  </div>
                  <p className="text-sm text-slate-700">{analysis.summary}</p>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}