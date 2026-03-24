type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  meta?: Record<string, any>;
}

class Logger {
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV !== 'production';
  }

  private log(level: LogLevel, message: string, meta?: Record<string, any>): void {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      meta,
    };

    if (this.isDevelopment) {
      const color = this.getColorForLevel(level);
      console.log(color, JSON.stringify(entry, null, 2));
    } else {
      console.log(JSON.stringify(entry));
    }
  }

  private getColorForLevel(level: LogLevel): string {
    switch (level) {
      case 'info':
        return '\x1b[36m%s\x1b[0m';
      case 'warn':
        return '\x1b[33m%s\x1b[0m';
      case 'error':
        return '\x1b[31m%s\x1b[0m';
      case 'debug':
        return '\x1b[35m%s\x1b[0m';
      default:
        return '\x1b[0m%s';
    }
  }

  info(message: string, meta?: Record<string, any>): void {
    this.log('info', message, meta);
  }

  warn(message: string, meta?: Record<string, any>): void {
    this.log('warn', message, meta);
  }

  error(message: string, meta?: Record<string, any>): void {
    this.log('error', message, meta);
  }

  debug(message: string, meta?: Record<string, any>): void {
    if (this.isDevelopment) {
      this.log('debug', message, meta);
    }
  }
}

export const logger = new Logger();
