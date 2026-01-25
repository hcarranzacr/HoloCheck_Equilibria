import { useCallback } from 'react';
import { LoggerService } from '@/lib/services/LoggerService';

export function useActivityLogger() {
  const logActivity = useCallback(async (
    action: string,
    details?: Record<string, any>,
    level: 'info' | 'warning' | 'error' = 'info'
  ) => {
    try {
      await LoggerService.log({
        action,
        details,
        level
      });
    } catch (error) {
      console.error('Error in useActivityLogger:', error);
    }
  }, []);

  const logPageView = useCallback(async (pageName: string) => {
    await LoggerService.log({
      action: 'page_view',
      details: { page: pageName },
      level: 'info'
    });
  }, []);

  const logAction = useCallback(async (actionName: string, details?: Record<string, any>) => {
    await LoggerService.log({
      action: actionName,
      details,
      level: 'info'
    });
  }, []);

  const logNavigation = useCallback(async (from: string, to: string) => {
    await LoggerService.logNavigation(from, to);
  }, []);

  const logCRUD = useCallback(async (
    operation: 'create' | 'read' | 'update' | 'delete',
    table: string,
    recordId: string,
    details?: Record<string, any>
  ) => {
    await LoggerService.logCRUD(operation, table, recordId, details);
  }, []);

  const logSearch = useCallback(async (
    query: string,
    filters: Record<string, any>,
    resultsCount: number
  ) => {
    await LoggerService.logSearch(query, filters, resultsCount);
  }, []);

  const logExport = useCallback(async (
    format: string,
    filename: string,
    recordCount: number
  ) => {
    await LoggerService.logExport(format, filename, recordCount);
  }, []);

  const logError = useCallback(async (
    error: Error,
    context?: Record<string, any>
  ) => {
    await LoggerService.logError(error, context);
  }, []);

  return {
    logActivity,
    logPageView,
    logAction,
    logNavigation,
    logCRUD,
    logSearch,
    logExport,
    logError
  };
}