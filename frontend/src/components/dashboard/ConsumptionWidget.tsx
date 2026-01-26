import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface ConsumptionWidgetProps {
  title: string;
  description?: string;
  used: number;
  limit: number;
  type: 'scans' | 'prompts' | 'tokens';
  loading?: boolean;
  showAlert?: boolean;
}

export function ConsumptionWidget({
  title,
  description,
  used,
  limit,
  type,
  loading,
  showAlert = true
}: ConsumptionWidgetProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-8 w-full" />
        </CardContent>
      </Card>
    );
  }

  const percentage = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;
  const remaining = Math.max(limit - used, 0);
  const isNearLimit = percentage >= 80;
  const isOverLimit = percentage >= 100;

  const getProgressColor = () => {
    if (isOverLimit) return 'bg-red-500';
    if (isNearLimit) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const formatNumber = (num: number) => {
    if (type === 'tokens') {
      return num.toLocaleString('es-ES');
    }
    return num.toString();
  };

  const getTypeLabel = () => {
    const labels = {
      scans: 'escaneos',
      prompts: 'prompts',
      tokens: 'tokens'
    };
    return labels[type];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-slate-700">
              {formatNumber(used)} / {formatNumber(limit)} {getTypeLabel()}
            </span>
            <span className="text-sm font-bold text-slate-900">
              {percentage.toFixed(1)}%
            </span>
          </div>
          <Progress 
            value={percentage} 
            className="h-3"
            indicatorClassName={getProgressColor()}
          />
          <p className="text-xs text-slate-500 mt-2">
            Restantes: {formatNumber(remaining)} {getTypeLabel()}
          </p>
        </div>

        {showAlert && isOverLimit && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Has alcanzado el límite de {getTypeLabel()}. Contacta con tu administrador para ampliar tu plan.
            </AlertDescription>
          </Alert>
        )}

        {showAlert && isNearLimit && !isOverLimit && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              Estás cerca del límite de {getTypeLabel()} ({percentage.toFixed(0)}% usado).
            </AlertDescription>
          </Alert>
        )}

        {showAlert && !isNearLimit && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Consumo dentro del límite normal.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}