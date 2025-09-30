/**
 * SyncLogger - Dedicated logger for sync operations
 *
 * This provides structured logging with proper categorization and severity levels
 * to make troubleshooting easier and allow for better monitoring.
 */

export enum LogLevel {
  DEBUG = "debug",
  INFO = "info",
  WARN = "warn",
  ERROR = "error",
}

export enum LogCategory {
  NETWORK = "network",
  SYNC = "sync",
  CHANGE = "change",
  HANDLER = "handler",
  DATABASE = "database",
  AUTH = "auth",
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: LogCategory;
  message: string;
  data?: any;
  error?: Error;
}

/**
 * SyncLogger class - provides structured logging for sync operations
 */
export class SyncLogger {
  private static instance: SyncLogger;
  private logHistory: LogEntry[] = [];
  private readonly MAX_HISTORY = 1000; // Keep last 1000 log entries
  private readonly MAX_DATA_SIZE = 10000; // Max characters for data

  private constructor() {}

  public static getInstance(): SyncLogger {
    if (!SyncLogger.instance) {
      SyncLogger.instance = new SyncLogger();
    }
    return SyncLogger.instance;
  }

  /**
   * Log a message at DEBUG level
   */
  public debug(category: LogCategory, message: string, data?: any): void {
    this.log(LogLevel.DEBUG, category, message, data);
  }

  /**
   * Log a message at INFO level
   */
  public info(category: LogCategory, message: string, data?: any): void {
    this.log(LogLevel.INFO, category, message, data);
  }

  /**
   * Log a message at WARN level
   */
  public warn(category: LogCategory, message: string, data?: any): void {
    this.log(LogLevel.WARN, category, message, data);
  }

  /**
   * Log a message at ERROR level
   */
  public error(
    category: LogCategory,
    message: string,
    error?: Error,
    data?: any
  ): void {
    this.log(LogLevel.ERROR, category, message, data, error);
  }

  /**
   * Core logging function
   */
  private log(
    level: LogLevel,
    category: LogCategory,
    message: string,
    data?: any,
    error?: Error
  ): void {
    // Sanitize data to prevent huge logs
    let sanitizedData: any;

    if (data) {
      const dataStr = JSON.stringify(data);
      if (dataStr.length > this.MAX_DATA_SIZE) {
        sanitizedData = {
          _truncated: true,
          _originalSize: dataStr.length,
          summary: dataStr.substring(0, 500) + "...",
        };
      } else {
        sanitizedData = data;
      }
    }

    // Create log entry
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      data: sanitizedData,
      error,
    };

    // Add to history (maintaining max size)
    this.logHistory.push(entry);
    if (this.logHistory.length > this.MAX_HISTORY) {
      this.logHistory.shift(); // Remove oldest entry
    }

    // Format for console output
    let consoleMessage = `[${
      entry.timestamp
    }] [${entry.level.toUpperCase()}] [${entry.category}] ${entry.message}`;

    // Log to console with appropriate level
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(consoleMessage, sanitizedData || "", error || "");
        break;
      case LogLevel.INFO:
        console.info(consoleMessage, sanitizedData || "", error || "");
        break;
      case LogLevel.WARN:
        console.warn(consoleMessage, sanitizedData || "", error || "");
        break;
      case LogLevel.ERROR:
        console.error(consoleMessage, sanitizedData || "", error || "");
        break;
    }
  }

  /**
   * Get recent log history
   */
  public getHistory(filter?: {
    level?: LogLevel;
    category?: LogCategory;
    since?: Date;
  }): LogEntry[] {
    let filtered = [...this.logHistory];

    if (filter) {
      if (filter.level) {
        filtered = filtered.filter((entry) => entry.level === filter.level);
      }

      if (filter.category) {
        filtered = filtered.filter(
          (entry) => entry.category === filter.category
        );
      }

      if (filter.since) {
        const sinceTime = filter.since.getTime();
        filtered = filtered.filter(
          (entry) => new Date(entry.timestamp).getTime() >= sinceTime
        );
      }
    }

    return filtered;
  }

  /**
   * Clear log history
   */
  public clearHistory(): void {
    this.logHistory = [];
  }
}

// Export singleton instance
export const syncLogger = SyncLogger.getInstance();
