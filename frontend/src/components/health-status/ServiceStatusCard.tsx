import { CheckCircle2, XCircle, AlertCircle, Clock } from 'lucide-react';
import type { ServiceStatus } from '@/types/health-status';
import { STATUS_COLORS } from '@/types/health-status';
import { formatDistanceToNow } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';

interface ServiceStatusCardProps {
  service: ServiceStatus;
}

export default function ServiceStatusCard({ service }: ServiceStatusCardProps) {
  const { i18n } = useTranslation();
  const colors = STATUS_COLORS[service.status];
  
  const getIcon = () => {
    switch (service.status) {
      case 'green':
        return <CheckCircle2 className="w-5 h-5" style={{ color: colors.icon }} />;
      case 'amber':
        return <AlertCircle className="w-5 h-5" style={{ color: colors.icon }} />;
      case 'red':
        return <XCircle className="w-5 h-5" style={{ color: colors.icon }} />;
      default:
        return <Clock className="w-5 h-5" style={{ color: colors.icon }} />;
    }
  };

  const getStatusText = () => {
    switch (service.status) {
      case 'green':
        return 'Operational';
      case 'amber':
        return 'Degraded';
      case 'red':
        return 'Down';
      default:
        return 'Unknown';
    }
  };

  // Format response time with validation
  const formatResponseTime = () => {
    if (!service.responseTime || service.responseTime === 0) {
      return 'N/A';
    }
    return `${service.responseTime}ms`;
  };

  // Format last checked time with validation
  const formatLastChecked = () => {
    if (!service.lastChecked) {
      return 'Never';
    }

    try {
      const date = new Date(service.lastChecked);
      
      // Validate date
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }

      const locale = i18n.language.startsWith('es') ? es : enUS;
      return formatDistanceToNow(date, { addSuffix: true, locale });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  return (
    <div
      className="flex items-center justify-between p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md"
      style={{
        backgroundColor: colors.bg,
        borderColor: colors.border,
      }}
    >
      <div className="flex items-center gap-3">
        {getIcon()}
        <div>
          <p className="font-semibold text-gray-900">{service.name}</p>
          <p className="text-sm text-gray-600">{service.message}</p>
        </div>
      </div>

      <div className="text-right">
        <p
          className="text-sm font-semibold"
          style={{ color: colors.badge }}
        >
          {getStatusText()}
        </p>
        <p className="text-xs text-gray-500">{formatResponseTime()}</p>
        <p className="text-xs text-gray-400">{formatLastChecked()}</p>
      </div>
    </div>
  );
}