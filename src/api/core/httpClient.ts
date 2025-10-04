import { fetch } from "@tauri-apps/plugin-http";
import { secureStorage } from "../../features/auth/services/secure-storage";
import { networkStatus } from "../../utils/network-status";
import { getLocalStorage, setLocalStorage } from "../../utils/storage";
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
   * Get default headers including auth token if available
   */
  private getDefaultHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    const token = getLocalStorage("accessToken");

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
      headers["x-sync-token"] = token;
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
   * Check if app has network connectivity
   * Uses the more reliable NetworkStatusService instead of navigator.onLine
   */
  private isOnline(): boolean {
    return networkStatus.isNetworkOnline();
  }

  /**
   * Handle refresh token logic - skips if offline
   */
  async refreshToken(): Promise<string | null> {
    // Skip refresh token attempt if offline
    if (!this.isOnline()) {
      return null;
    }

    if (this.isRefreshing) {
      // If already refreshing, return the existing promise
      return this.refreshPromise;
    }

    this.isRefreshing = true;

    try {
      const refreshToken = await secureStorage.getToken("refreshToken");

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

        setLocalStorage("accessToken", newAccessToken);

        return responseData.data.accessToken;
      }

      const responseData = await response.json();

      if (response.status === 401 || responseData?.error?.code === "ERR_401") {
        throw new Error("Unauthorized");
      }

      return null;
    } catch (error: any) {
      if (error?.message !== "Unauthorized") {
        return null;
      }

      throw error;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  /**
   * Handle API errors including token refresh
   */
  private async handleApiError<T>(
    error: any,
    url: string,
    options: RequestInit & { headers?: Record<string, string> },
    isRetry = false
  ): Promise<ApiResponse<T>> {
    const config = getConfig();

    if (error.status === config.statusCodes.unauthorized && !isRetry) {
      // Check if this is a protected route that needs refresh
      const isAuthEndpoint =
        url.includes("/auth/login") ||
        url.includes("/auth/refresh") ||
        url.includes("/auth/logout");

      if (!isAuthEndpoint) {
        // Try to refresh the token
        const newToken = await this.refreshToken();

        if (newToken) {
          await secureStorage.storeToken("accessToken", newToken);
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
      }
    } else if (
      typeof error === "string" ||
      error.name === "AbortError" ||
      error.message?.includes("fetch")
    ) {
      // Handle various forms of network errors
      error = {
        status: 0,
        code: "NETWORK_ERROR",
        message: "Network error. Please check your internet connection.",
      };

      // Update network status service since we've detected a network issue
      networkStatus.forceConnectivityCheck();
    }

    // Handle the error if we can't recover
    return {
      success: false,
      data: null as unknown as T,
      error: {
        code: String(error.code || "UNKNOWN"),
        message: error?.message || "An unexpected error occurred",
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

        // If we successfully made a request, ensure network status is updated to online
        if (!isRetry) {
          networkStatus.forceConnectivityCheck();
        }

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
  public async get<T = any>(
    url: string,
    queryParams?: Record<string, any>,
    customHeaders?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    const headers = {
      ...this.getDefaultHeaders(),
      ...customHeaders,
    };

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
  public async post<T = any>(
    url: string,
    data?: any,
    customHeaders?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    const headers = {
      ...this.getDefaultHeaders(),
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
  public async put<T = any>(
    url: string,
    data?: any,
    customHeaders?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    const headers = {
      ...this.getDefaultHeaders(),
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
  public async patch<T = any>(
    url: string,
    data?: any,
    customHeaders?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    const headers = {
      ...this.getDefaultHeaders(),
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
  public async delete<T = any>(
    url: string,
    customHeaders?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    const headers = {
      ...this.getDefaultHeaders(),
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
