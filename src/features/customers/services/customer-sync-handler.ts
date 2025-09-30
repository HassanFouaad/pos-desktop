import {
  SyncChange,
  SyncHandler,
  SyncOperation,
  syncService,
  SyncStatus,
} from "../../../db/sync/sync.service";
import { createCustomer } from "../api/customers";
import { customersRepository } from "../repositories/customers.repository";

/**
 * CustomerSyncHandler - Handles synchronization of customer data with the server
 *
 * Implements the SyncHandler interface to process customer-specific sync operations
 */
export class CustomerSyncHandler implements SyncHandler {
  entityType = "customer";

  constructor() {
    syncService.registerHandler(this);
  }

  async syncChange(
    change: SyncChange
  ): Promise<"accepted" | "rejected" | "retry"> {
    try {
      switch (change.operation) {
        case SyncOperation.INSERT:
          return await this.handleInsert(change);
        case SyncOperation.UPDATE:
          return await this.handleUpdate(change);
        case SyncOperation.DELETE:
          return await this.handleDelete(change);
        default:
          console.error(`Unknown operation: ${change.operation}`);
          return "rejected";
      }
    } catch (error) {
      console.error(`Error syncing customer change:`, error);

      // Determine if we should retry or reject based on the error
      if (this.isRetryableError(error)) {
        return "retry";
      }
      return "rejected";
    }
  }

  /**
   * Handle INSERT operations for customers
   */
  private async handleInsert(
    change: SyncChange
  ): Promise<"accepted" | "rejected" | "retry"> {
    try {
      // The payload contains all the customer data
      const customerData = change.payload;

      // Send to the API
      await createCustomer(customerData);

      customersRepository.changePendingCustomerStatus(
        change.payload.localId,
        SyncStatus.SUCCESS
      );
      // No need to update any status since we're using changes table directly
      return "accepted";
    } catch (error) {
      console.error("Failed to sync customer insert:", error);
      return this.isRetryableError(error) ? "retry" : "rejected";
    }
  }

  /**
   * Handle UPDATE operations for customers (placeholder for future implementation)
   */
  private async handleUpdate(
    _change: SyncChange
  ): Promise<"accepted" | "rejected" | "retry"> {
    // Implement update logic when needed
    // For now, we'll just mark it as accepted
    console.log(
      "Customer update operation not yet implemented, marking as accepted"
    );
    return "accepted";
  }

  /**
   * Handle DELETE operations for customers (placeholder for future implementation)
   */
  private async handleDelete(
    _change: SyncChange
  ): Promise<"accepted" | "rejected" | "retry"> {
    // Implement delete logic when needed
    // For now, we'll just mark it as accepted

    return "accepted";
  }

  /**
   * Determine if an error is retryable (typically network-related errors)
   */
  private isRetryableError(error: any): boolean {
    // Determine if the error is something we can retry
    // Network errors are typically retryable
    if (!error) return false;

    const message = error?.statusText?.toLowerCase() || "";
    const networkErrorKeywords = [
      "network",
      "timeout",
      "connection",
      "offline",
      "failed to fetch",
      "internet",
      "econnrefused",
      "internal",
    ];

    console.log("error", error);
    // Check for network-related errors
    const isRetryable =
      networkErrorKeywords.some((keyword) => message.includes(keyword)) ||
      error.name === "AbortError" ||
      (error.status &&
        (error.status >= 500 || error.status === 429 || error.status === 404));
    console.log("isRetryable", isRetryable);
    return isRetryable;
  }
}

// Initialize the handler
export const customerSyncHandler = new CustomerSyncHandler();
