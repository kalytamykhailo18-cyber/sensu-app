export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

export enum LogContext {
  AUTH = 'AUTH',
  WATCH = 'WATCH',
  LOCATION = 'LOCATION',
  HEALTH = 'HEALTH',
  NETWORK = 'NETWORK',
  API = 'API',
  PROFILE = 'PROFILE',
  CONFIG = 'CONFIG',
  UI = 'UI',
  SYSTEM = 'SYSTEM'
}

export interface LogEntry {
  level: LogLevel;
  context?: LogContext;
  message: string;
  data?: any;
  timestamp: Date;
  error?: Error;
}

export interface LoggerConfig {
  level: LogLevel;
  debugMode: boolean;
  enableConsole: boolean;
  enableSentry: boolean;
}

export interface LogTransport {
  log(entry: LogEntry): void;
  flush?(): Promise<void>;
}

export type LogMethod = (message: string, data?: any) => void;
export type ErrorLogMethod = (message: string, error?: Error | any, data?: any) => void;

export interface Logger {
  debug: LogMethod;
  info: LogMethod;
  warn: LogMethod;
  error: ErrorLogMethod;
  setContext(context: LogContext): Logger;
  withContext(context: LogContext): Logger;
}