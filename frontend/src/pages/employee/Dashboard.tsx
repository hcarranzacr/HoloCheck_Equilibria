// @ts-nocheck
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, TrendingUp, Calendar, Heart, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import BiometricGaugeWithInfo from '@/components/dashboard/BiometricGaugeWithInfo';
import BiometricGauge from '@/components/dashboard/BiometricGauge';
import SectionHeader from '@/components/dashboard/SectionHeader';
import LoyaltyBenefitsIndicator from '@/components/dashboard/LoyaltyBenefitsIndicator';
import { getWellnessColor, getWellnessStatusString } from '@/lib/biometric-utils';
import { ALL_BIOMETRIC_INDICATORS, CATEGORY_LABELS, CATEGORY_ORDER } from '@/lib/all-biometric-indicators';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

interface DashboardData {
  user_profile: {
    full_name: string;
    email: string;
    department_name?: string;
  };
  latest_scan: any;
  scan_history: any[];
  total_scans: number;
  trends: {
    avg_stress: number;
    avg_fatigue: number;
    avg_recovery: number;
  };
}

export default function EmployeeDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ranges, setRanges] = useState<Record<string, Record<string, [number, number]>>>({});

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    const timestamp = new Date().toISOString();
    console.log(`📊 [Employee Dashboard] START - Loading data at ${timestamp}`);
    
    try {
      setLoading(true);
      setError(null);
      
      console.log(`🔑 [Employee Dashboard] Checking authentication...`);
      const session = await apiClient.auth.getSession();
      console.log(`🔐 [Employee Dashboard] Session exists: ${!!session}, Token length: ${session?.access_token?.length || 0}`);
      
      if (!session?.access_token) {
        throw new Error('No estás autenticado. Por favor, inicia sesión nuevamente.');
      }

      // Fetch biometric indicator ranges
      console.log(`📊 [Employee Dashboard] Step 1: Fetching biometric indicator ranges`);
      const rangesData = await apiClient.getBiometricIndicatorRanges();
      setRanges(rangesData);
      console.log(`✅ [Employee Dashboard] Ranges loaded:`, Object.keys(rangesData).length, 'indicators');

      // Get current user
      console.log(`👤 [Employee Dashboard] Step 2: Fetching current user`);
      const user = await apiClient.auth.getUser();
      if (!user) {
        throw new Error('Usuario no encontrado');
      }
      console.log(`✅ [Employee Dashboard] User found: ${user.email}`);

      // Get user profile using apiClient
      console.log(`📋 [Employee Dashboard] Step 3: Fetching user profile`);
      const profileResponse = await apiClient.userProfiles.query({
        query: { user_id: user.id },
        limit: 1
      });
      
      const profile = profileResponse.items?.[0];
      if (!profile) {
        throw new Error('Perfil de usuario no encontrado');
      }
      console.log(`✅ [Employee Dashboard] Profile loaded: ${profile.full_name}`);

      // Get user's biometric measurements
      console.log(`📊 [Employee Dashboard] Step 4: Fetching biometric measurements`);
      const measurementsResponse = await apiClient.measurements.query({
        query: { user_id: user.id },
        sort: '-created_at',
        limit: 10
      });

      const scans = measurementsResponse.items || [];
      console.log(`✅ [Employee Dashboard] Found ${scans.length} scans`);

      const latestScan = scans[0] || null;
      if (latestScan) {
        console.log(`📋 [Employee Dashboard] Latest scan fields:`, Object.keys(latestScan));
      }

      // Calculate trends
      console.log(`📈 [Employee Dashboard] Step 5: Calculating trends`);
      const avgStress = scans.length > 0
        ? scans.reduce((acc, s) => acc + (s.ai_stress || 0), 0) / scans.length
        : 0;
      const avgFatigue = scans.length > 0
        ? scans.reduce((acc, s) => acc + (s.ai_fatigue || 0), 0) / scans.length
        : 0;
      const avgRecovery = scans.length > 0
        ? scans.reduce((acc, s) => acc + (s.ai_recovery || 0), 0) / scans.length
        : 0;

      const dashboardData: DashboardData = {
        user_profile: {
          full_name: profile.full_name,
          email: profile.email,
          department_name: profile.department_name,
        },
        latest_scan: latestScan,
        scan_history: scans,
        total_scans: scans.length,
        trends: {
          avg_stress: avgStress,
          avg_fatigue: avgFatigue,
          avg_recovery: avgRecovery,
        },
      };

      console.log(`✅ [Employee Dashboard] SUCCESS - Data loaded`);
      setData(dashboardData);
      
    } catch (err: any) {
      console.error(`❌ [Employee Dashboard] ERROR`);
      console.error(`📛 [Employee Dashboard] Error:`, err);
      
      const errorMsg = err?.message || err?.data?.detail || err?.response?.data?.detail || 'Error al cargar el dashboard';
      console.error(`📛 [Employee Dashboard] Error message: ${errorMsg}`);
      
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
      console.log(`🏁 [Employee Dashboard] Finished`);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-5">
        <div className="max-w-7xl mx-auto">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (!data || !data.latest_scan) {
    return (
      <div className="min-h-screen bg-gray-50 p-5">
        <div className="max-w-7xl mx-auto">
          <Card className="bg-white rounded-2xl p-12 text-center">
            <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No hay escaneos disponibles
            </h3>
            <p className="text-gray-500">
              Realiza tu primer escaneo para ver tus indicadores de salud
            </p>
          </Card>
        </div>
      </div>
    );
  }

  const latestScan = data.latest_scan;
  const wellnessColor = getWellnessColor(latestScan.wellness_index_score);
  const wellnessStatus = getWellnessStatusString(latestScan.wellness_index_score);

  // Group indicators by category and filter only those with values
  const indicatorsByCategory: Record<string, typeof ALL_BIOMETRIC_INDICATORS> = {};
  
  ALL_BIOMETRIC_INDICATORS.forEach(indicator => {
    const value = latestScan[indicator.key];
    // Only include if value exists and is not null/undefined/empty/0 (except for arrhythmias_detected which can be 0)
    const hasValue = indicator.key === 'arrhythmias_detected' 
      ? value !== null && value !== undefined
      : value !== null && value !== undefined && value !== '' && value !== 0;
    
    if (hasValue) {
      if (!indicatorsByCategory[indicator.category]) {
        indicatorsByCategory[indicator.category] = [];
      }
      indicatorsByCategory[indicator.category].push(indicator);
    }
  });

  return (
    <div className="min-h-screen bg-gray-50 p-5">
      {/* Loyalty Benefits Indicator */}
      <LoyaltyBenefitsIndicator />

      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <Card className="bg-gradient-to-r from-sky-600 to-blue-600 text-white rounded-2xl shadow-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                👋 ¡Hola, {data.user_profile.full_name}!
              </h1>
              <p className="text-sky-100">
                {data.user_profile.department_name || 'Empleado'} • {data.total_scans} escaneos realizados
              </p>
            </div>
            <div className="text-right">
              <div className="text-5xl font-bold">{latestScan.wellness_index_score?.toFixed(1) || 'N/A'}</div>
              <div className="text-sm text-sky-100">Índice de Bienestar</div>
              <Badge 
                className="mt-2"
                style={{ 
                  backgroundColor: wellnessColor,
                  color: 'white'
                }}
              >
                {wellnessStatus}
              </Badge>
            </div>
          </div>
        </Card>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-white rounded-xl shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <Heart className="w-4 h-4" />
                Último Escaneo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {new Date(latestScan.created_at).toLocaleDateString('es-ES')}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(latestScan.created_at).toLocaleTimeString('es-ES')}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-xl shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Tendencia Estrés
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {data.trends.avg_stress.toFixed(1)}
              </div>
              <p className="text-xs text-gray-500 mt-1">Promedio últimos 10 escaneos</p>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-xl shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Total Escaneos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {data.total_scans}
              </div>
              <p className="text-xs text-gray-500 mt-1">Desde el inicio</p>
            </CardContent>
          </Card>
        </div>

        {/* All Biometric Indicators by Category - Ordered */}
        {CATEGORY_ORDER.map(category => {
          const indicators = indicatorsByCategory[category];
          if (!indicators || indicators.length === 0) return null;
          
          return (
            <div key={category}>
              <SectionHeader
                title={CATEGORY_LABELS[category] || category}
                description={`${indicators.length} indicadores disponibles`}
                metricCount={indicators.length}
                icon="📊"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {indicators.map(indicator => {
                  const value = latestScan[indicator.key];
                  const indicatorRanges = ranges[indicator.indicatorCode];
                  
                  if (indicator.hasInfo) {
                    return (
                      <BiometricGaugeWithInfo
                        key={indicator.key}
                        value={value}
                        indicatorCode={indicator.indicatorCode}
                        label={indicator.label}
                        riskRanges={indicatorRanges}
                      />
                    );
                  } else {
                    return (
                      <BiometricGauge
                        key={indicator.key}
                        value={value}
                        label={indicator.label}
                        unit=""
                        min={0}
                        max={100}
                        riskRanges={indicatorRanges}
                        indicatorCode={indicator.key}
                      />
                    );
                  }
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}