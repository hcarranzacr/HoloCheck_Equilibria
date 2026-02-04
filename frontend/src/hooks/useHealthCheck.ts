/**
 * Health Check Hook
 * Auto-refresh interval: 90 seconds (to avoid server overload)
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { SystemHealth } from '@/types/health-status';
import { performHealthCheck } from '@/lib/health-check';

interface UseHealthCheckOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseHealthCheckReturn {
  health: SystemHealth | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

const CACHE_DURATION = 30000; // 30 seconds cache
const DEFAULT_REFRESH_INTERVAL = 90000; // 90 seconds (user specified)

export function useHealthCheck(options: UseHealthCheckOptions = {}): UseHealthCheckReturn {
  const {
    autoRefresh = false,
    refreshInterval = DEFAULT_REFRESH_INTERVAL
  } = options;

  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const cacheRef = useRef<{ data: SystemHealth; timestamp: number } | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const refresh = useCallback(async () => {
    // Check cache first
    if (cacheRef.current) {
      const age = Date.now() - cacheRef.current.timestamp;
      if (age < CACHE_DURATION) {
        console.log('🔄 [HealthCheck] Using cached data');
        setHealth(cacheRef.current.data);
        setLoading(false);
        return;
      }
    }

    try {
      setLoading(true);
      setError(null);
      
      const result = await performHealthCheck();
      
      // Update cache
      cacheRef.current = {
        data: result,
        timestamp: Date.now()
      };
      
      setHealth(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Health check failed');
      setError(error);
      console.error('❌ [HealthCheck] Error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial check
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Auto-refresh setup (90 seconds interval)
  useEffect(() => {
    if (!autoRefresh) return;

    console.log(`⏰ [HealthCheck] Auto-refresh enabled (every ${refreshInterval / 1000}s)`);
    
    intervalRef.current = setInterval(() => {
      console.log('🔄 [HealthCheck] Auto-refresh triggered');
      refresh();
    }, refreshInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        console.log('⏹️ [HealthCheck] Auto-refresh stopped');
      }
    };
  }, [autoRefresh, refreshInterval, refresh]);

  return {
    health,
    loading,
    error,
    refresh
  };
}