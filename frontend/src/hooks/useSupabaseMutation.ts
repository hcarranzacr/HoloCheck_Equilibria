import { useState, useCallback } from 'react';
import { useActivityLogger } from './useActivityLogger';

interface UseSupabaseMutationOptions<TData> {
  onSuccess?: (data: TData) => void;
  onError?: (error: Error) => void;
  logAction?: string;
}

export function useSupabaseMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: UseSupabaseMutationOptions<TData>
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { logActivity } = useActivityLogger();

  const mutate = useCallback(async (variables: TVariables) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await mutationFn(variables);
      
      // Logging automático si se especifica logAction
      if (options?.logAction) {
        await logActivity(options.logAction, { 
          variables, 
          result: data 
        });
      }
      
      options?.onSuccess?.(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      
      // Log de error automático
      if (options?.logAction) {
        await logActivity(
          `error_${options.logAction}`,
          { 
            variables, 
            error: error.message 
          },
          'error'
        );
      }
      
      options?.onError?.(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [mutationFn, options, logActivity]);

  return {
    mutate,
    loading,
    error
  };
}