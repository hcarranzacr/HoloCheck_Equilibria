import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Brain,
  Heart,
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';

interface Insight {
  id: string;
  type: 'success' | 'warning' | 'danger' | 'info';
  title: string;
  description: string;
  metric?: string;
  value?: number;
  department?: string;
}

interface InsightPanelProps {
  title: string;
  description?: string;
  insights: Insight[];
  loading?: boolean;
  maxInsights?: number;
}

export function InsightPanel({
  title,
  description,
  insights,
  loading,
  maxInsights = 5
}: InsightPanelProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!insights || insights.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 text-slate-400">
            <p>No hay insights disponibles</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getIcon = (type: string) => {
    const icons = {
      success: CheckCircle,
      warning: AlertTriangle,
      danger: AlertTriangle,
      info: Info
    };
    return icons[type as keyof typeof icons] || Info;
  };

  const getVariant = (type: string) => {
    const variants = {
      success: 'default',
      warning: 'default',
      danger: 'destructive',
      info: 'default'
    };
    return variants[type as keyof typeof variants] || 'default';
  };

  const getAlertClass = (type: string) => {
    const classes = {
      success: 'border-green-200 bg-green-50',
      warning: 'border-yellow-200 bg-yellow-50',
      danger: 'border-red-200 bg-red-50',
      info: 'border-blue-200 bg-blue-50'
    };
    return classes[type as keyof typeof classes] || '';
  };

  const getIconColor = (type: string) => {
    const colors = {
      success: 'text-green-600',
      warning: 'text-yellow-600',
      danger: 'text-red-600',
      info: 'text-blue-600'
    };
    return colors[type as keyof typeof colors] || 'text-slate-600';
  };

  const displayInsights = insights.slice(0, maxInsights);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-3">
        {displayInsights.map((insight) => {
          const Icon = getIcon(insight.type);
          return (
            <Alert key={insight.id} className={getAlertClass(insight.type)}>
              <Icon className={`h-4 w-4 ${getIconColor(insight.type)}`} />
              <AlertTitle className="flex items-center gap-2">
                {insight.title}
                {insight.department && (
                  <Badge variant="outline" className="ml-2">
                    {insight.department}
                  </Badge>
                )}
              </AlertTitle>
              <AlertDescription>
                {insight.description}
                {insight.metric && insight.value !== undefined && (
                  <div className="mt-2 flex items-center gap-2">
                    <Badge variant={getVariant(insight.type) as any}>
                      {insight.metric}: {insight.value}
                    </Badge>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          );
        })}
        {insights.length > maxInsights && (
          <p className="text-sm text-slate-500 text-center pt-2">
            +{insights.length - maxInsights} insights más
          </p>
        )}
      </CardContent>
    </Card>
  );
}