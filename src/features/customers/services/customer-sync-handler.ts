import { BaseSyncHandler } from "../../../db/sync/handler-factory";
import { LogCategory, syncLogger } from "../../../db/sync/logger";
import { syncService } from "../../../db/sync/sync.service";
import { EntityType, SyncChange, SyncResult } from "../../../db/sync/types";
import { createCustomer } from "../api/customers";

/**
 * Handles synchronization of customer data between local database and server
 * Only responsible for API calls, not error handling or retry logic
 */
export class CustomerSyncHandler extends BaseSyncHandler {
  entityType = EntityType.CUSTOMER;

  constructor() {
    super();

    // Register this handler with the sync service
    syncService.registerHandler(this);

    syncLogger.info(LogCategory.HANDLER, "CustomerSyncHandler initialized", {
      entityType: this.entityType,
    });
  }

  /**
   * Handle customer insert operation
   * Creates the customer on the server
   */
  protected async handleInsert(change: SyncChange): Promise<SyncResult> {
    // Extract the localId from the payload or transaction
    const localId = change.payload.localId || change.transactionId;

    if (!localId) {
      // Just log and reject if missing required data
      syncLogger.error(
        LogCategory.HANDLER,
        "Missing localId for customer insert",
        new Error("Missing localId")
      );
      return SyncResult.REJECTED;
    }

    try {
      // Send to server - this is the only responsibility of the handler
      const response = await createCustomer(change.payload);

      // Check for success
      if (response.success && response.data) {
        syncLogger.info(
          LogCategory.HANDLER,
          `Successfully created customer on server: ${response.data.id}`,
          { customerId: response.data.id, localId }
        );
        return SyncResult.ACCEPTED;
      }

      // If we have an error response, check the status code
      if (response.error) {
        // Handle client errors (400, 404) - mark as rejected immediately
        if (
          response.error.details?.status === 400 ||
          response.error.details?.status === 404 ||
          response.error.details?.status === 409 ||
          response.error.details?.status === 422
        ) {
          syncLogger.warn(
            LogCategory.HANDLER,
            `Customer creation rejected with ${response.error.details.status}: ${response.error.message}`,
            { error: response.error, localId }
          );
          return SyncResult.REJECTED;
        }

        // For server errors or other issues, retry
        syncLogger.warn(
          LogCategory.HANDLER,
          `Customer creation failed with error: ${response.error.message}`,
          { error: response.error, localId }
        );
        return SyncResult.RETRY;
      }

      // Default to rejection if we can't determine what happened
      return SyncResult.REJECTED;
    } catch (error) {
      // For unexpected errors, check if they're retryable
      if (this.isRetryableError(error)) {
        syncLogger.warn(
          LogCategory.HANDLER,
          `Retryable error during customer creation: ${
            error instanceof Error ? error.message : String(error)
          }`,
          { error, localId }
        );
        return SyncResult.RETRY;
      }

      // For non-retryable errors, reject immediately
      syncLogger.error(
        LogCategory.HANDLER,
        `Non-retryable error during customer creation: ${
          error instanceof Error ? error.message : String(error)
        }`,
        error as Error
      );
      return SyncResult.REJECTED;
    }
  }

  /**
   * Handle customer update operation
   */
  protected async handleUpdate(_change: SyncChange): Promise<SyncResult> {
    // Not implemented yet
    return SyncResult.REJECTED;
  }

  /**
   * Handle customer delete operation
   */
  protected async handleDelete(_change: SyncChange): Promise<SyncResult> {
    // Not implemented yet
    return SyncResult.REJECTED;
  }
}

// Create and export a singleton instance
export const customerSyncHandler = new CustomerSyncHandler();
