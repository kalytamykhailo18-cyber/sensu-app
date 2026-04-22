import { sanitizeLogData } from '../formatters';
import { LogEntry, LogLevel, LogTransport } from '../types';

export class SentryTransport implements LogTransport {
  private sentryClient: any = null;

  constructor() {
    this.initializeSentry();
  }

  private initializeSentry(): void {
    try {
      const Sentry = require('@sentry/react-native');
      if (Sentry && Sentry.getCurrentHub) {
        this.sentryClient = Sentry;
      }
    } catch (error) {
      console.warn('Sentry not available. Install @sentry/react-native to enable Sentry logging.');
    }
  }

  log(entry: LogEntry): void {
    if (!this.sentryClient) {
      return;
    }

    const sanitizedData = sanitizeLogData(entry.data);

    switch (entry.level) {
      case LogLevel.ERROR:
        if (entry.error) {
          this.sentryClient.captureException(entry.error, {
            extra: {
              context: entry.context,
              data: sanitizedData,
              message: entry.message,
            },
          });
        } else {
          this.sentryClient.captureMessage(entry.message, 'error');
        }
        break;

      case LogLevel.WARN:
        this.sentryClient.captureMessage(entry.message, 'warning');
        break;

      case LogLevel.INFO:
        this.sentryClient.addBreadcrumb({
          message: entry.message,
          level: 'info',
          category: entry.context || 'general',
          data: sanitizedData,
        });
        break;

      case LogLevel.DEBUG:
        this.sentryClient.addBreadcrumb({
          message: entry.message,
          level: 'debug',
          category: entry.context || 'general',
          data: sanitizedData,
        });
        break;
    }
  }

  async flush(): Promise<void> {
    if (this.sentryClient && this.sentryClient.flush) {
      await this.sentryClient.flush(2000);
    }
  }
}