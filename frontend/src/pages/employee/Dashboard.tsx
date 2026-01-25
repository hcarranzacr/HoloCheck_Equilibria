import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useActivityLogger } from '@/hooks/useActivityLogger';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, Heart, Brain, Battery, TrendingUp, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Measurement {
  id: string;
  heart_rate?: number;
  sdnn?: number;
  rmssd?: number;
  ai_stress?: number;
  ai_fatigue?: number;
  ai_cognitive_load?: number;
  ai_recovery?: number;
  bio_age_basic?: number;
  created_at: string;
}

interface AIAnalysis {
  insight_json: any;
}

export default function EmployeeDashboard() {
  const { logPageView, logAction } = useActivityLogger();
  const [latestMeasurement, setLatestMeasurement] = useState<Measurement | null>(null);
  const [aiAnalysis, setAIAnalysis] = useState<AIAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    logPageView('Employee Dashboard');
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      console.log('📊 [Dashboard] Loading data for user:', user.id);

      // Get latest measurement
      const { data: measurements, error: measError } = await supabase
        .from('biometric_measurements')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (measError) {
        console.error('❌ [Dashboard] Error loading measurements:', measError);
        throw measError;
      }

      if (measurements && measurements.length > 0) {
        setLatestMeasurement(measurements[0]);
        console.log('✅ [Dashboard] Latest measurement loaded');

        // Get AI analysis for latest measurement
        const { data: analysis, error: analysisError } = await supabase
          .from('ai_analysis_results')
          .select('*')
          .eq('measurement_id', measurements[0].id)
          .single();

        if (!analysisError && analysis) {
          setAIAnalysis(analysis);
          console.log('✅ [Dashboard] AI analysis loaded');
        }
      } else {
        console.log('ℹ️ [Dashboard] No measurements found');
      }
    } catch (error) {
      console.error('❌ [Dashboard] Error:', error);
    } finally {
      setLoading(false);
    }
  }

  const getStatusColor = (value: number | undefined, thresholds: { good: number; warning: number }) => {
    if (!value) return 'text-gray-400';
    if (value <= thresholds.good) return 'text-green-600';
    if (value <= thresholds.warning) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Cargando tu dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Mi Dashboard de Bienestar</h1>
          <p className="text-muted-foreground">Resumen de tu estado de salud</p>
        </div>
        <Link to="/employee/pre-scan">
          <Button size="lg">
            <Activity className="mr-2 h-5 w-5" />
            Nueva Medición
          </Button>
        </Link>
      </div>

      {!latestMeasurement ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Activity className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No hay mediciones aún</h3>
            <p className="text-muted-foreground mb-6">
              Realiza tu primera medición biométrica para comenzar a monitorear tu bienestar
            </p>
            <Link to="/employee/pre-scan">
              <Button>
                <Activity className="mr-2 h-4 w-4" />
                Realizar Primera Medición
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Nivel de Estrés</CardTitle>
                <Brain className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getStatusColor(latestMeasurement.ai_stress, { good: 30, warning: 60 })}`}>
                  {latestMeasurement.ai_stress ? `${latestMeasurement.ai_stress}%` : 'N/A'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {latestMeasurement.ai_stress && latestMeasurement.ai_stress <= 30 ? 'Bajo' :
                   latestMeasurement.ai_stress && latestMeasurement.ai_stress <= 60 ? 'Moderado' : 'Alto'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Nivel de Fatiga</CardTitle>
                <Battery className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getStatusColor(latestMeasurement.ai_fatigue, { good: 30, warning: 60 })}`}>
                  {latestMeasurement.ai_fatigue ? `${latestMeasurement.ai_fatigue}%` : 'N/A'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {latestMeasurement.ai_fatigue && latestMeasurement.ai_fatigue <= 30 ? 'Bajo' :
                   latestMeasurement.ai_fatigue && latestMeasurement.ai_fatigue <= 60 ? 'Moderado' : 'Alto'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Frecuencia Cardíaca</CardTitle>
                <Heart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {latestMeasurement.heart_rate ? `${latestMeasurement.heart_rate}` : 'N/A'}
                </div>
                <p className="text-xs text-muted-foreground">bpm</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Edad Biológica</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {latestMeasurement.bio_age_basic ? `${latestMeasurement.bio_age_basic}` : 'N/A'}
                </div>
                <p className="text-xs text-muted-foreground">años</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Última Medición</CardTitle>
              <CardDescription>
                <Calendar className="inline h-4 w-4 mr-1" />
                {formatDate(latestMeasurement.created_at)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-semibold mb-2">Variabilidad Cardíaca</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">SDNN:</span>
                      <span className="font-medium">{latestMeasurement.sdnn || 'N/A'} ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">RMSSD:</span>
                      <span className="font-medium">{latestMeasurement.rmssd || 'N/A'} ms</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Indicadores AI</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Carga Cognitiva:</span>
                      <span className="font-medium">{latestMeasurement.ai_cognitive_load || 'N/A'}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Recuperación:</span>
                      <span className="font-medium">{latestMeasurement.ai_recovery || 'N/A'}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {aiAnalysis && (
            <Card>
              <CardHeader>
                <CardTitle>Análisis AI</CardTitle>
                <CardDescription>Recomendaciones personalizadas basadas en tu última medición</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  {aiAnalysis.insight_json?.recommendations ? (
                    <ul className="list-disc pl-5 space-y-2">
                      {aiAnalysis.insight_json.recommendations.map((rec: string, idx: number) => (
                        <li key={idx} className="text-sm">{rec}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Análisis en proceso...
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4 md:grid-cols-3">
            <Link to="/employee/history">
              <Card className="hover:bg-slate-50 transition-colors cursor-pointer">
                <CardContent className="pt-6">
                  <Activity className="h-8 w-8 text-sky-600 mb-2" />
                  <h3 className="font-semibold">Mis Mediciones</h3>
                  <p className="text-sm text-muted-foreground">Ver historial completo</p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/employee/history">
              <Card className="hover:bg-slate-50 transition-colors cursor-pointer">
                <CardContent className="pt-6">
                  <TrendingUp className="h-8 w-8 text-sky-600 mb-2" />
                  <h3 className="font-semibold">Tendencias</h3>
                  <p className="text-sm text-muted-foreground">Analizar evolución</p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/employee/recommendations">
              <Card className="hover:bg-slate-50 transition-colors cursor-pointer">
                <CardContent className="pt-6">
                  <Brain className="h-8 w-8 text-sky-600 mb-2" />
                  <h3 className="font-semibold">Recomendaciones</h3>
                  <p className="text-sm text-muted-foreground">Consejos personalizados</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}