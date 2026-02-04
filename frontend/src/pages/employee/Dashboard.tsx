// @ts-nocheck
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, TrendingUp, Calendar, Heart, RefreshCw, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import BiometricGaugeWithInfo from '@/components/dashboard/BiometricGaugeWithInfo';
import BiometricGauge from '@/components/dashboard/BiometricGauge';
import SectionHeader from '@/components/dashboard/SectionHeader';
import LoyaltyBenefitsIndicator from '@/components/dashboard/LoyaltyBenefitsIndicator';
import { getWellnessColor, getWellnessStatusString } from '@/lib/biometric-utils';
import { ALL_BIOMETRIC_INDICATORS, CATEGORY_LABELS } from '@/lib/all-biometric-indicators';
import { apiClient } from '@/lib/api-client';

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

interface EvolutionData {
  month: string;
  month_start: string;
  wellness_index_score: number;
  ai_stress: number;
  ai_fatigue: number;
  ai_recovery: number;
  ai_cognitive_load: number;
  mental_score: number;
  scan_count: number;
}

export default function EmployeeDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [evolutionData, setEvolutionData] = useState<EvolutionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingEvolution, setLoadingEvolution] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [ranges, setRanges] = useState<Record<string, Record<string, [number, number]>>>({});

  async function loadDashboardData() {
    try {
      console.log('📊 [Employee Dashboard] Loading data...');

      // Fetch biometric indicator ranges
      const rangesData = await apiClient.getBiometricIndicatorRanges();
      setRanges(rangesData);

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
          department_name: Array.isArray(profile.departments) ? profile.departments[0]?.name : profile.departments?.name,
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

      console.log('✅ [Employee Dashboard] Data loaded');
      setData(dashboardData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function loadEvolutionData() {
    try {
      console.log('📈 [Employee Dashboard] Loading evolution data (6 months)...');
      setLoadingEvolution(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('❌ [Employee Dashboard] No user found');
        return;
      }

      console.log('📊 [Employee Dashboard] Fetching from: /api/v1/dashboards/employee/evolution?months=6');
      console.log('📊 [Employee Dashboard] Using user_id as Bearer token:', user.id);
      
      // Use user_id as Bearer token (NOT JWT)
      const response = await fetch('/api/v1/dashboards/employee/evolution?months=6', {
        headers: {
          'Authorization': `Bearer ${user.id}`
        }
      });

      console.log('📊 [Employee Dashboard] Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [Employee Dashboard] API error:', errorText);
        throw new Error(`Failed to fetch evolution data: ${response.status}`);
      }

      const result = await response.json();
      console.log('📊 [Employee Dashboard] API Response:', result);
      console.log('📊 [Employee Dashboard] Data array length:', result.data?.length || 0);
      
      if (result.data && result.data.length > 0) {
        console.log('📊 [Employee Dashboard] Sample data point:', result.data[0]);
      } else {
        console.warn('⚠️ [Employee Dashboard] No evolution data returned from API');
      }

      setEvolutionData(result.data || []);
      console.log('✅ [Employee Dashboard] Evolution data loaded:', result.data?.length || 0, 'points');
    } catch (error) {
      console.error('❌ [Employee Dashboard] Error loading evolution data:', error);
    } finally {
      setLoadingEvolution(false);
    }
  }

  useEffect(() => {
    loadDashboardData();
    loadEvolutionData();
  }, []);

  const handleRefresh = () => {
    console.log('🔄 [Employee Dashboard] Manual refresh triggered');
    setRefreshing(true);
    loadDashboardData();
    loadEvolutionData();
  };

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
          <div className="flex items-center justify-between mb-4">
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
          
          {/* Last Updated & Refresh Button */}
          <div className="flex items-center justify-between pt-4 border-t border-sky-400">
            <div className="flex items-center gap-2 text-sm text-sky-100">
              <Clock className="h-4 w-4" />
              <span>
                Última actualización: {lastUpdated ? lastUpdated.toLocaleTimeString('es-ES') : 'N/A'}
              </span>
            </div>
            <Button 
              onClick={handleRefresh} 
              disabled={refreshing} 
              variant="secondary" 
              size="sm"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
          </div>
        </Card>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Evolution Chart */}
        <Card className="bg-white rounded-xl shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Mi Evolución Personal (Últimos 6 meses)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingEvolution ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : evolutionData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={evolutionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis domain={[0, 100]} />
                  <Tooltip 
                    formatter={(value: number) => value.toFixed(1)}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="wellness_index_score" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="Índice de Bienestar"
                    dot={{ fill: '#3b82f6' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="ai_stress" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    name="Estrés"
                    dot={{ fill: '#ef4444' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="ai_fatigue" 
                    stroke="#f97316" 
                    strokeWidth={2}
                    name="Fatiga"
                    dot={{ fill: '#f97316' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="ai_recovery" 
                    stroke="#22c55e" 
                    strokeWidth={2}
                    name="Recuperación"
                    dot={{ fill: '#22c55e' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="font-medium">No hay suficientes datos para mostrar la evolución</p>
                <p className="text-sm mt-2">Realiza más escaneos durante varios meses para ver tu progreso</p>
                <p className="text-xs mt-2 text-gray-400">
                  Datos disponibles: {data.total_scans} escaneos
                </p>
              </div>
            )}
          </CardContent>
        </Card>

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
        ))}
      </div>
    </div>
  );
}