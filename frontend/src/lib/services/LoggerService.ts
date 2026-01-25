import { supabase } from '../supabase';

interface LogParams {
  action: string;
  details?: Record<string, any>;
  level: 'info' | 'warning' | 'error';
  user_id?: string;
  organization_id?: string;
}

export class LoggerService {
  /**
   * Registrar actividad general en system_logs
   */
  static async log(params: LogParams): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Obtener organization_id del perfil del usuario si no se proporciona
      let orgId = params.organization_id;
      if (!orgId && user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('organization_id')
          .eq('user_id', user.id)
          .single();
        
        orgId = profile?.organization_id;
      }

      await supabase
        .from('system_logs')
        .insert({
          log_type: params.action,
          description: JSON.stringify(params.details || {}),
          related_user: params.user_id || user?.id,
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error logging activity:', error);
      // No lanzar error para no interrumpir el flujo principal
    }
  }

  /**
   * Registrar navegación entre páginas
   */
  static async logNavigation(from: string, to: string): Promise<void> {
    await this.log({
      action: 'page_navigation',
      details: { from, to, timestamp: new Date().toISOString() },
      level: 'info'
    });
  }

  /**
   * Registrar operación CRUD
   */
  static async logCRUD(
    operation: 'create' | 'read' | 'update' | 'delete',
    table: string,
    recordId: string,
    details?: Record<string, any>
  ): Promise<void> {
    await this.log({
      action: `${operation}_${table}`,
      details: {
        operation,
        table,
        record_id: recordId,
        ...details
      },
      level: 'info'
    });
  }

  /**
   * Registrar búsqueda o filtro
   */
  static async logSearch(
    query: string,
    filters: Record<string, any>,
    resultsCount: number
  ): Promise<void> {
    await this.log({
      action: 'search_performed',
      details: {
        query,
        filters,
        results_count: resultsCount,
        timestamp: new Date().toISOString()
      },
      level: 'info'
    });
  }

  /**
   * Registrar exportación de datos
   */
  static async logExport(
    format: string,
    filename: string,
    recordCount: number
  ): Promise<void> {
    await this.log({
      action: 'data_exported',
      details: {
        format,
        filename,
        record_count: recordCount,
        timestamp: new Date().toISOString()
      },
      level: 'info'
    });
  }

  /**
   * Registrar error
   */
  static async logError(
    error: Error,
    context?: Record<string, any>
  ): Promise<void> {
    await this.log({
      action: 'error_occurred',
      details: {
        error_message: error.message,
        error_stack: error.stack,
        context,
        timestamp: new Date().toISOString()
      },
      level: 'error'
    });
  }

  /**
   * Registrar análisis IA
   */
  static async logAIAnalysis(
    analysisType: string,
    inputData: Record<string, any>,
    outputData: Record<string, any>,
    tokensUsed: number
  ): Promise<void> {
    await this.log({
      action: 'ai_analysis_performed',
      details: {
        analysis_type: analysisType,
        input_data: inputData,
        output_data: outputData,
        tokens_used: tokensUsed,
        timestamp: new Date().toISOString()
      },
      level: 'info'
    });
  }
}