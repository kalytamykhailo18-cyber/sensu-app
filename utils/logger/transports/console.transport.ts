import { LogEntry, LogTransport, LogLevel } from '../types';
import { formatLogEntry, formatData, formatError, sanitizeLogData } from '../formatters';

export class ConsoleTransport implements LogTransport {
  private useColors: boolean;

  constructor(useColors = true) {
    this.useColors = useColors;
  }

  log(entry: LogEntry): void {
    const formattedMessage = formatLogEntry(entry, this.useColors);

    const logMethod = this.getConsoleMethod(entry.level);

    logMethod(formattedMessage);

    if (entry.data) {
      const sanitized = sanitizeLogData(entry.data);
      const formatted = formatData(sanitized);
      if (formatted) {
        console.log(formatted);
      }
    }

    if (entry.error) {
      const errorData = formatError(entry.error);
      console.error('Error details:', errorData);
    }
  }

  private getConsoleMethod(level: LogLevel): (...args: any[]) => void {
    switch (level) {
      case LogLevel.DEBUG:
        return console.log;
      case LogLevel.INFO:
        return console.info;
      case LogLevel.WARN:
        return console.warn;
      case LogLevel.ERROR:
        return console.error;
      default:
        return console.log;
    }
  }
}