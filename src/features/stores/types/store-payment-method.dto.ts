import { PaymentMethod } from "../../../db/enums";

export interface StorePaymentMethodDto {
  id: string;
  storeId: string;
  tenantId: string;
  paymentMethod: PaymentMethod;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

