import { useState, useEffect, useMemo } from 'react';
import { apiClient } from '@/lib/api-client';
import { format } from 'date-fns';

interface BiometricMeasurement {
  id: string;
  user_id: string;
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

interface AggregatedBiometrics {
  avgHeartRate: number;
  avgStress: number;
  avgFatigue: number;
  avgRecovery: number;
  avgBioAge: number;
}

interface BiometricTrends {
  stressTrend: 'up' | 'down' | 'stable';
  fatigueTrend: 'up' | 'down' | 'stable';
  recoveryTrend: 'up' | 'down' | 'stable';
}

export function useBiometricData(
  userId?: string,
  departmentId?: string,
  dateRange?: { start: Date; end: Date }
) {
  const [measurements, setMeasurements] = useState<BiometricMeasurement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMeasurements();
  }, [userId, departmentId]);

  async function loadMeasurements() {
    try {
      setLoading(true);
      if (userId) {
        const data = await apiClient.getMeasurementHistory(userId, 100);
        setMeasurements(data as BiometricMeasurement[]);
      } else {
        setMeasurements([]);
      }
    } catch (error) {
      console.error('Error loading measurements:', error);
      setMeasurements([]);
    } finally {
      setLoading(false);
    }
  }

  const aggregated = useMemo<AggregatedBiometrics>(() => {
    if (!measurements || measurements.length === 0) {
      return {
        avgHeartRate: 0,
        avgStress: 0,
        avgFatigue: 0,
        avgRecovery: 0,
        avgBioAge: 0
      };
    }

    const sum = measurements.reduce(
      (acc, m) => ({
        heartRate: acc.heartRate + (m.heart_rate || 0),
        stress: acc.stress + (m.ai_stress || 0),
        fatigue: acc.fatigue + (m.ai_fatigue || 0),
        recovery: acc.recovery + (m.ai_recovery || 0),
        bioAge: acc.bioAge + (m.bio_age_basic || 0)
      }),
      { heartRate: 0, stress: 0, fatigue: 0, recovery: 0, bioAge: 0 }
    );

    const count = measurements.length;

    return {
      avgHeartRate: Math.round(sum.heartRate / count),
      avgStress: Math.round(sum.stress / count),
      avgFatigue: Math.round(sum.fatigue / count),
      avgRecovery: Math.round(sum.recovery / count),
      avgBioAge: Math.round(sum.bioAge / count)
    };
  }, [measurements]);

  const trends = useMemo<BiometricTrends>(() => {
    if (!measurements || measurements.length < 2) {
      return {
        stressTrend: 'stable',
        fatigueTrend: 'stable',
        recoveryTrend: 'stable'
      };
    }

    const recent = measurements.slice(0, Math.floor(measurements.length / 2));
    const older = measurements.slice(Math.floor(measurements.length / 2));

    const recentAvg = {
      stress: recent.reduce((sum, m) => sum + (m.ai_stress || 0), 0) / recent.length,
      fatigue: recent.reduce((sum, m) => sum + (m.ai_fatigue || 0), 0) / recent.length,
      recovery: recent.reduce((sum, m) => sum + (m.ai_recovery || 0), 0) / recent.length
    };

    const olderAvg = {
      stress: older.reduce((sum, m) => sum + (m.ai_stress || 0), 0) / older.length,
      fatigue: older.reduce((sum, m) => sum + (m.ai_fatigue || 0), 0) / older.length,
      recovery: older.reduce((sum, m) => sum + (m.ai_recovery || 0), 0) / older.length
    };

    const getTrend = (recent: number, older: number): 'up' | 'down' | 'stable' => {
      const diff = recent - older;
      if (Math.abs(diff) < 5) return 'stable';
      return diff > 0 ? 'up' : 'down';
    };

    return {
      stressTrend: getTrend(recentAvg.stress, olderAvg.stress),
      fatigueTrend: getTrend(recentAvg.fatigue, olderAvg.fatigue),
      recoveryTrend: getTrend(recentAvg.recovery, olderAvg.recovery)
    };
  }, [measurements]);

  const getChartData = (biomarker: keyof BiometricMeasurement) => {
    if (!measurements) return [];

    return measurements
      .slice(0, 30) // Últimos 30 registros
      .reverse()
      .map(m => ({
        date: format(new Date(m.created_at), 'dd/MM'),
        value: m[biomarker] as number || 0
      }));
  };

  return {
    measurements: measurements || [],
    aggregated,
    trends,
    loading,
    refetch: loadMeasurements,
    getChartData
  };
}