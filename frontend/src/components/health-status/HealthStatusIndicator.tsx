import { useState, useEffect } from 'react';
import { useHealthCheck } from '@/hooks/useHealthCheck';
import { useTranslation } from 'react-i18next';
import HealthStatusButton from './HealthStatusButton';
import HealthStatusPopup from './HealthStatusPopup';

export default function HealthStatusIndicator() {
  const [isExpanded, setIsExpanded] = useState(false);
  const { health, loading, refresh } = useHealthCheck({
    autoRefresh: true,
    refreshInterval: 90000 // 90 seconds to avoid server overload
  });
  const { t } = useTranslation();

  // Close popup on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isExpanded) {
        setIsExpanded(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isExpanded]);

  if (!health && loading) {
    return null; // Don't show until first check completes
  }

  const overallStatus = health?.overall || 'grey';

  const getStatusMessage = (status: string): string => {
    switch (status) {
      case 'green':
        return t('healthStatus.allSystemsOperational');
      case 'amber':
        return t('healthStatus.systemDegraded');
      case 'red':
        return t('healthStatus.systemDown');
      default:
        return t('healthStatus.statusUnknown');
    }
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <HealthStatusButton
          status={overallStatus}
          onClick={() => setIsExpanded(!isExpanded)}
          tooltip={getStatusMessage(overallStatus)}
          isExpanded={isExpanded}
        />
      </div>

      {isExpanded && (
        <HealthStatusPopup
          health={health}
          onClose={() => setIsExpanded(false)}
          onRefresh={refresh}
          loading={loading}
        />
      )}
    </>
  );
}