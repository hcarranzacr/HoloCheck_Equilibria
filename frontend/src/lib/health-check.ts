/**
 * Health Check Logic - PRIORITY: CONNECTIVITY FIRST
 * 
 * Status determination logic:
 * 🔴 RED: Connection failed (timeout, network error)
 * 🟡 AMBER: Connected but slow or HTTP error
 * 🟢 GREEN: Connected and fast
 */

import type { SystemHealth, ServiceHealth, HealthStatusLevel, HealthCheckConfig } from '@/types/health-status';
import { HEALTH_CHECK_CONFIGS } from '@/types/health-status';

/**
 * Check a service endpoint for connectivity and performance
 * CRITICAL: Prioritizes connectivity over response time
 */
async function checkService(
  name: string,
  config: HealthCheckConfig
): Promise<ServiceHealth> {
  const startTime = performance.now();
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeout);
    
    const response = await fetch(config.endpoint, {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' }
    });
    
    clearTimeout(timeoutId);
    const endTime = performance.now();
    const responseTime = Math.round(endTime - startTime);
    
    // CONNECTIVITY SUCCESSFUL - now evaluate performance
    if (!response.ok) {
      // Connected but HTTP error - AMBER (not red)
      return {
        name,
        status: 'amber',
        responseTime,
        message: `Connected but HTTP ${response.status}`,
        lastChecked: new Date(),
        connected: true,
        lastSuccessful: new Date()
      };
    }
    
    const data = await response.json();
    const status = determineStatus(responseTime, config.thresholds);
    
    return {
      name,
      status,
      responseTime,
      message: status === 'green' ? 'Connected and operational' : 'Connected but experiencing delays',
      details: data,
      lastChecked: new Date(),
      connected: true,
      lastSuccessful: new Date()
    };
    
  } catch (error) {
    const endTime = performance.now();
    const responseTime = Math.round(endTime - startTime);
    const isTimeout = error instanceof Error && error.name === 'AbortError';
    
    // CONNECTIVITY FAILURE - RED
    return {
      name,
      status: 'red',
      responseTime: isTimeout ? config.timeout : responseTime,
      message: isTimeout ? 'Connection timeout' : 'Connection failed',
      lastChecked: new Date(),
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Determine status based on response time
 * Only called when connection is successful
 */
function determineStatus(
  responseTime: number,
  thresholds: { green: number; amber: number }
): HealthStatusLevel {
  if (responseTime <= thresholds.green) return 'green';
  if (responseTime <= thresholds.amber) return 'amber';
  return 'amber'; // Slow but connected = amber (not red)
}

/**
 * Check frontend health
 */
function checkFrontendHealth(): ServiceHealth {
  try {
    const hasErrors = (window as any).__APP_ERRORS__?.length > 0;
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const loadTime = navigation ? Math.round(navigation.loadEventEnd - navigation.fetchStart) : 0;
    
    let status: HealthStatusLevel = 'green';
    let message = 'Connected and operational';
    
    if (hasErrors) {
      status = 'red';
      message = 'Critical errors detected';
    } else if (loadTime > 5000) {
      status = 'amber';
      message = 'Connected but slow load time';
    } else if (loadTime > 2000) {
      status = 'amber';
      message = 'Connected and operational';
    }
    
    return {
      name: 'Frontend',
      status,
      responseTime: loadTime,
      message,
      lastChecked: new Date(),
      connected: !hasErrors,
      lastSuccessful: new Date()
    };
  } catch (error) {
    return {
      name: 'Frontend',
      status: 'grey',
      message: 'Unable to determine connectivity',
      lastChecked: new Date(),
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Perform complete health check on all services
 */
export async function performHealthCheck(): Promise<SystemHealth> {
  console.log('🏥 [HealthCheck] Starting connectivity check...');
  
  const [frontend, backend, database, auth] = await Promise.all([
    Promise.resolve(checkFrontendHealth()),
    checkService('Backend API', HEALTH_CHECK_CONFIGS.backend),
    checkService('Database', HEALTH_CHECK_CONFIGS.database),
    checkService('Authentication', HEALTH_CHECK_CONFIGS.auth)
  ]);
  
  const services = { frontend, backend, database, auth };
  const overall = aggregateHealth(services);
  
  console.log('✅ [HealthCheck] Health check complete:', {
    overall,
    services: Object.entries(services).map(([key, value]) => ({
      name: key,
      status: value.status,
      connected: value.connected,
      responseTime: value.responseTime
    }))
  });
  
  return {
    overall,
    services,
    lastUpdated: new Date()
  };
}

/**
 * Aggregate health status across all services
 * Priority: red > amber > grey > green
 */
function aggregateHealth(services: SystemHealth['services']): HealthStatusLevel {
  const statuses = Object.values(services).map(s => s.status);
  
  // Any disconnected service = red
  if (statuses.some(s => s === 'red')) return 'red';
  // Any degraded service = amber
  if (statuses.some(s => s === 'amber')) return 'amber';
  // All operational = green
  if (statuses.every(s => s === 'green')) return 'green';
  // Unknown state
  return 'grey';
}