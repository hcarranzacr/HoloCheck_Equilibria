import { useEffect, useState } from 'react';
import { Activity, TrendingUp, Heart, Brain, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api-client';
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
    const timestamp = new Date().toISOString();
    console.log(`📊 [Employee Dashboard] START - Loading data at ${timestamp}`);
    
    try {
      setLoading(true);
      setError(null);

      // Step 1: Check authentication
      console.log('🔑 [Employee Dashboard] Checking authentication...');
      const session = await apiClient.auth.getSession();
      console.log(`🔐 [Employee Dashboard] Session exists: ${!!session}, Token length: ${session?.access_token?.length || 0}`);
      
      if (!session?.access_token) {
        throw new Error('No estás autenticado. Por favor, inicia sesión nuevamente.');
      }

      // Step 2: Get biometric indicator ranges
      console.log('📊 [Employee Dashboard] Step 1: Fetching biometric indicator ranges');
      const indicatorRanges = await apiClient.getBiometricIndicatorRanges();
      console.log(`✅ [Employee Dashboard] Ranges loaded: ${Object.keys(indicatorRanges).length} indicators`);
      setRanges(indicatorRanges);

      // Step 3: Get current user
      console.log('👤 [Employee Dashboard] Step 2: Fetching current user');
      const user = await apiClient.auth.getUser();
      if (!user) {
        throw new Error('Usuario no encontrado');
      }
      console.log(`✅ [Employee Dashboard] User found: ${user.email}`);

      // Step 4: Get user profile
      console.log('📋 [Employee Dashboard] Step 3: Fetching user profile');
      console.log(`📡 [Employee Dashboard] Calling apiClient.userProfiles.query with user_id: ${user.id}`);
      
      let userProfile;
      try {
        const profileResponse = await apiClient.userProfiles.query({
          query: { user_id: user.id },
          limit: 1
        });
        console.log(`✅ [Employee Dashboard] Profile query response:`, profileResponse);
        userProfile = profileResponse.items?.[0];
        
        if (!userProfile) {
          console.warn('⚠️ [Employee Dashboard] No profile found, user may need to complete onboarding');
        } else {
          console.log(`✅ [Employee Dashboard] Profile loaded: ${userProfile.full_name}`);
        }
      } catch (profileError: any) {
        console.error(`❌ [Employee Dashboard] STEP 3 FAILED - Profile query error`);
        console.error(`📛 [Employee Dashboard] Error type: ${profileError?.constructor?.name}`);
        console.error(`📛 [Employee Dashboard] Error message: ${profileError?.message}`);
        console.error(`📛 [Employee Dashboard] Error status: ${profileError?.response?.status}`);
        console.error(`📛 [Employee Dashboard] Error data:`, profileError?.response?.data);
        console.error(`📛 [Employee Dashboard] Full error:`, profileError);
        throw new Error(`Error al cargar perfil: ${profileError?.response?.data?.detail || profileError?.message || 'Error desconocido'}`);
      }

      // Step 5: Get latest biometric measurement
      console.log('📊 [Employee Dashboard] Step 4: Fetching latest biometric measurement');
      console.log(`📡 [Employee Dashboard] Calling apiClient.getLatestMeasurement with user_id: ${user.id}`);
      
      let latestMeasurement;
      try {
        latestMeasurement = await apiClient.getLatestMeasurement(user.id);
        console.log(`✅ [Employee Dashboard] Latest measurement:`, latestMeasurement);
        
        if (!latestMeasurement) {
          console.warn('⚠️ [Employee Dashboard] No measurements found for user');
        }
      } catch (measurementError: any) {
        console.error(`❌ [Employee Dashboard] STEP 4 FAILED - Latest measurement error`);
        console.error(`📛 [Employee Dashboard] Error type: ${measurementError?.constructor?.name}`);
        console.error(`📛 [Employee Dashboard] Error message: ${measurementError?.message}`);
        console.error(`📛 [Employee Dashboard] Error status: ${measurementError?.response?.status}`);
        console.error(`📛 [Employee Dashboard] Error data:`, measurementError?.response?.data);
        console.error(`📛 [Employee Dashboard] Full error:`, measurementError);
        throw new Error(`Error al cargar mediciones: ${measurementError?.response?.data?.detail || measurementError?.message || 'Error desconocido'}`);
      }

      // Step 6: Get measurement history
      console.log('📊 [Employee Dashboard] Step 5: Fetching measurement history');
      console.log(`📡 [Employee Dashboard] Calling apiClient.getMeasurementHistory with user_id: ${user.id}`);
      
      let measurementHistory;
      try {
        measurementHistory = await apiClient.getMeasurementHistory(user.id, 30);
        console.log(`✅ [Employee Dashboard] Measurement history: ${measurementHistory?.length || 0} records`);
      } catch (historyError: any) {
        console.error(`❌ [Employee Dashboard] STEP 5 FAILED - Measurement history error`);
        console.error(`📛 [Employee Dashboard] Error type: ${historyError?.constructor?.name}`);
        console.error(`📛 [Employee Dashboard] Error message: ${historyError?.message}`);
        console.error(`📛 [Employee Dashboard] Error status: ${historyError?.response?.status}`);
        console.error(`📛 [Employee Dashboard] Error data:`, historyError?.response?.data);
        console.error(`📛 [Employee Dashboard] Full error:`, historyError);
        throw new Error(`Error al cargar historial: ${historyError?.response?.data?.detail || historyError?.message || 'Error desconocido'}`);
      }

      // Step 7: Get recommendations
      console.log('📊 [Employee Dashboard] Step 6: Fetching recommendations');
      console.log(`📡 [Employee Dashboard] Calling apiClient.getUserRecommendations with user_id: ${user.id}`);
      
      let recommendations = [];
      try {
        recommendations = await apiClient.getUserRecommendations(user.id);
        console.log(`✅ [Employee Dashboard] Recommendations: ${recommendations?.length || 0} items`);
      } catch (recError: any) {
        console.error(`❌ [Employee Dashboard] STEP 6 FAILED - Recommendations error`);
        console.error(`📛 [Employee Dashboard] Error type: ${recError?.constructor?.name}`);
        console.error(`📛 [Employee Dashboard] Error message: ${recError?.message}`);
        console.error(`📛 [Employee Dashboard] Error status: ${recError?.response?.status}`);
        console.error(`📛 [Employee Dashboard] Error data:`, recError?.response?.data);
        console.error(`📛 [Employee Dashboard] Full error:`, recError);
        // Don't throw for recommendations - they're optional
        console.warn('⚠️ [Employee Dashboard] Continuing without recommendations');
      }

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
              status: getStatus(key, value, indicatorRanges),
              trend: 'stable'
            });
          }
        });
      }

      setData({
        latestScan: latestMeasurement,
        biometricData,
        recommendations
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
                  <h3 className="font-semibold">{rec.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{rec.description}</p>
                  <Badge variant="outline" className="mt-2">
                    {rec.recommendation_type}
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