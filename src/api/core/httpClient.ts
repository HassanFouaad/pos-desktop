import { fetch } from "@tauri-apps/plugin-http";
import {
  dbTokenStorage,
  TokenType,
} from "../../features/auth/services/db-token-storage";
import { endpoints, getConfig } from "./config";
import { ApiResponse } from "./types";

/**
 * A high-performance HTTP client using Tauri's plugin-http
 * This executes requests through the Rust backend for better performance
 */
class TauriHttpClient {
  private static instance: TauriHttpClient;
  private baseUrl: string;

  private refreshPromise: Promise<string | null> | null = null;
  private isRefreshing = false;

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
   * If refresh fails with 401, clears user tokens
   */
  private async refreshUserToken(): Promise<string | null> {
    if (this.isRefreshing) {
      // If already refreshing, return the existing promise
      return this.refreshPromise;
    }

    this.isRefreshing = true;

    try {
      const refreshTokenResult = await dbTokenStorage.getToken(
        "refreshToken",
        TokenType.USER
      );
      const refreshToken =
        typeof refreshTokenResult === "string" ? refreshTokenResult : null;

      if (!refreshToken) {
        throw new Error("Unauthorized");
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

        return newAccessToken;
      }

      const responseData = await response.json();

      if (response.status === 401 || responseData?.error?.code === "ERR_401") {
        throw new Error("Unauthorized");
      }

      return null;
    } catch (error: any) {
      if (error?.message === "Unauthorized") {
        // Clear user tokens on auth failure
        console.warn("User refresh token expired, clearing user tokens");
        await dbTokenStorage.clearTokens(TokenType.USER);
        throw error;
      }

      return null;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  /**
   * Refresh POS access token using refresh token
   * If refresh fails with 401, clears POS tokens
   */
  private async refreshPosToken(): Promise<string | null> {
    if (this.isRefreshing) {
      // If already refreshing, return the existing promise
      return this.refreshPromise;
    }

    this.isRefreshing = true;

    try {
      const refreshTokenResult = await dbTokenStorage.getToken(
        "refreshToken",
        TokenType.POS
      );
      const refreshToken =
        typeof refreshTokenResult === "string" ? refreshTokenResult : null;

      if (!refreshToken) {
        throw new Error("Unauthorized");
      }

      const response = await fetch(
        `${this.baseUrl}${endpoints.pos.refreshToken}`,
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

        // Store the new POS access token
        await dbTokenStorage.storeToken(
          "accessToken",
          newAccessToken,
          TokenType.POS
        );

        console.info("POS token refreshed successfully");
        return newAccessToken;
      }

      const responseData = await response.json();

      if (response.status === 401 || responseData?.error?.code === "ERR_401") {
        throw new Error("Unauthorized");
      }

      return null;
    } catch (error: any) {
      if (error?.message === "Unauthorized") {
        // Clear POS tokens on auth failure
        console.warn("POS refresh token expired, clearing POS tokens");
        await dbTokenStorage.clearTokens(TokenType.POS);
        throw error;
      }

      return null;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
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
        const responseData = await response.json();
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
    console.log("headers", headers);
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
