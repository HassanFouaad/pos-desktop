import { LogCategory, syncLogger } from "./logger";
import {
  EntityType,
  SyncChange,
  SyncHandler,
  SyncOperation,
  SyncResult,
} from "./types";

/**
 * Base handler implementation for common sync operations
 */
export abstract class BaseSyncHandler implements SyncHandler {
  abstract entityType: string;

  /**
   * Process a sync change
   */
  async syncChange(change: SyncChange): Promise<SyncResult> {
    try {
      syncLogger.info(
        LogCategory.HANDLER,
        `Processing ${change.operation} for ${this.entityType} #${change.entityId}`,
        {
          entityType: this.entityType,
          entityId: change.entityId,
          operation: change.operation,
        }
      );

      switch (change.operation) {
        case SyncOperation.INSERT:
          return await this.handleInsert(change);
        case SyncOperation.UPDATE:
          return await this.handleUpdate(change);
        case SyncOperation.DELETE:
          return await this.handleDelete(change);
        default:
          syncLogger.error(
            LogCategory.HANDLER,
            `Unsupported operation ${change.operation} for ${this.entityType}`,
            new Error(`Unsupported operation: ${change.operation}`),
            { entityType: this.entityType, operation: change.operation }
          );
          return SyncResult.REJECTED;
      }
    } catch (error) {
      syncLogger.error(
        LogCategory.HANDLER,
        `Error processing ${change.operation} for ${this.entityType}`,
        error instanceof Error ? error : new Error(String(error)),
        {
          entityType: this.entityType,
          entityId: change.entityId,
          operation: change.operation,
        }
      );

      // Determine if we should retry based on the error
      if (this.isRetryableError(error)) {
        return SyncResult.RETRY;
      }

      return SyncResult.REJECTED;
    }
  }

  /**
   * Handle insert operation
   */
  protected abstract handleInsert(change: SyncChange): Promise<SyncResult>;

  /**
   * Handle update operation
   */
  protected abstract handleUpdate(change: SyncChange): Promise<SyncResult>;

  /**
   * Handle delete operation
   */
  protected abstract handleDelete(change: SyncChange): Promise<SyncResult>;

  /**
   * Determine if an error is retryable
   */
  protected isRetryableError(error: any): boolean {
    // Client errors (400, 404) are never retryable - they indicate bad requests or missing resources
    if (
      error &&
      error.status &&
      (error.status === 400 || error.status === 404)
    ) {
      syncLogger.info(
        LogCategory.HANDLER,
        `Non-retryable error detected (${error.status}): ${
          error.message || "Unknown error"
        }`,
        { error }
      );
      return false;
    }

    // Network errors are always retryable
    if (
      error &&
      (error.code === "NETWORK_ERROR" ||
        error.message?.includes("network") ||
        error.message?.includes("connection") ||
        error.message?.includes("timeout"))
    ) {
      return true;
    }

    // Server errors (5xx) are usually retryable
    if (error && error.status && error.status >= 500 && error.status < 600) {
      return true;
    }

    // Rate limiting or service unavailable
    if (
      error &&
      error.status &&
      (error.status === 429 || error.status === 503)
    ) {
      return true;
    }

    // Any other client errors (4xx) are generally not retryable
    if (error && error.status && error.status >= 400 && error.status < 500) {
      syncLogger.info(
        LogCategory.HANDLER,
        `Non-retryable client error detected (${error.status}): ${
          error.message || "Unknown error"
        }`,
        { error }
      );
      return false;
    }

    // Default to not retryable for unknown errors
    return false;
  }
}

/**
 * Factory for creating sync handlers
 */
export class SyncHandlerFactory {
  private static instance: SyncHandlerFactory;
  private handlers: Map<string, SyncHandler> = new Map();

  private constructor() {}

  public static getInstance(): SyncHandlerFactory {
    if (!SyncHandlerFactory.instance) {
      SyncHandlerFactory.instance = new SyncHandlerFactory();
    }
    return SyncHandlerFactory.instance;
  }

  /**
   * Register a handler for an entity type
   */
  public registerHandler(handler: SyncHandler): void {
    if (!handler.entityType) {
      throw new Error("Handler must have an entityType");
    }

    this.handlers.set(handler.entityType, handler);
    syncLogger.info(
      LogCategory.HANDLER,
      `Registered sync handler for ${handler.entityType}`,
      { entityType: handler.entityType }
    );
  }

  /**
   * Get a handler for an entity type
   */
  public getHandler(entityType: string): SyncHandler | undefined {
    return this.handlers.get(entityType);
  }

  /**
   * Check if a handler exists for an entity type
   */
  public hasHandler(entityType: string): boolean {
    return this.handlers.has(entityType);
  }

  /**
   * Get all registered handlers
   */
  public getAllHandlers(): Map<string, SyncHandler> {
    return new Map(this.handlers);
  }

  /**
   * Create a generic handler for simple entities
   */
  public createGenericHandler(
    entityType: EntityType | string,
    apiClient: {
      create: (data: any) => Promise<any>;
      update: (id: string, data: any) => Promise<any>;
      delete: (id: string) => Promise<any>;
    }
  ): SyncHandler {
    return new GenericSyncHandler(entityType, apiClient);
  }
}

/**
 * Generic sync handler implementation for simple entities
 */
class GenericSyncHandler extends BaseSyncHandler {
  constructor(
    public entityType: EntityType | string,
    private apiClient: {
      create: (data: any) => Promise<any>;
      update: (id: string, data: any) => Promise<any>;
      delete: (id: string) => Promise<any>;
    }
  ) {
    super();
  }

  protected async handleInsert(change: SyncChange): Promise<SyncResult> {
    try {
      await this.apiClient.create(change.payload);
      return SyncResult.ACCEPTED;
    } catch (error) {
      if (this.isRetryableError(error)) {
        return SyncResult.RETRY;
      }
      return SyncResult.REJECTED;
    }
  }

  protected async handleUpdate(change: SyncChange): Promise<SyncResult> {
    try {
      await this.apiClient.update(change.entityId, change.payload);
      return SyncResult.ACCEPTED;
    } catch (error) {
      if (this.isRetryableError(error)) {
        return SyncResult.RETRY;
      }
      return SyncResult.REJECTED;
    }
  }

  protected async handleDelete(change: SyncChange): Promise<SyncResult> {
    try {
      await this.apiClient.delete(change.entityId);
      return SyncResult.ACCEPTED;
    } catch (error) {
      if (this.isRetryableError(error)) {
        return SyncResult.RETRY;
      }
      return SyncResult.REJECTED;
    }
  }
}

export const syncHandlerFactory = SyncHandlerFactory.getInstance();
