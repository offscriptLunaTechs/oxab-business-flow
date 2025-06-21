
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: any;
  timestamp: string;
  userId?: string;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;
  private logs: LogEntry[] = [];
  private maxLogs = 1000; // Keep only last 1000 logs in memory

  private formatMessage(level: LogLevel, message: string, data?: any): LogEntry {
    return {
      level,
      message,
      data,
      timestamp: new Date().toISOString(),
      userId: this.getCurrentUserId(),
    };
  }

  private getCurrentUserId(): string | undefined {
    // Try to get user ID from auth context if available
    return undefined; // Will be populated by auth context
  }

  private addLog(entry: LogEntry) {
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
  }

  debug(message: string, data?: any) {
    const entry = this.formatMessage('debug', message, data);
    this.addLog(entry);
    
    if (this.isDevelopment) {
      console.log(`🐛 ${message}`, data || '');
    }
  }

  info(message: string, data?: any) {
    const entry = this.formatMessage('info', message, data);
    this.addLog(entry);
    
    if (this.isDevelopment) {
      console.log(`ℹ️ ${message}`, data || '');
    }
  }

  warn(message: string, data?: any) {
    const entry = this.formatMessage('warn', message, data);
    this.addLog(entry);
    
    console.warn(`⚠️ ${message}`, data || '');
  }

  error(message: string, data?: any) {
    const entry = this.formatMessage('error', message, data);
    this.addLog(entry);
    
    console.error(`❌ ${message}`, data || '');
    
    // In production, send to monitoring service
    if (!this.isDevelopment) {
      this.sendToMonitoring(entry);
    }
  }

  private async sendToMonitoring(entry: LogEntry) {
    try {
      // Send to external monitoring service (implement based on your choice)
      // Example: Sentry, LogRocket, or custom endpoint
      if (typeof window !== 'undefined' && 'gtag' in window) {
        (window as any).gtag('event', 'exception', {
          description: entry.message,
          fatal: entry.level === 'error'
        });
      }
    } catch (error) {
      // Fallback - don't let logging errors break the app
      console.error('Failed to send log to monitoring:', error);
    }
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
  }
}

export const logger = new Logger();
