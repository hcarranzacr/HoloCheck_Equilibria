import { useEffect, useRef, useState, useCallback } from 'react';
import {
  DeepAffexManager,
  MeasurementProfile,
  MeasurementResults,
  parseDeepAffexResults,
} from '@/lib/deepaffex';

export interface UseDeepAffexOptions {
  profile?: MeasurementProfile;
  autoStart?: boolean;
  onComplete?: (results: any) => void;
  onError?: (error: any) => void;
}

export interface UseDeepAffexReturn {
  isInitializing: boolean;
  isScanning: boolean;
  error: string | null;
  warning: string | null;
  progress: number;
  results: any | null;
  containerRef: React.RefObject<HTMLDivElement>;
  start: () => Promise<void>;
  stop: () => Promise<void>;
  retry: () => Promise<void>;
}

export function useDeepAffex(options: UseDeepAffexOptions = {}): UseDeepAffexReturn {
  const {
    profile = {},
    autoStart = false,
    onComplete,
    onError,
  } = options;

  const containerRef = useRef<HTMLDivElement>(null);
  const managerRef = useRef<DeepAffexManager | null>(null);
  const isInitializedRef = useRef(false);

  const [isInitializing, setIsInitializing] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<any | null>(null);

  const handleResults = useCallback(
    (rawResults: MeasurementResults) => {
      const statusId = rawResults?.statusId || '';
      const isPartial = statusId === 'PARTIAL';
      const hasLivenessError = rawResults?.errors?.code === 'LIVENESS_ERROR';

      if (isPartial || hasLivenessError) {
        setError('Calidad de medición baja. Por favor intenta nuevamente.');
        setIsScanning(false);
        return;
      }

      const parsed = parseDeepAffexResults(rawResults);
      setResults(parsed);
      setIsScanning(false);

      if (onComplete) {
        onComplete(parsed);
      }
    },
    [onComplete]
  );

  const handleError = useCallback(
    (err: any) => {
      const errorCode = err?.code || 'UNKNOWN';
      const errorMessage = err?.message || String(err);

      // Ignore empty errors
      if (!err || (typeof err === 'object' && Object.keys(err).length === 0)) {
        return;
      }

      // Technical errors (show as warnings)
      const technicalPatterns = [
        /websocket/i,
        /disconnected/i,
        /connection/i,
        /network/i,
      ];
      if (technicalPatterns.some((p) => p.test(errorMessage))) {
        setWarning('Reconectando...');
        setTimeout(() => setWarning(null), 2000);
        return;
      }

      // Low SNR
      if (errorCode === 'MEASUREMENT_LOW_SNR') {
        setWarning('Señal débil - Mejora la iluminación');
        setTimeout(() => setWarning(null), 3000);
        return;
      }

      // Movement warnings
      const movementPatterns = [/movement/i, /motion/i];
      if (movementPatterns.some((p) => p.test(errorMessage))) {
        setWarning('Mantente quieto');
        setTimeout(() => setWarning(null), 2000);
        return;
      }

      // Critical errors
      setError(errorMessage);
      setIsScanning(false);

      if (onError) {
        onError(err);
      }
    },
    [onError]
  );

  const handleEvent = useCallback((event: string) => {
    if (event === 'MEASUREMENT_STARTED') {
      setIsScanning(true);
      setProgress(0);
    }
    if (event === 'MEASUREMENT_COMPLETED' || event === 'MEASUREMENT_CANCELLED') {
      setIsScanning(false);
    }
  }, []);

  const initialize = useCallback(async () => {
    if (!containerRef.current || isInitializedRef.current) return;

    try {
      setIsInitializing(true);
      setError(null);

      const manager = new DeepAffexManager();
      managerRef.current = manager;

      await manager.initialize(containerRef.current, profile, {
        onResults: handleResults,
        onError: handleError,
        onEvent: handleEvent,
      });

      isInitializedRef.current = true;

      if (autoStart) {
        await manager.start();
      }
    } catch (err: any) {
      setError(err.message || 'Error al inicializar el escáner');
      if (onError) {
        onError(err);
      }
    } finally {
      setIsInitializing(false);
    }
  }, [profile, autoStart, handleResults, handleError, handleEvent, onError]);

  const start = useCallback(async () => {
    if (!managerRef.current) {
      setError('SDK no inicializado');
      return;
    }

    try {
      setError(null);
      setWarning(null);
      await managerRef.current.start();
    } catch (err: any) {
      setError(err.message || 'Error al iniciar el escaneo');
      if (onError) {
        onError(err);
      }
    }
  }, [onError]);

  const stop = useCallback(async () => {
    if (!managerRef.current) return;

    try {
      await managerRef.current.stop();
      setIsScanning(false);
    } catch (err: any) {
      console.error('Error stopping scan:', err);
    }
  }, []);

  const retry = useCallback(async () => {
    setError(null);
    setWarning(null);
    setResults(null);
    setProgress(0);

    if (managerRef.current) {
      await managerRef.current.stop();
      await managerRef.current.start();
    }
  }, []);

  useEffect(() => {
    initialize();

    return () => {
      if (managerRef.current) {
        managerRef.current.destroy();
        managerRef.current = null;
      }
      isInitializedRef.current = false;
    };
  }, [initialize]);

  return {
    isInitializing,
    isScanning,
    error,
    warning,
    progress,
    results,
    containerRef,
    start,
    stop,
    retry,
  };
}