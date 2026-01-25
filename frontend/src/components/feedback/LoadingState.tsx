import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingState({ 
  message = 'Cargando...', 
  size = 'md' 
}: LoadingStateProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const minHeightClasses = {
    sm: 'min-h-[200px]',
    md: 'min-h-[400px]',
    lg: 'min-h-[600px]'
  };

  return (
    <div className={`flex items-center justify-center ${minHeightClasses[size]}`}>
      <div className="text-center">
        <Loader2 className={`${sizeClasses[size]} animate-spin text-sky-600 mx-auto mb-4`} />
        <p className="text-slate-600 font-medium">{message}</p>
      </div>
    </div>
  );
}