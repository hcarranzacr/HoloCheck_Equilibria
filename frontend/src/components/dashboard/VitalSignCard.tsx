import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface VitalSignCardProps {
  value: number;
  unit: string;
  label: string;
  status: string;
  statusColor: string;
  min: number;
  max: number;
  optimalRange: [number, number];
  icon: string;
  showProgressBar?: boolean;
}

const VitalSignCard: React.FC<VitalSignCardProps> = ({
  value,
  unit,
  label,
  status,
  statusColor,
  min,
  max,
  optimalRange,
  icon,
  showProgressBar = true
}) => {
  // Calculate percentages
  const percentage = ((value - min) / (max - min)) * 100;
  const optimalStart = ((optimalRange[0] - min) / (max - min)) * 100;
  const optimalEnd = ((optimalRange[1] - min) / (max - min)) * 100;
  
  // Format value display
  const formatValue = (val: number): string => {
    if (val < 100) return val.toFixed(2);
    return val.toFixed(1);
  };
  
  return (
    <Card className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{icon}</span>
          <h3 className="text-lg font-semibold text-gray-900">{label}</h3>
        </div>
        <Badge 
          className="text-sm"
          style={{ 
            backgroundColor: `${statusColor}20`, 
            color: statusColor,
            border: `1px solid ${statusColor}40`
          }}
        >
          {status}
        </Badge>
      </div>
      
      {/* Main value display */}
      <div className="text-center mb-4">
        <div className="text-5xl font-bold text-gray-900">
          {formatValue(value)}
        </div>
        <div className="text-sm font-medium text-gray-500 mt-1">{unit}</div>
      </div>
      
      {/* Progress bar with range */}
      {showProgressBar && (
        <div className="relative">
          {/* Background bar with gradient */}
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden relative">
            <div 
              className="absolute h-full bg-gradient-to-r from-blue-400 via-green-500 to-red-500"
              style={{ width: '100%' }}
            />
            
            {/* Optimal range overlay */}
            <div 
              className="absolute h-full bg-green-500 opacity-30"
              style={{ 
                left: `${optimalStart}%`, 
                width: `${optimalEnd - optimalStart}%` 
              }}
            />
            
            {/* Current value indicator */}
            <div 
              className="absolute top-0 h-full w-1 bg-gray-900 shadow-lg transition-all duration-500"
              style={{ left: `${Math.min(100, Math.max(0, percentage))}%` }}
            />
          </div>
          
          {/* Range labels */}
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>{min}</span>
            <span className="font-medium text-green-600">
              {optimalRange[0]}-{optimalRange[1]} (Normal)
            </span>
            <span>{max}</span>
          </div>
        </div>
      )}
    </Card>
  );
};

export default VitalSignCard;