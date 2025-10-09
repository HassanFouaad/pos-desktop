import { RefundMethod, ReturnReason, ReturnType } from "../../../db/enums";

// Return Item DTO
export interface ReturnItemDto {
  id: string;
  returnId: string;
  originalOrderItemId: string;
  tenantId?: string;
  storeId: string;
  quantityReturned: number;
  unitRefundAmount: number;
  totalRefundAmount: number;
  returnToInventory: boolean;
  inventoryAdjustmentId?: string;
  createdAt: Date;
}

// Return DTO
export interface ReturnDto {
  id: string;
  tenantId?: string;
  originalOrderId: string;
  storeId: string;
  returnType: string;
  returnReason?: string;
  processedBy?: string;
  approvedBy?: string;
  requiresApproval: boolean;
  approvalNotes?: string;
  refundMethod?: string;
  refundAmount: number;
  exchangeOrderId?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  items?: ReturnItemDto[];
}

// Create Return Item DTO
export interface CreateReturnItemDto {
  originalOrderItemId: string;
  quantityReturned: number;
  returnToInventory: boolean;
}

// Create Return DTO
export interface CreateReturnDto {
  originalOrderId: string;
  returnType: ReturnType;
  returnReason?: ReturnReason;
  refundMethod?: RefundMethod;
  notes?: string;
  items: CreateReturnItemDto[];
  returnDate: Date;
}

// Create Return Data (for repository)
export interface CreateReturnDataDto {
  originalOrderId: string;
  storeId: string;
  tenantId?: string;
  returnType: ReturnType;
  returnReason?: string;
  processedBy?: string;
  requiresApproval?: boolean;
  refundMethod?: string;
  refundAmount?: number;
  notes?: string;
}

// Return Eligibility DTO
export interface ReturnEligibilityDto {
  eligible: boolean;
  reason?: string;
  requiresApproval?: boolean;
  order: any; // OrderDto
}

// Validation Error Item
export interface ValidationErrorItem {
  itemId: string;
  message: string;
}

// Validation Result
export interface ValidationResult {
  valid: boolean;
  errors?: ValidationErrorItem[];
}

// Refund Item Calculation
export interface RefundItemCalculationDto {
  originalOrderItemId: string;
  quantity: number;
  unitPrice: number;
  originalUnitPrice: number;
  lineSubtotal: number;
  lineDiscount: number;
  lineTax: number;
  restockingFee: number;
  totalRefund: number;
}

// Refund Payment Breakdown
export interface RefundPaymentBreakdownDto {
  paymentMethod: string;
  amount: number;
  refundMethod: RefundMethod;
  refundable: boolean;
}

// Refund Calculation Result
export interface RefundCalculationResultDto {
  totalRefundAmount: number;
  paymentBreakdown: RefundPaymentBreakdownDto[];
  taxRefundAmount: number;
  items: RefundItemCalculationDto[];
}

// Process Refund DTO
export interface ProcessRefundDto {
  returnId: string;
  refundMethod: RefundMethod;
  paymentDetails?: RefundPaymentDetailsDto;
  notes?: string;
}

// Refund Payment Details
export interface RefundPaymentDetailsDto {
  transactionId?: string;
  receiptNumber?: string;
}

// Refund Result DTO
export interface RefundResultDto {
  success: boolean;
  returnId: string;
  refundAmount: number;
  refundMethod: RefundMethod;
  transactionId?: string;
  receiptNumber?: string;
  refundDate: Date;
  notes?: string;
}

// Approve Return DTO
export interface ApproveReturnDto {
  approved: boolean;
  approvalNotes?: string;
}

// Process Return DTO (for frontend)
export interface ProcessReturnDto {
  refundMethod: RefundMethod;
  paymentDetails?: RefundPaymentDetailsDto;
  notes?: string;
}
