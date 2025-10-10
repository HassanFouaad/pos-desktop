import { container } from "tsyringe";
import { z } from "zod";
import httpClient, { ApiResponse, endpoints } from "../../../api";
import { PairPosRequest, PosAuthResponse } from "../../../types/pos-auth.types";
import { dbTokenStorage, TokenType } from "../services/db-token-storage";
import { DeviceFingerprintService } from "../services/device-fingerprint.service";

const deviceFingerprintService = container.resolve(DeviceFingerprintService);
/**
 * POS pairing request schema
 */
export const pairPosSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
  posId: z.string().optional(),
});

/**
 * Pair POS device with backend using OTP
 * Now includes device fingerprint for enhanced security
 */
export const pairPosDevice = async (
  request: PairPosRequest
): Promise<ApiResponse<PosAuthResponse>> => {
  try {
    // Collect device fingerprint for secure pairing
    let deviceFingerprint;
    try {
      deviceFingerprint =
        await deviceFingerprintService.collectDeviceFingerprint();
      console.info("Device fingerprint collected for pairing");
    } catch (fpError) {
      console.warn("Failed to collect device fingerprint:", fpError);
      // Continue without fingerprint - backend will handle gracefully
    }

    // Include device fingerprint in pairing request
    const pairingRequest = {
      ...request,
      deviceFingerprint,
    };

    const response = await httpClient.post<PosAuthResponse>(
      endpoints.pos.pair,
      pairingRequest
    );

    if (response.success && response.data) {
      // Store POS tokens in database
      await dbTokenStorage.storeToken(
        "accessToken",
        response.data.accessToken,
        TokenType.POS
      );
      await dbTokenStorage.storeToken(
        "refreshToken",
        response.data.refreshToken,
        TokenType.POS
      );

      // Store pairing data for app state restoration
      const pairingData = {
        posDeviceName: response.data.device.name,
        storeId: response.data.store.id,
        storeName: response.data.store.name,
        tenantId: response.data.tenant.id,
        tenantName: response.data.tenant.name,
        lastPairedAt: new Date().toISOString(),
      };

      await dbTokenStorage.storeToken(
        "pairingData",
        pairingData,
        TokenType.POS
      );

      console.info("POS device paired successfully");
    }

    return response;
  } catch (error) {
    console.error("Failed to pair POS device", error);
    throw error;
  }
};

/**
 * Unpair POS device - revoke tokens on backend and clear local storage
 */
export const unpairPosDevice = async (): Promise<void> => {
  try {
    // Try to revoke tokens on backend if online
    try {
      // Note: This endpoint doesn't exist yet in backend, but we'll handle it gracefully
      await httpClient.post(endpoints.pos.unpair);
    } catch (error) {
      console.warn(
        "Failed to revoke tokens on backend, continuing with local unpair",
        error
      );
    }

    // Clear all POS tokens from database regardless of backend result
    await dbTokenStorage.clearTokens(TokenType.POS);

    console.info("POS device unpaired successfully");
  } catch (error) {
    console.error("Failed to unpair POS device", error);
    throw error;
  }
};

/**
 * Note: POS token refresh is now handled internally by httpClient
 * to avoid circular dependencies. This keeps the auth API focused
 * on pairing/unpairing operations.
 */

/**
 * Get POS access token from database
 */
export const getPosAccessToken = async (): Promise<string | null> => {
  const token = await dbTokenStorage.getToken("accessToken", TokenType.POS);
  return typeof token === "string" ? token : null;
};

/**
 * Get user access token from database
 */
export const getUserAccessToken = async (): Promise<string | null> => {
  const token = await dbTokenStorage.getToken("accessToken", TokenType.USER);
  return typeof token === "string" ? token : null;
};
