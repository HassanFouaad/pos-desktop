import {
  OrderItemStockType,
  OrderSource,
  OrderStatus,
  OrderType,
  PaymentMethod,
  PaymentStatus,
} from "../../../db/enums";

// Order Item DTO
export interface OrderItemDto {
  id: string;
  orderId: string;
  storeId: string;
  tenantId?: string;
  variantId?: string;
  quantity: number;
  unitPrice: number;
  originalUnitPrice?: number;
  lineSubtotal: number;
  lineDiscount: number;
  lineTotalBeforeTax: number;
  inventoryAdjustmentId?: string;
  productName: string;
  variantName: string;
  productSku: string;
  variantAttributes?: Record<string, string>;
  stockType: OrderItemStockType;
  isReturned: boolean;
  returnedQuantity: number;
  returnReason?: string;
  lineTotal: number;
  lineTax?: number; // Calculated field
  createdAt: Date;
  updatedAt: Date;
}

// Order DTO
export interface OrderDto {
  id: string;
  tenantId: string;
  storeId: string;
  customerId?: string;
  orderNumber: string;
  externalOrderId?: string;
  orderType: OrderType;
  status: OrderStatus;
  source: OrderSource;
  subtotal: number;
  totalDiscount: number;
  totalTax: number;
  totalAmount: number;
  paymentMethod?: PaymentMethod;
  paymentStatus: PaymentStatus;
  amountPaid: number;
  amountDue: number;
  changeGiven: number;
  cashierId?: string;
  shiftId?: string;
  registerId?: string;
  originalOrderId?: string;
  customerName?: string;
  customerPhone?: string;
  notes?: string;
  internalNotes?: string;
  localId?: string;
  orderDate: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  items?: OrderItemDto[];
}

export interface CreateOrderDto {
  storeId: string;

  orderDate: Date;

  customerId?: string;

  source: OrderSource;

  paymentMethod: PaymentMethod;

  amountPaid?: number;

  cashierId?: string;

  shiftId?: string;

  registerId?: string;

  notes?: string;

  internalNotes?: string;

  localId?: string;

  items: CreateOrderItemDto[];
}

// Create Order Item DTO
export interface CreateOrderItemDto {
  variantId?: string;
  quantity: number;
  price?: number; // For non-stock items
  variantName?: string; // For non-stock items
  stockType: OrderItemStockType;
}

// Line Item Calculation Result
export interface LineItemCalculation {
  lineSubtotal: number;
  lineDiscount: number;
  lineTotalBeforeTax: number;
  lineTax: number;
  lineTotal: number;
}

// Preview Order Item
export interface PreviewOrderItemDto extends LineItemCalculation {
  variantId?: string;
  quantity: number;
  unitPrice: number;
  originalUnitPrice: number;
  productName: string;
  variantName: string;
  productSku: string;
  variantAttributes?: Record<string, string>;
  stockType: OrderItemStockType;
}

// Preview Order Response
export interface PreviewOrderDto {
  items: PreviewOrderItemDto[];
  subtotal: number;
  totalDiscount: number;
  totalTax: number;
  totalAmount: number;
}

// Complete Order DTO
export interface CompleteOrderDto {
  orderId: string;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  orderDate?: Date;
}

// Void Order DTO
export interface VoidOrderDto {
  orderId: string;
  reason?: string;
}

// Order with items for local state
export interface LocalOrder {
  order: Partial<OrderDto>;
  items: CreateOrderItemDto[];
  preview?: PreviewOrderDto;
}

export interface OrderHistoryDto {
  id: string;
  orderId: string;
  storeId: string;
  tenantId: string;
  userId?: string;
  fromStatus: string;
  toStatus: string;
  createdAt: Date;
  updatedAt: Date;
}

// Create Order History Data
export interface CreateOrderHistoryDto {
  orderId: string;
  userId?: string;
  fromStatus: OrderStatus;
  toStatus: OrderStatus;
  storeId: string;
  tenantId: string;
}
