import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, TrendingUp, Calendar, Heart } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import BiometricGaugeWithInfo from '@/components/dashboard/BiometricGaugeWithInfo';
import BiometricGauge from '@/components/dashboard/BiometricGauge';
import SectionHeader from '@/components/dashboard/SectionHeader';
import LoyaltyBenefitsIndicator from '@/components/dashboard/LoyaltyBenefitsIndicator';
import { getWellnessColor, getWellnessStatusString } from '@/lib/biometric-utils';
import { ALL_BIOMETRIC_INDICATORS, CATEGORY_LABELS } from '@/lib/all-biometric-indicators';

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

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      setLoading(true);
      console.log('📊 [Employee Dashboard] Loading data...');

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error('User not authenticated:', userError);
        return;
      }

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('full_name, email, departments(name)')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        console.error('Error loading profile:', profileError);
        return;
      }

      // Get latest scan
      const { data: scans, error: scansError } = await supabase
        .from('biometric_measurements')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (scansError) {
        console.error('Error loading scans:', scansError);
        return;
      }

      const latestScan = scans?.[0] || null;

      // Calculate trends
      const avgStress = scans?.length > 0
        ? scans.reduce((acc, s) => acc + (s.ai_stress || 0), 0) / scans.length
        : 0;
      const avgFatigue = scans?.length > 0
        ? scans.reduce((acc, s) => acc + (s.ai_fatigue || 0), 0) / scans.length
        : 0;
      const avgRecovery = scans?.length > 0
        ? scans.reduce((acc, s) => acc + (s.ai_recovery || 0), 0) / scans.length
        : 0;

      const dashboardData: DashboardData = {
        user_profile: {
          full_name: profile.full_name,
          email: profile.email,
          department_name: profile.departments?.name,
        },
        latest_scan: latestScan,
        scan_history: scans || [],
        total_scans: scans?.length || 0,
        trends: {
          avg_stress: avgStress,
          avg_fatigue: avgFatigue,
          avg_recovery: avgRecovery,
        },
      };

      console.log('✅ [Employee Dashboard] Data loaded:', dashboardData);
      setData(dashboardData);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
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
    // Only include if value exists and is not null/undefined
    if (value !== null && value !== undefined && value !== '') {
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

        {/* All Biometric Indicators by Category */}
        {Object.entries(indicatorsByCategory).map(([category, indicators]) => (
          <div key={category}>
            <SectionHeader
              title={CATEGORY_LABELS[category] || category}
              description={`${indicators.length} indicadores disponibles`}
              metricCount={indicators.length}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {indicators.map(indicator => {
                const value = latestScan[indicator.key];
                
                if (indicator.hasInfo) {
                  return (
                    <BiometricGaugeWithInfo
                      key={indicator.key}
                      value={value}
                      indicatorCode={indicator.indicatorCode}
                      label={indicator.label}
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
                    />
                  );
                }
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}