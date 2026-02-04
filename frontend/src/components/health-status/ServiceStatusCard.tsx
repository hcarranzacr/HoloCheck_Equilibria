import { Activity, Database, Lock, Globe } from 'lucide-react';
import type { ServiceHealth } from '@/types/health-status';
import { STATUS_COLORS } from '@/types/health-status';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

interface ServiceStatusCardProps {
  service: ServiceHealth;
}

const SERVICE_ICONS = {
  'Frontend': Globe,
  'Backend API': Activity,
  'Database': Database,
  'Authentication': Lock
};

export default function ServiceStatusCard({ service }: ServiceStatusCardProps) {
  const colors = STATUS_COLORS[service.status];
  const Icon = SERVICE_ICONS[service.name as keyof typeof SERVICE_ICONS] || Activity;

  return (
    <div
      className="p-4 rounded-xl border-2 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02]"
      style={{
        background: colors.bg,
        borderColor: colors.border,
        boxShadow: `0 4px 12px ${colors.shadow}`
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className="p-2 rounded-lg"
            style={{ backgroundColor: `${colors.icon}20` }}
          >
            <Icon
              className="w-5 h-5"
              style={{ color: colors.icon }}
              strokeWidth={2}
            />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{service.name}</h3>
            <p className="text-xs text-gray-600">{service.message}</p>
          </div>
        </div>
        
        {/* Connection status badge */}
        {service.connected ? (
          <Badge variant="default" className="bg-green-100 text-green-700 border-green-300">
            Connected
          </Badge>
        ) : (
          <Badge variant="destructive">
            Disconnected
          </Badge>
        )}
      </div>

      <div className="space-y-2">
        {/* Response time */}
        {service.responseTime !== undefined && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Response time:</span>
            <span className="font-medium text-gray-900">
              {service.responseTime}ms
            </span>
          </div>
        )}

        {/* Last checked */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Last checked:</span>
          <span className="font-medium text-gray-900">
            {formatDistanceToNow(service.lastChecked, { addSuffix: true })}
          </span>
        </div>

        {/* Last successful (if disconnected) */}
        {!service.connected && service.lastSuccessful && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Last successful:</span>
            <span className="font-medium text-gray-900">
              {formatDistanceToNow(service.lastSuccessful, { addSuffix: true })}
            </span>
          </div>
        )}

        {/* Error message (if any) */}
        {service.error && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
            {service.error}
          </div>
        )}
      </div>
    </div>
  );
}