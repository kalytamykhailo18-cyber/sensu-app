import Constants from 'expo-constants';
import { LogLevel, LoggerConfig } from './types';

const getLogLevelFromEnv = (envLevel?: string): LogLevel => {
  const level = envLevel?.toLowerCase();
  switch (level) {
    case 'debug':
      return LogLevel.DEBUG;
    case 'info':
      return LogLevel.INFO;
    case 'warn':
      return LogLevel.WARN;
    case 'error':
      return LogLevel.ERROR;
    default:
      return __DEV__ ? LogLevel.DEBUG : LogLevel.ERROR;
  }
};

const isDebugMode = (): boolean => {
  const debugEnv = Constants.expoConfig?.extra?.DEBUG_MODE ||
                   Constants.expoConfig?.extra?.DEBUG ||
                   process.env.DEBUG_MODE ||
                   process.env.DEBUG;

  return debugEnv === '1' || debugEnv === 'true' || __DEV__;
};

export const getLoggerConfig = (): LoggerConfig => {
  const logLevel = Constants.expoConfig?.extra?.LOG_LEVEL ||
                   process.env.LOG_LEVEL;

  const debugMode = isDebugMode();

  return {
    level: getLogLevelFromEnv(logLevel),
    debugMode,
    enableConsole: debugMode || __DEV__,
    enableSentry: !__DEV__ && Constants.expoConfig?.extra?.SENTRY_DSN !== undefined
  };
};

export const shouldLog = (level: LogLevel, config: LoggerConfig): boolean => {
  if (!config.debugMode && !__DEV__) {
    return false;
  }

  const levelPriority: Record<LogLevel, number> = {
    [LogLevel.DEBUG]: 0,
    [LogLevel.INFO]: 1,
    [LogLevel.WARN]: 2,
    [LogLevel.ERROR]: 3
  };

  return levelPriority[level] >= levelPriority[config.level];
};