import { useState, useEffect } from 'react';
import { useHealthCheck } from '@/hooks/useHealthCheck';
import { useTranslation } from 'react-i18next';
import HealthStatusButton from './HealthStatusButton';
import HealthStatusPopup from './HealthStatusPopup';
import { logger } from '@/lib/logger';

export default function HealthStatusIndicator() {
  const [isExpanded, setIsExpanded] = useState(false);
  const { health, loading, refresh } = useHealthCheck({
    autoRefresh: true,
    refreshInterval: 90000 // 90 seconds to avoid server overload
  });
  const { t } = useTranslation();

  useEffect(() => {
    logger.componentMount('HealthStatusIndicator');
    return () => logger.componentUnmount('HealthStatusIndicator');
  }, []);

  useEffect(() => {
    if (health) {
      logger.componentUpdate('HealthStatusIndicator', 'Health status updated', {
        overall: health.overall,
        services: Object.entries(health.services).map(([name, service]) => ({
          name,
          status: service.status,
        })),
      });
    }
  }, [health]);

  // Close popup on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isExpanded) {
        logger.debug('HealthStatusIndicator', 'Closing popup (Escape key)');
        setIsExpanded(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isExpanded]);

  if (!health && loading) {
    logger.debug('HealthStatusIndicator', 'Initial load, not rendering yet');
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

  const handleToggle = () => {
    const newState = !isExpanded;
    logger.info('HealthStatusIndicator', `Popup ${newState ? 'opened' : 'closed'}`);
    setIsExpanded(newState);
  };

  const handleRefresh = () => {
    logger.info('HealthStatusIndicator', 'User triggered manual refresh');
    refresh();
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <HealthStatusButton
          status={overallStatus}
          onClick={handleToggle}
          tooltip={getStatusMessage(overallStatus)}
          isExpanded={isExpanded}
        />
      </div>

      {isExpanded && (
        <HealthStatusPopup
          health={health}
          onClose={() => {
            logger.info('HealthStatusIndicator', 'Popup closed');
            setIsExpanded(false);
          }}
          onRefresh={handleRefresh}
          loading={loading}
        />
      )}
    </>
  );
}