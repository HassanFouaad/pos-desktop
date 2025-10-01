import { and, count, eq, ne } from "drizzle-orm";
import { drizzleDb } from "../drizzle";
import { changes } from "../schemas";
import { LogCategory, syncLogger } from "./logger";
import { MetricType, syncMetrics } from "./metrics";
import { EntityType, SyncOperation, SyncStatus } from "./types";

/**
 * Transaction manager for ensuring atomicity of related changes
 *
 * This ensures that related changes are processed together and either
 * all succeed or all fail as a unit.
 */
export class TransactionManager {
  private static instance: TransactionManager;

  private constructor() {}

  public static getInstance(): TransactionManager {
    if (!TransactionManager.instance) {
      TransactionManager.instance = new TransactionManager();
    }
    return TransactionManager.instance;
  }

  /**
   * Create a new transaction and record multiple changes that should be processed atomically
   *
   * @param operations Array of operations to be processed as a single transaction
   * @returns The transaction ID
   */
  public async createTransaction(
    operations: Array<{
      entityType: EntityType | string;
      entityId: number;
      operation: SyncOperation;
      payload: any;
    }>
  ): Promise<string> {
    if (!operations || operations.length === 0) {
      throw new Error("Cannot create empty transaction");
    }

    const transactionId = crypto.randomUUID();
    const db = drizzleDb.database;

    try {
      // Start a database transaction
      await db.transaction(async (tx) => {
        // Insert all changes with the same transaction ID
        for (const op of operations) {
          await tx.insert(changes).values({
            entityType: op.entityType,
            entityId: op.entityId,
            operation: op.operation,
            payload: op.payload,
            transactionId,
            status: SyncStatus.PENDING,
          });
        }
      });

      syncLogger.info(
        LogCategory.SYNC,
        `Created transaction ${transactionId} with ${operations.length} operations`,
        { transactionId, operationCount: operations.length }
      );

      // Track transaction metrics
      syncMetrics.incrementCounter(MetricType.SYNC_OPERATIONS, 1, {
        type: "transaction",
        operationCount: operations.length.toString(),
      });

      return transactionId;
    } catch (error) {
      syncLogger.error(
        LogCategory.SYNC,
        `Failed to create transaction`,
        error instanceof Error ? error : new Error(String(error)),
        { operationCount: operations.length }
      );
      throw error;
    }
  }

  /**
   * Get all changes associated with a transaction
   *
   * @param transactionId The transaction ID
   * @returns Array of change records
   */
  public async getTransactionChanges(transactionId: string): Promise<any[]> {
    const db = drizzleDb.database;

    try {
      const result = await db
        .select()
        .from(changes)
        .where(eq(changes.transactionId, transactionId))
        .orderBy(changes.id);

      return result;
    } catch (error) {
      syncLogger.error(
        LogCategory.SYNC,
        `Failed to get transaction changes`,
        error instanceof Error ? error : new Error(String(error)),
        { transactionId }
      );
      return [];
    }
  }

  /**
   * Mark all changes in a transaction with the given status
   *
   * @param transactionId The transaction ID
   * @param status The status to set
   */
  public async updateTransactionStatus(
    transactionId: string,
    status: SyncStatus
  ): Promise<void> {
    const db = drizzleDb.database;

    try {
      await db
        .update(changes)
        .set({ status })
        .where(eq(changes.transactionId, transactionId));

      syncLogger.info(
        LogCategory.SYNC,
        `Updated transaction ${transactionId} status to ${status}`,
        { transactionId, status }
      );
    } catch (error) {
      syncLogger.error(
        LogCategory.SYNC,
        `Failed to update transaction status`,
        error instanceof Error ? error : new Error(String(error)),
        { transactionId, status }
      );
    }
  }

  /**
   * Check if all changes in a transaction have the same status
   *
   * @param transactionId The transaction ID
   * @param status The status to check for
   * @returns True if all changes have the specified status
   */
  public async isTransactionComplete(
    transactionId: string,
    status: SyncStatus.SUCCESS | SyncStatus.FAILED
  ): Promise<boolean> {
    const db = drizzleDb.database;

    try {
      const result = await db
        .select({ cnt: count() })
        .from(changes)
        .where(
          and(
            eq(changes.transactionId, transactionId),
            ne(changes.status, status)
          )
        );

      // If count is 0, all changes have the specified status
      return result[0].cnt === 0;
    } catch (error) {
      syncLogger.error(
        LogCategory.SYNC,
        `Failed to check transaction completion status`,
        error instanceof Error ? error : new Error(String(error)),
        { transactionId, status }
      );
      return false;
    }
  }
}

export const transactionManager = TransactionManager.getInstance();
