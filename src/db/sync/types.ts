/**
 * Sync operation types enum
 */
export enum SyncOperation {
  INSERT = "INSERT",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
}

/**
 * Sync status enum
 */
export enum SyncStatus {
  PENDING = "pending",
  SUCCESS = "success",
  FAILED = "failed",
  RETRY = "retry",
  DELAYED = "delayed",
}

/**
 * Entity types enum
 */
export enum EntityType {
  CUSTOMER = "customer",
  PRODUCT = "product",
  INVENTORY = "inventory",
  ORDER = "order",
  PAYMENT = "payment",
  INVOICE = "invoice",
  STORE = "store",
  USER = "user",
  CATEGORY = "category",
  VARIANT = "variant",
  LOG = "log",
  AUDIT = "audit",
  STATISTIC = "statistic",
  REPORT = "report",
}

/**
 * Sync change interface
 */
export interface SyncChange {
  id: number;
  entityType: string;
  entityId: number;
  operation: SyncOperation;
  payload: any;
  createdAt: Date;
  syncedAt: Date | null;
  transactionId: string;
  status: SyncStatus;
  retryCount: number;
  nextRetryAt: Date | null;
  priority: number; // 1 = highest, 10 = lowest
}

/**
 * Sync handler interface
 */
export interface SyncHandler {
  entityType: string;
  syncChange(change: SyncChange): Promise<SyncResult>;
}

/**
 * Sync result enum
 */
export enum SyncResult {
  ACCEPTED = "accepted",
  REJECTED = "rejected",
  RETRY = "retry",
}
