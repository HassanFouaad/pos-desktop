import { eq } from "drizzle-orm";
import { drizzleDb } from "../drizzle";
import { changes } from "../schemas";
import { LogCategory, syncLogger } from "./logger";
import { EntityType, SyncOperation } from "./types";

/**
 * Priority levels for sync operations
 */
export enum SyncPriority {
  CRITICAL = 1, // Highest priority - critical business operations
  HIGH = 3, // High priority - important but not critical
  NORMAL = 5, // Normal priority - default for most operations
  LOW = 7, // Low priority - can be delayed if system is busy
  BACKGROUND = 10, // Lowest priority - non-essential background operations
}

/**
 * Helper class for managing sync priorities
 */
export class PriorityManager {
  private static instance: PriorityManager;

  private constructor() {}

  public static getInstance(): PriorityManager {
    if (!PriorityManager.instance) {
      PriorityManager.instance = new PriorityManager();
    }
    return PriorityManager.instance;
  }

  /**
   * Set priority for a specific change
   *
   * @param changeId The ID of the change to update
   * @param priority The priority level to set
   */
  public async setPriority(
    changeId: string,
    priority: SyncPriority
  ): Promise<void> {
    const db = drizzleDb.database;

    try {
      await db
        .update(changes)
        .set({ priority })
        .where(eq(changes.id, changeId));

      syncLogger.info(
        LogCategory.SYNC,
        `Set priority ${priority} for change ${changeId}`,
        { changeId, priority }
      );
    } catch (error) {
      syncLogger.error(
        LogCategory.SYNC,
        `Failed to set priority for change`,
        error instanceof Error ? error : new Error(String(error)),
        { changeId, priority }
      );
    }
  }

  /**
   * Set priority for all changes of a specific entity type
   *
   * @param entityType The entity type to update
   * @param priority The priority level to set
   */
  public async setPriorityByEntityType(
    entityType: string,
    priority: SyncPriority
  ): Promise<void> {
    const db = drizzleDb.database;

    try {
      await db
        .update(changes)
        .set({ priority })
        .where(eq(changes.entityType, entityType));

      syncLogger.info(
        LogCategory.SYNC,
        `Set priority ${priority} for all changes of type ${entityType}`,
        { entityType, priority }
      );
    } catch (error) {
      syncLogger.error(
        LogCategory.SYNC,
        `Failed to set priority for entity type`,
        error instanceof Error ? error : new Error(String(error)),
        { entityType, priority }
      );
    }
  }

  /**
   * Determine appropriate priority based on entity type and operation
   *
   * @param entityType The type of entity
   * @param operation The operation type
   * @returns The recommended priority level
   */
  public getPriorityForEntity(
    entityType: EntityType | string,
    operation: string
  ): SyncPriority {
    // Critical business entities and operations
    const criticalEntities = [EntityType.ORDER];

    // Important but not critical entities
    const highPriorityEntities = [
      EntityType.CUSTOMER,
      EntityType.PRODUCT,
      EntityType.INVENTORY,
    ];

    // Background sync entities
    const lowPriorityEntities = [
      EntityType.LOG,
      EntityType.AUDIT,
      EntityType.STATISTIC,
      EntityType.REPORT,
    ];

    const entityTypeStr = String(entityType).toLowerCase();

    if (criticalEntities.includes(entityTypeStr as EntityType)) {
      return SyncPriority.CRITICAL;
    }

    if (highPriorityEntities.includes(entityTypeStr as EntityType)) {
      return SyncPriority.HIGH;
    }

    if (lowPriorityEntities.includes(entityTypeStr as EntityType)) {
      return SyncPriority.LOW;
    }

    // For delete operations, prioritize slightly higher than normal
    if (operation.toLowerCase() === SyncOperation.DELETE.toLowerCase()) {
      return SyncPriority.HIGH;
    }

    // Default priority for everything else
    return SyncPriority.NORMAL;
  }
}

export const priorityManager = PriorityManager.getInstance();
