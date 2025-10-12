/**
 * Store response DTO
 */
export interface StoreDto {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  currency: string;
  taxRegion: string | null;
  isActive: boolean;
  hasServiceFees?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PosDTO {
  id: string;
  tenantId: string;
  storeId: string;
  name: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TenantDto {
  id: string;
  name: string;
  subdomain: string;
  adminUsername: string;
  contactPhone: string;
  secondaryContactPhone: string;
  logoUrl: string;
  primaryColor: string;
  accentColor: string;
  storesCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/* 
  id: text("id").primaryKey(),
  name: text("name"),
  subdomain: text("subdomain"),
  adminUsername: text("adminUsername"),
  contactPhone: text("contactPhone"),
  secondaryContactPhone: text("secondaryContactPhone"),
  logoUrl: text("logoUrl"),
  primaryColor: text("primaryColor"),
  accentColor: text("accentColor"),
  storesCount: integer("storesCount"),
  isActive: integer("isActive", { mode: "boolean" }),
  createdAt: integer("createdAt", { mode: "timestamp_ms" }),
  updatedAt: integer("updatedAt", { mode: "timestamp_ms" }),
*/

export * from "./store-payment-method.dto";
export * from "./store-service-fee.types";
