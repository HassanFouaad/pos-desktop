// Inventory DTO
export interface InventoryDto {
  id: string;
  tenantId?: string;
  storeId: string;
  variantId: string;
  quantityOnHand: number;
  quantityCommitted: number;
  quantityAvailable: number;
  reorderPoint?: number;
  maxStockLevel?: number;
  costPerUnit?: number;
  totalValue?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Inventory Adjustment DTO
export interface InventoryAdjustmentDto {
  id: string;
  tenantId?: string;
  storeId: string;
  variantId: string;
  adjustmentType: string;
  quantityChange: number;
  quantityBefore?: number;
  quantityAfter?: number;
  unitCost?: number;
  totalCost?: number;
  reason?: string;
  referenceType?: string;
  referenceId?: string;
  adjustedBy?: string;
  adjustedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Create Inventory Adjustment Data
export interface CreateInventoryAdjustmentDto {
  tenantId: string;
  storeId: string;
  variantId: string;
  adjustmentType: string;
  quantityChange: number;
  quantityBefore?: number;
  quantityAfter?: number;
  unitCost?: number;
  totalCost?: number;
  reason?: string;
  referenceType?: string;
  referenceId?: string;
  adjustedBy?: string;
  adjustedAt?: Date;
}

// Reserve Stock Parameters
export interface ReserveStockParams {
  variantId: string;
  storeId: string;
  quantity: number;
  referenceId: string;
  currentUserId: string;
  tenantId: string;
}
