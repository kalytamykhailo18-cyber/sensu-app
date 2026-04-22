import { LogEntry, LogLevel } from './types';

const LOG_COLORS = {
  [LogLevel.DEBUG]: '\x1b[36m',
  [LogLevel.INFO]: '\x1b[32m',
  [LogLevel.WARN]: '\x1b[33m',
  [LogLevel.ERROR]: '\x1b[31m',
  reset: '\x1b[0m',
};

const LOG_EMOJIS = {
  [LogLevel.DEBUG]: '🐛',
  [LogLevel.INFO]: '📘',
  [LogLevel.WARN]: '⚠️',
  [LogLevel.ERROR]: '❌',
};

export const formatTimestamp = (date: Date): string => {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  const milliseconds = date.getMilliseconds().toString().padStart(3, '0');
  return `${hours}:${minutes}:${seconds}.${milliseconds}`;
};

export const formatLogEntry = (entry: LogEntry, useColors = true): string => {
  const timestamp = formatTimestamp(entry.timestamp);
  const level = entry.level.toUpperCase().padEnd(5);
  const context = entry.context ? `[${entry.context}]` : '';
  const emoji = LOG_EMOJIS[entry.level];

  if (useColors && __DEV__) {
    const color = LOG_COLORS[entry.level];
    return `${color}[${timestamp}] ${emoji} ${level}${LOG_COLORS.reset} ${context} ${entry.message}`;
  }

  return `[${timestamp}] ${emoji} ${level} ${context} ${entry.message}`;
};

export const formatData = (data: any): string => {
  if (data === undefined || data === null) {
    return '';
  }

  if (typeof data === 'string') {
    return data;
  }

  try {
    return JSON.stringify(data, null, 2);
  } catch (error) {
    return String(data);
  }
};

export const formatError = (error: Error | any): object => {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  if (typeof error === 'object' && error !== null) {
    return error;
  }

  return { error: String(error) };
};

export const sanitizeLogData = (data: any): any => {
  if (!data) return data;

  const sensitive = [
    'password',
    'token',
    'accessToken',
    'refreshToken',
    'apiKey',
    'secret',
    'authorization',
    'cookie',
    'session',
  ];

  const sanitize = (obj: any): any => {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(sanitize);
    }

    const sanitized: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const lowerKey = key.toLowerCase();
        if (sensitive.some(s => lowerKey.includes(s))) {
          sanitized[key] = '[REDACTED]';
        } else {
          sanitized[key] = sanitize(obj[key]);
        }
      }
    }
    return sanitized;
  };

  return sanitize(data);
};