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

    // Send to server - this is the only responsibility of the handler
    const response = await createCustomer(change.payload);

    // Simple success/failure check
    if (!response.success || !response.data) {
      return SyncResult.REJECTED;
    }

    return SyncResult.ACCEPTED;
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
