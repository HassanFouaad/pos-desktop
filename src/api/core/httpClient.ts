import { fetch } from "@tauri-apps/plugin-http";
import { container } from "tsyringe";
import { PosDeviceRepository } from "../../features/auth/repositories/pos-device.repository";
import {
  dbTokenStorage,
  TokenType,
} from "../../features/auth/services/db-token-storage";
import { DeviceFingerprintService } from "../../features/auth/services/device-fingerprint.service";
import { endpoints, getConfig } from "./config";
import { isTokenExpired } from "./token-utils";
import { ApiResponse } from "./types";

/**
 * Auth state events for notifying the app about auth changes
 */
export interface AuthStateEvent {
  type: "USER_LOGOUT" | "POS_UNPAIRED";
  reason: "token_expired" | "token_invalid" | "manual";
}

const posDeviceRepository = container.resolve(PosDeviceRepository);
const deviceFingerprintService = container.resolve(DeviceFingerprintService);
/**
 * A high-performance HTTP client using Tauri's plugin-http
 * This executes requests through the Rust backend for better performance
 */
class TauriHttpClient {
  private static instance: TauriHttpClient;
  private baseUrl: string;

  // Separate refresh state for USER and POS tokens
  private userRefreshPromise: Promise<string | null> | null = null;
  private isRefreshingUser = false;

  private posRefreshPromise: Promise<string | null> | null = null;
  private isRefreshingPos = false;

  // Track last successful token refresh to avoid spam
  private lastUserRefresh = 0;
  private lastPosRefresh = 0;
  private readonly MIN_REFRESH_INTERVAL = 5000; // 5 seconds minimum between refreshes

  // Auth state change listeners (for notifying Redux store)
  private authStateListeners: Array<(event: AuthStateEvent) => void> = [];

  private constructor() {
    const config = getConfig();
    this.baseUrl = config.apiBaseUrl;
  }

  /**
   * Get the singleton instance of TauriHttpClient
   */
  public static getInstance(): TauriHttpClient {
    if (!TauriHttpClient.instance) {
      TauriHttpClient.instance = new TauriHttpClient();
    }
    return TauriHttpClient.instance;
  }

  /**
   * Subscribe to auth state changes
   * Returns an unsubscribe function
   */
  public onAuthStateChange(
    listener: (event: AuthStateEvent) => void
  ): () => void {
    this.authStateListeners.push(listener);
    return () => {
      this.authStateListeners = this.authStateListeners.filter(
        (l) => l !== listener
      );
    };
  }

  /**
   * Notify all listeners of an auth state change
   */
  private notifyAuthStateChange(event: AuthStateEvent): void {
    this.authStateListeners.forEach((listener) => {
      try {
        listener(event);
      } catch (error) {
        console.error("Error in auth state listener:", error);
      }
    });
  }

  /**
   * Determine which token type to use based on the URL
   * @param url The API endpoint URL
   * @returns TokenType.USER for /auth/me, TokenType.POS for everything else
   */
  private getTokenTypeForUrl(url: string): TokenType {
    // Only use USER token for the /auth/me endpoint
    if (url.includes(endpoints.auth.me)) {
      return TokenType.USER;
    }

    // Use POS token for all other endpoints
    return TokenType.POS;
  }

  /**
   * Get default headers including auth token if available
   * @param url The API endpoint URL to determine which token to use
   */
  private async getDefaultHeaders(
    url: string
  ): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    const tokenType = this.getTokenTypeForUrl(url);
    const tokenResult = await dbTokenStorage.getToken("accessToken", tokenType);
    const token = typeof tokenResult === "string" ? tokenResult : null;

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Process API response to ensure it conforms to ApiResponse format
   */
  private processResponse<T>(responseData: any): ApiResponse<T> {
    // Verify that the response matches our expected structure
    if (
      responseData &&
      typeof responseData === "object" &&
      "success" in responseData
    ) {
      // Response already matches ApiResponse format
      return responseData as ApiResponse<T>;
    }

    // If response doesn't match our expected format, wrap it in ApiResponse
    return {
      success: true,
      data: responseData as T,
    };
  }

