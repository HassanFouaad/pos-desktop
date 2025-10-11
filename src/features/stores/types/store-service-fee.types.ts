export enum ServiceFeeType {
  FIXED = "fixed",
  PERCENTAGE = "percentage",
}

export interface StoreServiceFeeDto {
  id: string;
  storeId: string;
  tenantId: string;
  type: ServiceFeeType;
  value: number;
  createdAt: Date;
  updatedAt: Date;
}
