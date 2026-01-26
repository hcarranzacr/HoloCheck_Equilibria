import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, TrendingUp } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import SectionHeader from '@/components/dashboard/SectionHeader';
import BiometricGaugeWithInfo from '@/components/dashboard/BiometricGaugeWithInfo';
import { getWellnessColor, getWellnessStatusString } from '@/lib/biometric-utils';

interface OrgMeasurement {
  id: string;
  user_id: string;
  created_at: string;
  wellness_index_score: number;
  mental_score: number;
  physiological_score: number;
  vital_index_score: number;
  heart_rate: number;
  ai_stress: number;
  ai_fatigue: number;
  ai_cognitive_load: number;
  ai_recovery: number;
  mental_stress_index: number;
  user_profile?: {
    full_name: string;
    email: string;
    department_name?: string;
  };
}

export default function HRMeasurements() {
  const [measurements, setMeasurements] = useState<OrgMeasurement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMeasurements();
  }, []);

  async function loadMeasurements() {
    try {
      setLoading(true);

      // Get current user's organization
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error('User not authenticated:', userError);
        return;
      }

      // Get user profile to find organization_id
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();

      if (profileError || !profile?.organization_id) {
        console.error('Error loading profile:', profileError);
        return;
      }

      // Get all users in organization
      const { data: orgUsers, error: usersError } = await supabase
        .from('user_profiles')
        .select('user_id, full_name, email, departments(name)')
        .eq('organization_id', profile.organization_id);

      if (usersError) {
        console.error('Error loading users:', usersError);
        return;
      }

      // Get recent measurements for all organization users
      const userIds = orgUsers?.map(u => u.user_id) || [];
      const { data: scans, error: scansError } = await supabase
        .from('biometric_measurements')
        .select('*')
        .in('user_id', userIds)
        .order('created_at', { ascending: false })
        .limit(100);

      if (scansError) {
        console.error('Error loading measurements:', scansError);
        return;
      }

      // Map user profiles to measurements
      const measurementsWithProfiles = scans?.map(scan => ({
        ...scan,
        user_profile: {
          ...orgUsers?.find(u => u.user_id === scan.user_id),
          department_name: orgUsers?.find(u => u.user_id === scan.user_id)?.departments?.name
        }
      })) || [];

      console.log('✅ Loaded', measurementsWithProfiles.length, 'organization measurements');
      setMeasurements(measurementsWithProfiles);
    } catch (error) {
      console.error('Error loading measurements:', error);
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

  // Calculate organization averages
  const avgWellness = measurements.length > 0
    ? measurements.reduce((acc, m) => acc + (m.wellness_index_score || 0), 0) / measurements.length
    : 0;
  const avgStress = measurements.length > 0
    ? measurements.reduce((acc, m) => acc + (m.ai_stress || 0), 0) / measurements.length
    : 0;
  const avgFatigue = measurements.length > 0
    ? measurements.reduce((acc, m) => acc + (m.ai_fatigue || 0), 0) / measurements.length
    : 0;
  const avgRecovery = measurements.length > 0
    ? measurements.reduce((acc, m) => acc + (m.ai_recovery || 0), 0) / measurements.length
    : 0;
  const avgCognitiveLoad = measurements.length > 0
    ? measurements.reduce((acc, m) => acc + (m.ai_cognitive_load || 0), 0) / measurements.length
    : 0;
  const avgHeartRate = measurements.length > 0
    ? measurements.reduce((acc, m) => acc + (m.heart_rate || 0), 0) / measurements.length
    : 0;
  const avgMentalScore = measurements.length > 0
    ? measurements.reduce((acc, m) => acc + (m.mental_score || 0), 0) / measurements.length
    : 0;
  const avgPhysiologicalScore = measurements.length > 0
    ? measurements.reduce((acc, m) => acc + (m.physiological_score || 0), 0) / measurements.length
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-5">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <Card className="bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-2xl shadow-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                📊 Mediciones Organizacionales
              </h1>
              <p className="text-violet-100">
                Indicadores de salud de toda la organización
              </p>
            </div>
            <div className="text-right">
              <div className="text-5xl font-bold">{measurements.length}</div>
              <div className="text-sm text-violet-100">Escaneos Recientes</div>
            </div>
          </div>
        </Card>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Organization Averages */}
        <div>
          <SectionHeader
            title="Promedios Organizacionales"
            description="Indicadores principales de toda la organización"
            metricCount={8}
            icon="📈"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <BiometricGaugeWithInfo
              value={avgWellness}
              indicatorCode="global_health_score"
              label="Bienestar Promedio"
            />

            <BiometricGaugeWithInfo
              value={avgStress}
              indicatorCode="mental_stress_index"
              label="Estrés Promedio"
            />

            <BiometricGaugeWithInfo
              value={avgFatigue}
              indicatorCode="mental_score"
              label="Fatiga Promedio"
            />

            <BiometricGaugeWithInfo
              value={avgCognitiveLoad}
              indicatorCode="mental_score"
              label="Carga Cognitiva"
            />

            <BiometricGaugeWithInfo
              value={avgRecovery}
              indicatorCode="physical_score"
              label="Recuperación"
            />

            <BiometricGaugeWithInfo
              value={avgHeartRate}
              indicatorCode="heart_rate"
              label="Frecuencia Cardíaca"
            />

            <BiometricGaugeWithInfo
              value={avgMentalScore}
              indicatorCode="mental_score"
              label="Salud Mental"
            />

            <BiometricGaugeWithInfo
              value={avgPhysiologicalScore}
              indicatorCode="physiological_score"
              label="Score Fisiológico"
            />
          </div>
        </div>

        {/* Recent Measurements */}
        <div>
          <SectionHeader
            title="Mediciones Recientes"
            description={`Últimas ${measurements.length} mediciones de la organización`}
            metricCount={measurements.length}
            icon="📋"
          />

          <div className="grid grid-cols-1 gap-4">
            {measurements.length === 0 ? (
              <Card className="bg-white rounded-2xl p-12 text-center">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No hay mediciones registradas
                </h3>
                <p className="text-gray-500">
                  Las mediciones de la organización aparecerán aquí
                </p>
              </Card>
            ) : (
              measurements.map((measurement) => (
                <Card key={measurement.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">
                          {measurement.user_profile?.full_name || 'Usuario'}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          {measurement.user_profile?.department_name || 'Sin departamento'} • {new Date(measurement.created_at).toLocaleString('es-ES')}
                        </CardDescription>
                      </div>
                      <Badge 
                        style={{ 
                          backgroundColor: getWellnessColor(measurement.wellness_index_score),
                          color: 'white'
                        }}
                      >
                        {getWellnessStatusString(measurement.wellness_index_score)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-sm">
                      <div>
                        <div className="text-gray-500 text-xs">Bienestar</div>
                        <div className="text-xl font-bold" style={{ color: getWellnessColor(measurement.wellness_index_score) }}>
                          {measurement.wellness_index_score?.toFixed(1) || 'N/A'}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500 text-xs">Estrés</div>
                        <div className="text-xl font-bold">{measurement.ai_stress?.toFixed(1) || 'N/A'}</div>
                      </div>
                      <div>
                        <div className="text-gray-500 text-xs">Fatiga</div>
                        <div className="text-xl font-bold">{measurement.ai_fatigue?.toFixed(1) || 'N/A'}</div>
                      </div>
                      <div>
                        <div className="text-gray-500 text-xs">Carga Cognitiva</div>
                        <div className="text-xl font-bold">{measurement.ai_cognitive_load?.toFixed(1) || 'N/A'}</div>
                      </div>
                      <div>
                        <div className="text-gray-500 text-xs">Recuperación</div>
                        <div className="text-xl font-bold">{measurement.ai_recovery?.toFixed(1) || 'N/A'}</div>
                      </div>
                      <div>
                        <div className="text-gray-500 text-xs">FC</div>
                        <div className="text-xl font-bold">{measurement.heart_rate?.toFixed(0) || 'N/A'} bpm</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}