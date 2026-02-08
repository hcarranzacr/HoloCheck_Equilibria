/**
 * Comprehensive logging system for debugging
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  module: string;
  message: string;
  data?: any;
}

class Logger {
  private enabled = true;
  private logHistory: LogEntry[] = [];
  private maxHistorySize = 1000;

  private log(level: LogLevel, module: string, message: string, data?: any) {
    if (!this.enabled) return;

    const timestamp = new Date().toISOString();
    const entry: LogEntry = { timestamp, level, module, message, data };

    // Store in history
    this.logHistory.push(entry);
    if (this.logHistory.length > this.maxHistorySize) {
      this.logHistory.shift();
    }

    // Console output with emoji and color
    const emoji = {
      debug: '🔍',
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌'
    }[level];

    const style = {
      debug: 'color: #888',
      info: 'color: #0066cc',
      warn: 'color: #ff9900',
      error: 'color: #cc0000; font-weight: bold'
    }[level];

    console.log(
      `%c${emoji} [${level.toUpperCase()}] [${module}] ${message}`,
      style,
      data !== undefined ? data : ''
    );
  }

  debug(module: string, message: string, data?: any) {
    this.log('debug', module, message, data);
  }

  info(module: string, message: string, data?: any) {
    this.log('info', module, message, data);
  }

  warn(module: string, message: string, data?: any) {
    this.log('warn', module, message, data);
  }

  error(module: string, message: string, data?: any) {
    this.log('error', module, message, data);
  }

  // API-specific logging
  apiRequest(endpoint: string, method: string, body?: any) {
    this.info('API', `→ ${method} ${endpoint}`, body);
  }

  apiResponse(endpoint: string, status: number, data?: any) {
    this.info('API', `← ${status} ${endpoint}`, data);
  }

  apiError(endpoint: string, error: any) {
    this.error('API', `✗ ${endpoint}`, error);
  }

  // i18n-specific logging
  i18nInit(locale: string) {
    this.info('i18n', `Initializing with locale: ${locale}`);
  }

  i18nChange(from: string, to: string) {
    this.info('i18n', `Language changed: ${from} → ${to}`);
  }

  i18nLoadTranslations(screenCode: string, locale: string) {
    this.info('i18n', `Loading translations for ${screenCode} (${locale})`);
  }

  i18nTranslationsLoaded(screenCode: string, locale: string, count: number) {
    this.info('i18n', `✓ Loaded ${count} translations for ${screenCode} (${locale})`);
  }

  // Component lifecycle logging
  componentMount(component: string, props?: any) {
    this.debug('Component', `${component} mounted`, props);
  }

  componentUnmount(component: string) {
    this.debug('Component', `${component} unmounted`);
  }

  componentUpdate(component: string, reason: string, data?: any) {
    this.debug('Component', `${component} updated: ${reason}`, data);
  }

  // Get log history
  getHistory(level?: LogLevel): LogEntry[] {
    if (level) {
      return this.logHistory.filter(entry => entry.level === level);
    }
    return [...this.logHistory];
  }

  // Clear history
  clearHistory() {
    this.logHistory = [];
    this.info('Logger', 'Log history cleared');
  }

  // Enable/disable logging
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }
}

// Export singleton instance
export const logger = new Logger();

// Export for debugging in console
if (typeof window !== 'undefined') {
  (window as any).logger = logger;
}