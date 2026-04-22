import {
  Logger as ILogger,
  LogLevel,
  LogContext,
  LogEntry,
  LogTransport,
  LoggerConfig,
  LogMethod,
  ErrorLogMethod
} from './types';
import { getLoggerConfig, shouldLog } from './config';
import { ConsoleTransport } from './transports/console.transport';
import { SentryTransport } from './transports/sentry.transport';

class LoggerImpl implements ILogger {
  private static instance: LoggerImpl;
  private config: LoggerConfig;
  private transports: LogTransport[] = [];
  private defaultContext?: LogContext;

  private constructor() {
    this.config = getLoggerConfig();
    this.initializeTransports();
  }

  public static getInstance(): LoggerImpl {
    if (!LoggerImpl.instance) {
      LoggerImpl.instance = new LoggerImpl();
    }
    return LoggerImpl.instance;
  }

  private initializeTransports(): void {
    if (this.config.enableConsole) {
      this.transports.push(new ConsoleTransport());
    }

    if (this.config.enableSentry) {
      this.transports.push(new SentryTransport());
    }
  }

  private log(level: LogLevel, message: string, data?: any, error?: Error): void {
    if (!shouldLog(level, this.config)) {
      return;
    }

    const entry: LogEntry = {
      level,
      context: this.defaultContext,
      message,
      data,
      error,
      timestamp: new Date(),
    };

    this.transports.forEach(transport => {
      try {
        transport.log(entry);
      } catch (err) {
        if (__DEV__) {
          console.error('Logger transport error:', err);
        }
      }
    });
  }

  public debug: LogMethod = (message: string, data?: any): void => {
    this.log(LogLevel.DEBUG, message, data);
  };

  public info: LogMethod = (message: string, data?: any): void => {
    this.log(LogLevel.INFO, message, data);
  };

  public warn: LogMethod = (message: string, data?: any): void => {
    this.log(LogLevel.WARN, message, data);
  };

  public error: ErrorLogMethod = (message: string, error?: Error | any, data?: any): void => {
    if (error instanceof Error) {
      this.log(LogLevel.ERROR, message, data, error);
    } else if (error !== undefined) {
      this.log(LogLevel.ERROR, message, { ...data, errorData: error });
    } else {
      this.log(LogLevel.ERROR, message, data);
    }
  };

  public setContext(context: LogContext): ILogger {
    this.defaultContext = context;
    return this;
  }

  public withContext(context: LogContext): ILogger {
    const contextLogger = Object.create(this);
    contextLogger.defaultContext = context;
    return contextLogger;
  }

  public updateConfig(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
    this.transports = [];
    this.initializeTransports();
  }

  public async flush(): Promise<void> {
    await Promise.all(
      this.transports
        .filter(t => t.flush)
        .map(t => t.flush!())
    );
  }
}

export const logger = LoggerImpl.getInstance();

export const createLogger = (context?: LogContext): ILogger => {
  const baseLogger = LoggerImpl.getInstance();
  return context ? baseLogger.withContext(context) : baseLogger;
};

export { LogLevel, LogContext } from './types';
export type { Logger } from './types';