import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, User } from 'lucide-react';
import { getRiskLevel } from './RiskIndicator';

interface BiometricMeasurement {
  id: string;
  user_id?: string;
  user_name?: string;
  heart_rate?: number;
  ai_stress?: number;
  ai_fatigue?: number;
  ai_recovery?: number;
  wellness_index_score?: number;
  created_at: string;
}

interface BiometricTableProps {
  title: string;
  description?: string;
  measurements: BiometricMeasurement[];
  loading?: boolean;
  showUser?: boolean;
  onRowClick?: (measurement: BiometricMeasurement) => void;
  maxRows?: number;
}

export function BiometricTable({
  title,
  description,
  measurements,
  loading,
  showUser = false,
  onRowClick,
  maxRows = 10
}: BiometricTableProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!measurements || measurements.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 text-slate-400">
            <p>No hay mediciones disponibles</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (value: number | undefined) => {
    if (!value) return <Badge variant="outline">N/A</Badge>;
    
    const level = getRiskLevel(value, { low: 30, medium: 60 });
    const variants = {
      low: 'default',
      medium: 'secondary',
      high: 'destructive'
    };
    
    return (
      <Badge variant={variants[level] as any}>
        {value}%
      </Badge>
    );
  };

  const displayMeasurements = measurements.slice(0, maxRows);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {showUser && <TableHead>Usuario</TableHead>}
                <TableHead>Fecha</TableHead>
                <TableHead className="text-center">FC</TableHead>
                <TableHead className="text-center">Estrés</TableHead>
                <TableHead className="text-center">Fatiga</TableHead>
                <TableHead className="text-center">Recuperación</TableHead>
                <TableHead className="text-center">Wellness</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayMeasurements.map((measurement) => (
                <TableRow
                  key={measurement.id}
                  className={onRowClick ? 'cursor-pointer hover:bg-slate-50' : ''}
                  onClick={() => onRowClick?.(measurement)}
                >
                  {showUser && (
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-medium">
                          {measurement.user_name || 'Usuario'}
                        </span>
                      </div>
                    </TableCell>
                  )}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span className="text-sm">{formatDate(measurement.created_at)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="font-medium">
                      {measurement.heart_rate ? `${measurement.heart_rate} bpm` : 'N/A'}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    {getStatusBadge(measurement.ai_stress)}
                  </TableCell>
                  <TableCell className="text-center">
                    {getStatusBadge(measurement.ai_fatigue)}
                  </TableCell>
                  <TableCell className="text-center">
                    {getStatusBadge(measurement.ai_recovery)}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="font-medium text-sky-600">
                      {measurement.wellness_index_score ? `${measurement.wellness_index_score}` : 'N/A'}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {measurements.length > maxRows && (
          <p className="text-sm text-slate-500 mt-4 text-center">
            Mostrando {maxRows} de {measurements.length} mediciones
          </p>
        )}
      </CardContent>
    </Card>
  );
}