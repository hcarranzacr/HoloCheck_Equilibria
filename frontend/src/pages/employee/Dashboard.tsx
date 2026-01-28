import { useEffect, useState } from 'react';
import { Activity, TrendingUp, Heart, Brain, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { loadEmployeeDashboardData } from '@/lib/dashboard-utils';
import { toast } from 'sonner';

interface BiometricData {
  indicator: string;
  value: number;
  status: 'good' | 'warning' | 'danger';
  trend: 'up' | 'down' | 'stable';
}

interface DashboardData {
  latestScan?: any;
  biometricData: BiometricData[];
  recommendations: any[];
}

export default function EmployeeDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DashboardData>({
    biometricData: [],
    recommendations: []
  });
  const [ranges, setRanges] = useState<Record<string, Record<string, [number, number]>>>({});

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use standardized loading function
      const result = await loadEmployeeDashboardData();

      if (!result.success) {
        throw new Error(result.error || 'Error al cargar el dashboard');
      }

      const { latestMeasurement, measurementHistory, recommendations, ranges: indicatorRanges } = result.data;

      // Convert ranges to the format expected by the component
      const rangesMap: Record<string, Record<string, [number, number]>> = {};
      if (indicatorRanges && Array.isArray(indicatorRanges)) {
        indicatorRanges.forEach((range: any) => {
          if (range.indicator_code) {
            rangesMap[range.indicator_code] = {
              low: [parseFloat(range.min_value), parseFloat(range.max_value)],
              medium: [parseFloat(range.min_value), parseFloat(range.max_value)],
              high: [parseFloat(range.min_value), parseFloat(range.max_value)]
            };
          }
        });
      }
      setRanges(rangesMap);

      // Process biometric data
      const biometricData: BiometricData[] = [];
      if (latestMeasurement) {
        const indicators = [
          { key: 'ai_stress', label: 'Estrés', icon: Brain },
          { key: 'ai_fatigue', label: 'Fatiga', icon: Activity },
          { key: 'wellness_index_score', label: 'Bienestar', icon: Heart },
          { key: 'heart_rate', label: 'Frecuencia Cardíaca', icon: Heart },
        ];

        indicators.forEach(({ key, label }) => {
          const value = latestMeasurement[key];
          if (value !== undefined && value !== null) {
            biometricData.push({
              indicator: label,
              value: value,
              status: getStatus(key, value, rangesMap),
              trend: 'stable'
            });
          }
        });
      }

      setData({
        latestScan: latestMeasurement,
        biometricData,
        recommendations: recommendations || []
      });

      console.log('✅ [Employee Dashboard] SUCCESS - All data loaded');

    } catch (err: any) {
      console.error('❌ [Employee Dashboard] CRITICAL ERROR');
      console.error('📛 [Employee Dashboard] Error:', err);
      
      const errorMsg = err?.message || err?.data?.detail || err?.response?.data?.detail || 'Error al cargar el dashboard';
      console.error('📛 [Employee Dashboard] Final error message:', errorMsg);
      
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
      console.log('🏁 [Employee Dashboard] Finished');
    }
  };

  const getStatus = (key: string, value: number, ranges: Record<string, Record<string, [number, number]>>): 'good' | 'warning' | 'danger' => {
    const indicatorRanges = ranges[key];
    if (!indicatorRanges) return 'good';

    if (indicatorRanges.high && value >= indicatorRanges.high[0]) return 'danger';
    if (indicatorRanges.medium && value >= indicatorRanges.medium[0]) return 'warning';
    return 'good';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'danger': return 'text-red-600';
      default: return 'text-gray-600';
    }
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

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Mi Dashboard</h1>
        {data.latestScan && (
          <Badge variant="outline">
            Último escaneo: {new Date(data.latestScan.created_at).toLocaleDateString('es-ES')}
          </Badge>
        )}
      </div>

      {!data.latestScan && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No tienes escaneos biométricos aún. Realiza tu primer escaneo para ver tus métricas de salud.
          </AlertDescription>
        </Alert>
      )}

      {data.biometricData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {data.biometricData.map((item, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{item.indicator}</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getStatusColor(item.status)}`}>
                  {item.value.toFixed(1)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  <Badge variant={item.status === 'good' ? 'default' : item.status === 'warning' ? 'secondary' : 'destructive'}>
                    {item.status === 'good' ? 'Normal' : item.status === 'warning' ? 'Atención' : 'Alto'}
                  </Badge>
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {data.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recomendaciones Personalizadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.recommendations.slice(0, 5).map((rec, index) => (
                <div key={index} className="border-b pb-3 last:border-0">
                  <h3 className="font-semibold">{rec.title || rec.recommendation_text}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{rec.description || rec.recommendation_text}</p>
                  <Badge variant="outline" className="mt-2">
                    {rec.recommendation_type || rec.category || 'General'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}