  /**
   * Refresh user access token using refresh token
   * If refresh fails with 401, clears user tokens and notifies app
   */
  private async refreshUserToken(): Promise<string | null> {
    // Check if we're already refreshing
    if (this.isRefreshingUser && this.userRefreshPromise) {
      return this.userRefreshPromise;
    }

    // Check if current token is still valid (not expired)
    const currentTokenResult = await dbTokenStorage.getToken(
      "accessToken",
      TokenType.USER
    );
    const currentToken =
      typeof currentTokenResult === "string" ? currentTokenResult : null;

    if (currentToken && !isTokenExpired(currentToken)) {
      console.debug("User token still valid, skipping refresh");
      return currentToken;
    }

    // Rate limit: don't refresh too frequently
    const now = Date.now();
    if (now - this.lastUserRefresh < this.MIN_REFRESH_INTERVAL) {
      console.debug("User token refresh rate limited");
      return null;
    }

    this.isRefreshingUser = true;
    this.userRefreshPromise = this.performUserTokenRefresh();

    try {
      const result = await this.userRefreshPromise;
      if (result) {
        this.lastUserRefresh = Date.now();
      }
      return result;
    } finally {
      this.isRefreshingUser = false;
      this.userRefreshPromise = null;
    }
  }

  /**
   * Actual token refresh logic for user tokens
   */
  private async performUserTokenRefresh(): Promise<string | null> {
    try {
      const refreshTokenResult = await dbTokenStorage.getToken(
        "refreshToken",
        TokenType.USER
      );
      const refreshToken =
        typeof refreshTokenResult === "string" ? refreshTokenResult : null;

      if (!refreshToken) {
        console.warn("No user refresh token found");
        await this.handleUserAuthFailure("token_invalid");
        return null;
      }

      const response = await fetch(
        `${this.baseUrl}${endpoints.auth.refreshToken}`,
        {
          method: "POST",
          body: JSON.stringify({ refreshToken }),
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (response.ok) {
        const responseData = await response.json();
        const newAccessToken = responseData.data.accessToken;

        // Store the new user access token
        await dbTokenStorage.storeToken(
          "accessToken",
          newAccessToken,
          TokenType.USER
        );

        console.info("User token refreshed successfully");
        return newAccessToken;
      }

      // Handle non-OK responses
      const responseData = await response.json().catch(() => ({}));

      // Only logout on actual auth failures (401), not on network errors
      if (response.status === 401 || responseData?.error?.code === "ERR_401") {
        console.warn("User refresh token expired or invalid");
        await this.handleUserAuthFailure("token_expired");
        return null;
      }

      // For other errors (5xx, etc.), don't logout - might be temporary
      console.warn("User token refresh failed with status:", response.status);
      return null;
    } catch (error: any) {
      // Only logout on auth-specific errors, not network errors
      if (
        error?.message === "Unauthorized" ||
        error?.status === 401 ||
        error?.code === "ERR_401"
      ) {
        console.warn("User auth error during refresh");
        await this.handleUserAuthFailure("token_invalid");
      } else {
        // Network error or other temporary error - don't logout
        console.warn("User token refresh failed (non-auth error):", error);
      }
      return null;
    }
  }

  /**
   * Handle user authentication failure - clear tokens and notify app
   */
  private async handleUserAuthFailure(
    reason: "token_expired" | "token_invalid"
  ): Promise<void> {
    try {
      await dbTokenStorage.clearTokens(TokenType.USER);
      this.notifyAuthStateChange({
        type: "USER_LOGOUT",
        reason,
      });
    } catch (error) {
      console.error("Error handling user auth failure:", error);
    }
  }

  /**
   * Refresh POS access token using refresh token
   * If refresh fails with 401, clears POS tokens and notifies app
   */
  private async refreshPosToken(): Promise<string | null> {
    // Check if we're already refreshing
    if (this.isRefreshingPos && this.posRefreshPromise) {
      return this.posRefreshPromise;
    }

    // Check if current token is still valid (not expired)
    const currentTokenResult = await dbTokenStorage.getToken(
      "accessToken",
      TokenType.POS
    );
    const currentToken =
      typeof currentTokenResult === "string" ? currentTokenResult : null;

    if (currentToken && !isTokenExpired(currentToken)) {
      console.debug("POS token still valid, skipping refresh");
      return currentToken;
    }

    // Rate limit: don't refresh too frequently
    const now = Date.now();
    if (now - this.lastPosRefresh < this.MIN_REFRESH_INTERVAL) {
      console.debug("POS token refresh rate limited");
      return null;
    }

    this.isRefreshingPos = true;
    this.posRefreshPromise = this.performPosTokenRefresh();

    try {
      const result = await this.posRefreshPromise;
      if (result) {
        this.lastPosRefresh = Date.now();
      }
      return result;
    } finally {
      this.isRefreshingPos = false;
      this.posRefreshPromise = null;
    }
  }

  /**
   * Actual token refresh logic for POS tokens
   * Now includes device fingerprint for enhanced security
   */
  private async performPosTokenRefresh(): Promise<string | null> {
    try {
      const refreshTokenResult = await dbTokenStorage.getToken(
        "refreshToken",
        TokenType.POS
      );
      const refreshToken =
        typeof refreshTokenResult === "string" ? refreshTokenResult : null;

      if (!refreshToken) {
        console.warn("No POS refresh token found");
        await this.handlePosAuthFailure("token_invalid");
        return null;
      }

      // Collect device fingerprint for security validation
      let deviceFingerprint;
      try {
        deviceFingerprint =
          await deviceFingerprintService.collectDeviceFingerprint();
        console.debug("Device fingerprint collected for token refresh");
      } catch (fpError) {
        console.warn("Failed to collect device fingerprint:", fpError);
        // Continue without fingerprint - backend will handle gracefully
      }

      const response = await fetch(
        `${this.baseUrl}${endpoints.pos.refreshToken}`,
        {
          method: "POST",
          body: JSON.stringify({
            refreshToken,
            deviceFingerprint,
          }),
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (response.ok) {
        const responseData = await response.json();
        const newAccessToken = responseData.data.accessToken;

        // Store the new POS access token
        await dbTokenStorage.storeToken(
          "accessToken",
          newAccessToken,
          TokenType.POS
        );

        console.info("POS token refreshed successfully");
        return newAccessToken;
      }

      // Handle non-OK responses
      const responseData = await response.json().catch(() => ({}));

      // Check for device fingerprint mismatch (security event)
      if (
        responseData?.error?.code === "error_device_fingerprint_mismatch" ||
        responseData?.error?.message?.includes("fingerprint")
      ) {
        console.warn(
          "Device fingerprint mismatch detected - device may have been tampered with"
        );
        await this.handlePosAuthFailure("token_invalid");
        return null;
      }

      // Only unpair on actual auth failures (401), not on network errors
      if (response.status === 401 || responseData?.error?.code === "ERR_401") {
        console.warn("POS refresh token expired or invalid");
        await this.handlePosAuthFailure("token_expired");
        return null;
      }

      // For other errors (5xx, etc.), don't unpair - might be temporary
      console.warn("POS token refresh failed with status:", response.status);
      return null;
    } catch (error: any) {
      // Check for fingerprint mismatch in error
      if (
        error?.code === "error_device_fingerprint_mismatch" ||
        error?.message?.includes("fingerprint")
      ) {
        console.warn("Device fingerprint mismatch detected");
        await this.handlePosAuthFailure("token_invalid");
        return null;
      }

      // Only unpair on auth-specific errors, not network errors
      if (
        error?.message === "Unauthorized" ||
        error?.status === 401 ||
        error?.code === "ERR_401"
      ) {
        console.warn("POS auth error during refresh");
        await this.handlePosAuthFailure("token_invalid");
      } else {
        // Network error or other temporary error - don't unpair
        console.warn("POS token refresh failed (non-auth error):", error);
      }
      return null;
    }
  }

  /**
   * Handle POS authentication failure - clear tokens and notify app
   */
  private async handlePosAuthFailure(
    reason: "token_expired" | "token_invalid"
  ): Promise<void> {
    try {
      await dbTokenStorage.clearTokens(TokenType.POS);
      await posDeviceRepository.clearPosDevice();
      this.notifyAuthStateChange({
        type: "POS_UNPAIRED",
        reason,
      });
    } catch (error) {
      console.error("Error handling POS auth failure:", error);
    }
  }

  /**
   * Handle API errors including token refresh
   */
  private async handleApiError<T>(
    error: unknown,
    url: string,
    options: RequestInit & { headers?: Record<string, string> },
    isRetry = false
  ): Promise<ApiResponse<T>> {
    console.log("error", error);
    const config = getConfig();

    if (
      typeof error === "object" &&
      error !== null &&
      "status" in error &&
      (error as { status: number }).status ===
        config.statusCodes.unauthorized &&
      !isRetry
    ) {
      // Check if this is a protected route that needs refresh
      const isAuthEndpoint =
        url.includes("/auth/login") ||
        url.includes("/auth/refresh") ||
        url.includes("/auth/logout") ||
        url.includes("/pos/pair") ||
        url.includes("/pos/auth/refresh");

      if (!isAuthEndpoint) {
        // Determine which token type to refresh based on URL
        const tokenType = this.getTokenTypeForUrl(url);
        let newToken: string | null = null;

        try {
          if (tokenType === TokenType.USER) {
            // Refresh user token
            newToken = await this.refreshUserToken();
          } else {
            // Refresh POS token
            newToken = await this.refreshPosToken();
          }

          if (newToken) {
            // Retry the original request with the new token
            const newHeaders = options.headers ? { ...options.headers } : {};
            newHeaders["Authorization"] = `Bearer ${newToken}`;

            const newOptions = {
              ...options,
              headers: newHeaders,
            };

            try {
              // Make the request again with new token
              return await this.request<T>(url, newOptions, true);
            } catch (retryError) {
              // If retry fails, handle error normally
              return this.handleApiError<T>(retryError, url, newOptions, true);
            }
          }
        } catch (refreshError) {
          // Token refresh failed, continue with error handling below
          console.warn("Token refresh failed", refreshError);
        }
      }
    } else if (
      typeof error === "string" ||
      (error instanceof Error && error.name === "AbortError") ||
      (error instanceof Error && error.message?.includes("fetch"))
    ) {
      // Handle various forms of network errors
      error = {
        status: 0,
        code: "NETWORK_ERROR",
        message: "Network error. Please check your internet connection.",
      };
    }

    // Handle the error if we can't recover
    const errorObj =
      typeof error === "object" && error !== null
        ? error
        : { code: "UNKNOWN", message: String(error) };

    const errorCode = String(
      ("code" in errorObj ? errorObj.code : undefined) || "UNKNOWN"
    );

    return {
      success: false,
      data: null as unknown as T,
      error: {
        code: String(
          ("code" in errorObj ? errorObj.code : undefined) || "UNKNOWN"
        ),
        message:
          ("message" in errorObj
            ? String(errorObj.message)
            : "An unexpected error occurred") || "An unexpected error occurred",
        details: error,
        isNetworkError: errorCode === "NETWORK_ERROR",
      },
    };
  }

  /**
   * Core request method
   */
  private async request<T>(
    url: string,
    options: RequestInit & { headers?: Record<string, string> },
    isRetry = false
  ): Promise<ApiResponse<T>> {
    try {
      const fullUrl = url.startsWith("http") ? url : `${this.baseUrl}${url}`;

      // Add AbortController with timeout for request cancellation
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);

      const response = await fetch(fullUrl, {
        ...options,
        signal: controller.signal,
        connectTimeout: 60000,
      });

      // Clear the abort timeout
      clearTimeout(timeoutId);

      if (response.ok) {
        const responseData = response?.body ? await response.json() : {};
        return this.processResponse<T>(responseData);
      }

      // Handle error response
      let errorData: any;
      try {
        const errorJSON = await response.json();
        errorData = errorJSON?.error || {};
      } catch (parseError) {
        // If response is not JSON, create a basic error object
        errorData = {
          code: "RESPONSE_PARSE_ERROR",
          message: "Failed to parse error response",
        };
      }

      // Add HTTP status to error data
      errorData.status = response?.status;
      throw errorData;
    } catch (error) {
      // If this is an abort error from our timeout, standardize the error
      if (error instanceof Error && error.name === "AbortError") {
        error = {
          code: "REQUEST_TIMEOUT",
          message: "Request timed out",
          status: 0,
          isNetworkError: true,
        };
      }

      return this.handleApiError<T>(error, url, options, isRetry);
    }
  }

  /**
   * HTTP GET request
   */
  public async get<T = unknown>(
    url: string,
    queryParams?: Record<string, string | number | boolean>,
    customHeaders?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    const defaultHeaders = await this.getDefaultHeaders(url);
    const headers = {
      ...defaultHeaders,
      ...customHeaders,
    };
    console.log("headers", headers);

    // Build query string
    if (queryParams) {
      const queryString = Object.entries(queryParams)
        .filter(([_, value]) => value !== undefined && value !== null)
        .map(([key, value]) => {
          if (Array.isArray(value)) {
            return value
              .map(
                (item) =>
                  `${encodeURIComponent(key)}=${encodeURIComponent(
                    String(item)
                  )}`
              )
              .join("&");
          }
          return `${encodeURIComponent(key)}=${encodeURIComponent(
            String(value)
          )}`;
        })
        .join("&");

      if (queryString) {
        url += (url.includes("?") ? "&" : "?") + queryString;
      }
    }

    return this.request<T>(url, {
      method: "GET",
      headers,
    });
  }

  /**
   * HTTP POST request
   */
  public async post<T = unknown>(
    url: string,
    data?: unknown,
    customHeaders?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    const defaultHeaders = await this.getDefaultHeaders(url);
    const headers = {
      ...defaultHeaders,
      ...customHeaders,
    };
    return this.request<T>(url, {
      method: "POST",
      headers,
      body: JSON.stringify(data || {}),
    });
  }

  /**
   * HTTP PUT request
   */
  public async put<T = unknown>(
    url: string,
    data?: unknown,
    customHeaders?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    const defaultHeaders = await this.getDefaultHeaders(url);
    const headers = {
      ...defaultHeaders,
      ...customHeaders,
    };

    return this.request<T>(url, {
      method: "PUT",
      headers,
      body: JSON.stringify(data || {}),
    });
  }

  /**
   * HTTP PATCH request
   */
  public async patch<T = unknown>(
    url: string,
    data?: unknown,
    customHeaders?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    const defaultHeaders = await this.getDefaultHeaders(url);
    const headers = {
      ...defaultHeaders,
      ...customHeaders,
    };

    return this.request<T>(url, {
      method: "PATCH",
      headers,
      body: JSON.stringify(data || {}),
    });
  }

  /**
   * HTTP DELETE request
   */
  public async delete<T = unknown>(
    url: string,
    customHeaders?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    const defaultHeaders = await this.getDefaultHeaders(url);
    const headers = {
      ...defaultHeaders,
      ...customHeaders,
    };

    return this.request<T>(url, {
      method: "DELETE",
      headers,
    });
  }
}

// Export a singleton instance
export const httpClient = TauriHttpClient.getInstance();

// Export default client for simpler imports
export default httpClient;
