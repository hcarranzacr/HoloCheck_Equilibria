import { useState, useEffect, useCallback, useRef } from 'react';
import type { SystemHealth, ServiceStatus } from '@/types/health-status';
import { logger } from '@/lib/logger';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001';

interface UseHealthCheckOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseHealthCheckReturn {
  health: SystemHealth | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useHealthCheck(options: UseHealthCheckOptions = {}): UseHealthCheckReturn {
  const { autoRefresh = false, refreshInterval = 90000 } = options;
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const checkService = async (name: string, url: string): Promise<ServiceStatus> => {
    logger.debug('HealthCheck', `Checking ${name} at ${url}`);
    
    try {
      const startTime = Date.now();
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const responseTime = Date.now() - startTime;

      const isHealthy = response.ok;
      const status = isHealthy ? 'green' : 'red';

      logger.info('HealthCheck', `${name}: ${status} (${responseTime}ms)`, {
        url,
        status: response.status,
        responseTime,
      });

      return {
        name,
        status,
        message: isHealthy ? 'Operational' : `HTTP ${response.status}`,
        responseTime,
      };
    } catch (err) {
      logger.error('HealthCheck', `${name} check failed`, {
        url,
        error: err instanceof Error ? err.message : 'Unknown error',
      });

      return {
        name,
        status: 'red',
        message: err instanceof Error ? err.message : 'Connection failed',
        responseTime: 0,
      };
    }
  };

  const performHealthCheck = useCallback(async () => {
    logger.info('HealthCheck', 'Starting health check...');
    setLoading(true);
    setError(null);

    try {
      // Check all services in parallel
      const [frontend, backend, database, auth] = await Promise.all([
        checkService('Frontend', window.location.origin),
        checkService('Backend API', `${API_BASE_URL}/health`),
        checkService('Database', `${API_BASE_URL}/api/v1/auth/health`),
        checkService('Auth Service', `${API_BASE_URL}/api/v1/auth/health`),
      ]);

      // Determine overall status
      const services = { frontend, backend, database, auth };
      const statuses = Object.values(services).map(s => s.status);
      
      let overall: 'green' | 'amber' | 'red' = 'green';
      if (statuses.includes('red')) {
        overall = statuses.filter(s => s === 'red').length > 1 ? 'red' : 'amber';
      } else if (statuses.includes('amber')) {
        overall = 'amber';
      }

      const systemHealth: SystemHealth = {
        overall,
        services,
        lastUpdated: new Date(),
      };

      logger.info('HealthCheck', `✓ Health check complete: ${overall}`, {
        frontend: frontend.status,
        backend: backend.status,
        database: database.status,
        auth: auth.status,
      });

      setHealth(systemHealth);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Health check failed';
      logger.error('HealthCheck', 'Health check error', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    logger.info('HealthCheck', 'Manual refresh triggered');
    await performHealthCheck();
  }, [performHealthCheck]);

  // Initial check
  useEffect(() => {
    logger.componentMount('useHealthCheck', { autoRefresh, refreshInterval });
    performHealthCheck();

    return () => {
      logger.componentUnmount('useHealthCheck');
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [performHealthCheck]);

  // Auto-refresh
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      logger.info('HealthCheck', `Auto-refresh enabled (${refreshInterval}ms)`);
      
      intervalRef.current = setInterval(() => {
        logger.debug('HealthCheck', 'Auto-refresh triggered');
        performHealthCheck();
      }, refreshInterval);

      return () => {
        if (intervalRef.current) {
          logger.debug('HealthCheck', 'Auto-refresh disabled');
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [autoRefresh, refreshInterval, performHealthCheck]);

  return { health, loading, error, refresh };
}