/**
 * Health Status Types and Configurations
 */

export type HealthStatusLevel = 'green' | 'amber' | 'red' | 'grey';

export interface ServiceHealth {
  name: string;
  status: HealthStatusLevel;
  responseTime?: number;
  message: string;
  details?: any;
  lastChecked: Date;
  connected: boolean;
  error?: string;
  lastSuccessful?: Date;
}

export interface SystemHealth {
  overall: HealthStatusLevel;
  services: {
    frontend: ServiceHealth;
    backend: ServiceHealth;
    database: ServiceHealth;
    auth: ServiceHealth;
  };
  lastUpdated: Date;
}

export interface HealthCheckConfig {
  endpoint: string;
  timeout: number;
  thresholds: {
    green: number;
    amber: number;
  };
}

// Health check configurations optimized for database-intensive application
export const HEALTH_CHECK_CONFIGS: Record<string, HealthCheckConfig> = {
  backend: {
    endpoint: '/api/v1/health',
    timeout: 5000,
    thresholds: { green: 500, amber: 3000 }
  },
  database: {
    endpoint: '/api/v1/health/database',
    timeout: 10000,  // 10 seconds for intensive database operations
    thresholds: { 
      green: 1000,   // 0-1s: Excellent performance
      amber: 5000    // 1-5s: Normal for database-intensive application
    }
  },
  auth: {
    endpoint: '/api/v1/health/auth',
    timeout: 5000,
    thresholds: { green: 1000, amber: 4000 }
  }
};

// Status colors for UI
export const STATUS_COLORS = {
  green: {
    bg: 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)',
    border: 'rgba(16, 185, 129, 0.3)',
    shadow: 'rgba(16, 185, 129, 0.25)',
    glow: 'rgba(16, 185, 129, 0.4)',
    icon: '#059669',
    badge: '#10B981'
  },
  amber: {
    bg: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
    border: 'rgba(245, 158, 11, 0.3)',
    shadow: 'rgba(245, 158, 11, 0.25)',
    glow: 'rgba(245, 158, 11, 0.4)',
    icon: '#D97706',
    badge: '#F59E0B'
  },
  red: {
    bg: 'linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)',
    border: 'rgba(239, 68, 68, 0.3)',
    shadow: 'rgba(239, 68, 68, 0.25)',
    glow: 'rgba(239, 68, 68, 0.4)',
    icon: '#DC2626',
    badge: '#EF4444'
  },
  grey: {
    bg: 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)',
    border: 'rgba(107, 114, 128, 0.2)',
    shadow: 'rgba(107, 114, 128, 0.2)',
    glow: 'rgba(107, 114, 128, 0.3)',
    icon: '#4B5563',
    badge: '#6B7280'
  }
};