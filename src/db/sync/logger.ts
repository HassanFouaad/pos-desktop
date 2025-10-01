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
  MAINTENANCE = "maintenance",
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
 * Optimized to reduce excessive JSON operations
 */
export class SyncLogger {
  private static instance: SyncLogger;
  private logHistory: LogEntry[] = [];
  private readonly MAX_HISTORY = 1000; // Keep last 1000 log entries
  private readonly IS_DEV = import.meta.env.DEV;

  private constructor() {}

  public static getInstance(): SyncLogger {
    if (!SyncLogger.instance) {
      SyncLogger.instance = new SyncLogger();
    }
    return SyncLogger.instance;
  }

  public debug(category: LogCategory, message: string, data?: any): void {
    // Only log debug in development mode
    if (this.IS_DEV) {
      this.log(LogLevel.DEBUG, category, message, undefined, data);
    }
  }

  public info(category: LogCategory, message: string, data?: any): void {
    this.log(LogLevel.INFO, category, message, undefined, data);
  }

  public warn(category: LogCategory, message: string, data?: any): void {
    this.log(LogLevel.WARN, category, message, undefined, data);
  }

  public error(
    category: LogCategory,
    message: string,
    error?: Error,
    data?: any
  ): void {
    this.log(LogLevel.ERROR, category, message, error, data);
  }

  /**
   * Core logging function - optimized to reduce JSON operations
   */
  private log(
    level: LogLevel,
    category: LogCategory,
    message: string,
    error?: Error,
    data?: any
  ): void {
    // Skip excessive logging in production
    if (!this.IS_DEV && level === LogLevel.DEBUG) {
      return;
    }

    // Create log entry with minimal properties
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
    };

    // Only process data if it exists
    if (data) {
      // Avoid stringifying large objects
      if (typeof data === "object" && data !== null) {
        // Store reference directly in dev mode
        if (this.IS_DEV) {
          entry.data = data;
        } else {
          // In production, only include essential fields
          const essentialData: Record<string, any> = {};

          // Extract only the most important fields
          if ("id" in data) essentialData.id = data.id;
          if ("entityId" in data) essentialData.entityId = data.entityId;
          if ("entityType" in data) essentialData.entityType = data.entityType;
          if ("operation" in data) essentialData.operation = data.operation;
          if ("status" in data) essentialData.status = data.status;

          entry.data =
            Object.keys(essentialData).length > 0 ? essentialData : "[data]";
        }
      } else {
        // For primitive values, store directly
        entry.data = data;
      }
    }

    // Add error if provided
    if (error) {
      entry.error = error;
    }

    // Add to history in dev mode only
    if (this.IS_DEV) {
      this.logHistory.push(entry);
      if (this.logHistory.length > this.MAX_HISTORY) {
        this.logHistory.shift();
      }
    }

    // Format console message
    const timestamp = entry.timestamp.split("T")[1].split(".")[0]; // HH:MM:SS
    const consoleMsg = `[${timestamp}] [${category}] ${message}`;

    // Log to console with appropriate level
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(consoleMsg);
        break;
      case LogLevel.INFO:
        console.info(consoleMsg);
        break;
      case LogLevel.WARN:
        console.warn(consoleMsg);
        break;
      case LogLevel.ERROR:
        console.error(consoleMsg, error || "");
        break;
    }
  }

  /**
   * Get log history - filtered by level, category, and time
   */
  public getHistory(filter?: {
    level?: LogLevel;
    category?: LogCategory;
    since?: Date;
  }): LogEntry[] {
    // If no history is kept in production, return empty array
    if (!this.IS_DEV) {
      return [];
    }

    if (!filter) {
      return [...this.logHistory];
    }

    return this.logHistory.filter((entry) => {
      // Filter by level if specified
      if (filter.level && entry.level !== filter.level) {
        return false;
      }

      // Filter by category if specified
      if (filter.category && entry.category !== filter.category) {
        return false;
      }

      // Filter by time if specified
      if (
        filter.since &&
        new Date(entry.timestamp).getTime() < filter.since.getTime()
      ) {
        return false;
      }

      return true;
    });
  }

  /**
   * Clear log history
   */
  public clearHistory(): void {
    this.logHistory = [];
  }
}

export const syncLogger = SyncLogger.getInstance();
