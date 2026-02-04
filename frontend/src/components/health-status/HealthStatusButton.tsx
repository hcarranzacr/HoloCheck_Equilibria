import { useState } from 'react';
import { Activity } from 'lucide-react';
import type { HealthStatusLevel } from '@/types/health-status';
import { STATUS_COLORS } from '@/types/health-status';

interface HealthStatusButtonProps {
  status: HealthStatusLevel;
  onClick: () => void;
  tooltip: string;
  isExpanded: boolean;
}

export default function HealthStatusButton({ 
  status, 
  onClick, 
  tooltip,
  isExpanded 
}: HealthStatusButtonProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const colors = STATUS_COLORS[status];
  const isPulsing = status !== 'green';
  const isHeartbeat = status === 'green';

  return (
    <div className="relative">
      <button
        onClick={onClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
        className={`
          relative group
          w-14 h-14 rounded-2xl cursor-pointer
          backdrop-blur-md border-2
          transition-all duration-300 ease-in-out
          hover:scale-110 hover:rotate-3 active:scale-95
          focus:outline-none focus:ring-4 focus:ring-offset-2
          ${isPulsing ? 'animate-pulse-slow' : ''}
        `}
        style={{
          background: colors.bg,
          borderColor: colors.border,
          boxShadow: `0 8px 32px ${colors.shadow}`
        }}
        aria-label={`System health status: ${tooltip}`}
        aria-expanded={isExpanded}
        role="button"
        tabIndex={0}
      >
        {/* Animated background glow */}
        <div
          className={`
            absolute inset-0 -z-10 rounded-2xl blur-xl opacity-50
            transition-opacity duration-300 group-hover:opacity-75
            ${isPulsing ? 'animate-glow-pulse' : ''}
          `}
          style={{ background: colors.glow }}
          aria-hidden="true"
        />

        {/* Icon container */}
        <div className="relative z-10 flex items-center justify-center w-full h-full">
          <Activity
            className={`
              w-7 h-7 transition-all duration-300 group-hover:scale-110
              ${isHeartbeat ? 'animate-heartbeat' : ''}
            `}
            style={{ color: colors.icon, stroke: colors.icon }}
            strokeWidth={2.5}
            aria-hidden="true"
          />
        </div>

        {/* Status badge */}
        <div
          className={`
            absolute -top-1 -right-1 w-4 h-4 rounded-full
            border-2 border-white transition-all duration-300
            ${isPulsing ? 'animate-ping' : ''}
          `}
          style={{ backgroundColor: colors.badge }}
          aria-hidden="true"
        />
      </button>

      {/* Enhanced tooltip */}
      {showTooltip && (
        <div
          className="absolute bottom-full right-0 mb-3 px-4 py-3 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border-2 whitespace-nowrap z-50 animate-fade-in"
          style={{ borderColor: colors.border }}
          role="tooltip"
        >
          <div className="flex items-center gap-3">
            {/* Status indicator dot */}
            <div
              className={`w-3 h-3 rounded-full ${isPulsing ? 'animate-pulse' : ''}`}
              style={{ backgroundColor: colors.badge }}
            />
            
            {/* Status text */}
            <div>
              <p className="font-semibold text-sm text-gray-900">
                {getStatusTitle(status)}
              </p>
              <p className="text-xs text-gray-600">
                {tooltip}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Click for details
              </p>
            </div>
          </div>
          
          {/* Tooltip arrow */}
          <div 
            className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent"
            style={{ borderTopColor: colors.border }}
          />
        </div>
      )}
    </div>
  );
}

function getStatusTitle(status: HealthStatusLevel): string {
  switch (status) {
    case 'green':
      return 'All Systems Operational';
    case 'amber':
      return 'System Degraded';
    case 'red':
      return 'Connection Failed';
    default:
      return 'Status Unknown';
  }
}