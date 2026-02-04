import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, RefreshCw } from 'lucide-react';
import ServiceStatusCard from './ServiceStatusCard';
import type { SystemHealth } from '@/types/health-status';
import { useTranslation } from 'react-i18next';
import { formatDistanceToNow } from 'date-fns';
import { es, enUS } from 'date-fns/locale';

interface HealthStatusPopupProps {
  health: SystemHealth | null;
  onClose: () => void;
  onRefresh: () => void;
  loading: boolean;
}

export default function HealthStatusPopup({ health, onClose, onRefresh, loading }: HealthStatusPopupProps) {
  const { t, i18n } = useTranslation();

  if (!health) return null;

  const locale = i18n.language.startsWith('es') ? es : enUS;
  const timeAgo = formatDistanceToNow(health.lastUpdated, { addSuffix: true, locale });

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-end p-4 md:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="health-status-title"
    >
      <div
        className="w-full max-w-md animate-slide-up-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="shadow-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle id="health-status-title" className="text-lg font-semibold">
              {t('healthStatus.title')}
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              aria-label="Close"
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>

          <CardContent className="space-y-3">
            {/* Frontend */}
            <ServiceStatusCard service={health.services.frontend} />

            {/* Backend */}
            <ServiceStatusCard service={health.services.backend} />

            {/* Database */}
            <ServiceStatusCard service={health.services.database} />

            {/* Auth */}
            <ServiceStatusCard service={health.services.auth} />

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t">
              <p className="text-xs text-gray-500">
                {t('healthStatus.lastUpdated', { time: timeAgo })}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={loading}
                className="gap-2"
              >
                <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
                {t('healthStatus.refresh')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}