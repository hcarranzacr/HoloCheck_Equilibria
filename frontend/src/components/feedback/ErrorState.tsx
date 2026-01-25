import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export function ErrorState({ 
  title = 'Error', 
  message,
  onRetry,
  retryLabel = 'Reintentar'
}: ErrorStateProps) {
  return (
    <div className="max-w-2xl mx-auto mt-8 px-4">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle className="font-semibold">{title}</AlertTitle>
        <AlertDescription className="mt-2">
          <p className="mb-4">{message}</p>
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="gap-2 bg-white hover:bg-slate-50"
            >
              <RefreshCw className="w-4 h-4" />
              {retryLabel}
            </Button>
          )}
        </AlertDescription>
      </Alert>
    </div>
  );
}