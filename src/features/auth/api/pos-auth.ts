import { z } from "zod";
import httpClient, { ApiResponse, endpoints } from "../../../api";
import { PairPosRequest, PosAuthResponse } from "../../../types/pos-auth.types";
import { secureStorage, TokenType } from "../services/secure-storage";

/**
 * POS pairing request schema
 */
export const pairPosSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
  deviceId: z.string().optional(),
});

/**
 * Pair POS device with backend using OTP
 */
export const pairPosDevice = async (
  request: PairPosRequest
): Promise<ApiResponse<PosAuthResponse>> => {
  try {
    const response = await httpClient.post<PosAuthResponse>(
      endpoints.pos.pair,
      request
    );

    if (response.success && response.data) {
      // Store POS tokens in stronghold
      await secureStorage.storeToken(
        "accessToken",
        response.data.accessToken,
        TokenType.POS
      );
      await secureStorage.storeToken(
        "refreshToken",
        response.data.refreshToken,
        TokenType.POS
      );

      // Store pairing data for app state restoration
      const pairingData = {
        posDeviceId: response.data.device.id,
        posDeviceName: response.data.device.name,
        storeId: response.data.store.id,
        storeName: response.data.store.name,
        tenantId: response.data.tenant.id,
        tenantName: response.data.tenant.name,
        lastPairedAt: new Date(),
      };

      await secureStorage.storeToken(
        "pairingData",
        JSON.stringify(pairingData),
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

    // Clear all POS tokens from stronghold regardless of backend result
    await secureStorage.clearTokens(TokenType.POS);

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
 * Get POS access token from secure storage
 */
export const getPosAccessToken = async (): Promise<string | null> => {
  return await secureStorage.getToken("accessToken", TokenType.POS);
};

/**
 * Get user access token from secure storage
 */
export const getUserAccessToken = async (): Promise<string | null> => {
  return await secureStorage.getToken("accessToken", TokenType.USER);
};
