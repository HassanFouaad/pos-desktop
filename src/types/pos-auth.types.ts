/**
 * POS authentication related types and interfaces
 */

/**
 * POS authentication response from backend
 */
export interface PosAuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  device: {
    id: string;
    name: string;
    status: string;
    storeId: string;
    tenantId: string;
  };
  store: {
    id: string;
    name: string;
    code: string;
    tenantId: string;
  };
  tenant: {
    id: string;
    name: string;
    subdomain: string;
  };
}

/**
 * POS refresh token response from backend
 */
export interface PosRefreshTokenResponse {
  accessToken: string;
  expiresIn: number;
}

/**
 * Device fingerprint for security validation
 */
export interface DeviceFingerprint {
  macAddress: string;
  hostname: string;
  osVersion: string;
  cpuModel: string;
  totalRAM: string;
  screenResolution: string;
  timezone: string;
  collectedAt: string;
}

/**
 * POS pairing request payload
 */
export interface PairPosRequest {
  otp: string;
  posId?: string;
  deviceFingerprint?: DeviceFingerprint;
}

/**
 * Stored pairing data in secure storage
 */
