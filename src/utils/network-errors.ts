import { LogCategory, syncLogger } from "../db/sync/logger";

/**
 * Network error categories for better error handling
 */
export enum NetworkErrorCategory {
  // Connection-related errors
  CONNECTION_REFUSED = "connection_refused",
  CONNECTION_RESET = "connection_reset",
  CONNECTION_TIMEOUT = "connection_timeout",

  // DNS-related errors
  DNS_LOOKUP_FAILED = "dns_lookup_failed",

  // Server-related errors
  SERVER_ERROR = "server_error",
  SERVER_TIMEOUT = "server_timeout",
  SERVER_UNAVAILABLE = "server_unavailable",

  // Client-related errors
  CLIENT_TIMEOUT = "client_timeout",
  CLIENT_ABORT = "client_abort",

  // Auth-related errors
  AUTH_REQUIRED = "auth_required",
  AUTH_FAILED = "auth_failed",

  // Rate limiting
  RATE_LIMITED = "rate_limited",

  // Content-related errors
  CONTENT_ENCODING_ERROR = "content_encoding_error",
  CONTENT_LENGTH_ERROR = "content_length_error",

  // TLS/SSL errors
  SSL_ERROR = "ssl_error",
  CERTIFICATE_ERROR = "certificate_error",

  // Generic errors
  NETWORK_UNREACHABLE = "network_unreachable",
  UNKNOWN = "unknown",
}

/**
 * Network error interface with detailed information
 */
export interface NetworkErrorInfo {
  category: NetworkErrorCategory;
  code: string;
  message: string;
  retryable: boolean;
  suggestedRetryDelayMs?: number;
  originalError?: any;
}

/**
 * Network error analyzer for detailed error classification
 */
export class NetworkErrorAnalyzer {
  private static instance: NetworkErrorAnalyzer;

  private constructor() {}

  public static getInstance(): NetworkErrorAnalyzer {
    if (!NetworkErrorAnalyzer.instance) {
      NetworkErrorAnalyzer.instance = new NetworkErrorAnalyzer();
    }
    return NetworkErrorAnalyzer.instance;
  }

  /**
   * Analyze a network error and classify it
   *
   * @param error The error to analyze
   * @returns Detailed network error information
   */
  public analyzeError(error: any): NetworkErrorInfo {
    try {
      // Handle AbortError (request was aborted)
      if (error instanceof Error && error.name === "AbortError") {
        return {
          category: NetworkErrorCategory.CLIENT_ABORT,
          code: "ABORT_ERROR",
          message: "Request was aborted",
          retryable: true,
        };
      }

      // Handle TypeError (often network connectivity issues)
      if (error instanceof TypeError) {
        if (error.message.includes("fetch")) {
          return {
            category: NetworkErrorCategory.NETWORK_UNREACHABLE,
            code: "FETCH_ERROR",
            message: "Network request failed",
            retryable: true,
          };
        }
      }

      // Handle DOMException (often CORS or security issues)
      if (error instanceof DOMException) {
        if (error.name === "NetworkError") {
          return {
            category: NetworkErrorCategory.NETWORK_UNREACHABLE,
            code: "NETWORK_ERROR",
            message: "A network error occurred",
            retryable: true,
          };
        }

        if (error.name === "SecurityError") {
          return {
            category: NetworkErrorCategory.SSL_ERROR,
            code: "SECURITY_ERROR",
            message: "A security error occurred",
            retryable: false,
          };
        }
      }

      // Handle HTTP status codes
      if (error && typeof error.status === "number") {
        return this.analyzeHttpStatus(error);
      }

      // Handle string errors
      if (typeof error === "string") {
        return this.analyzeErrorString(error);
      }

      // Handle error objects with message
      if (error && typeof error.message === "string") {
        return this.analyzeErrorMessage(error.message, error);
      }

      // Default case
      return {
        category: NetworkErrorCategory.UNKNOWN,
        code: "UNKNOWN_ERROR",
        message: "An unknown error occurred",
        retryable: true,
        originalError: error,
      };
    } catch (analyzeError) {
      syncLogger.error(
        LogCategory.NETWORK,
        "Error while analyzing network error",
        analyzeError instanceof Error
          ? analyzeError
          : new Error(String(analyzeError)),
        { originalError: error }
      );

      return {
        category: NetworkErrorCategory.UNKNOWN,
        code: "ANALYSIS_ERROR",
        message: "Error occurred while analyzing the network error",
        retryable: true,
        originalError: error,
      };
    }
  }

  /**
   * Analyze HTTP status code
   */
  private analyzeHttpStatus(error: any): NetworkErrorInfo {
    const status = error.status;

    // Auth errors (401, 403)
    if (status === 401) {
      return {
        category: NetworkErrorCategory.AUTH_REQUIRED,
        code: "UNAUTHORIZED",
        message: "Authentication required",
        retryable: false,
        originalError: error,
      };
    }

    if (status === 403) {
      return {
        category: NetworkErrorCategory.AUTH_FAILED,
        code: "FORBIDDEN",
        message: "Access forbidden",
        retryable: false,
        originalError: error,
      };
    }

    // Rate limiting (429)
    if (status === 429) {
      // Try to get retry-after header
      const retryAfter = error.headers?.get?.("retry-after");
      const retryDelayMs = retryAfter ? parseInt(retryAfter, 10) * 1000 : 60000;

      return {
        category: NetworkErrorCategory.RATE_LIMITED,
        code: "RATE_LIMITED",
        message: "Rate limit exceeded",
        retryable: true,
        suggestedRetryDelayMs: retryDelayMs,
        originalError: error,
      };
    }

    // Server errors (5xx)
    if (status >= 500 && status < 600) {
      return {
        category: NetworkErrorCategory.SERVER_ERROR,
        code: `SERVER_ERROR_${status}`,
        message: `Server error: ${status}`,
        retryable: true,
        originalError: error,
      };
    }

    // Service unavailable (503)
    if (status === 503) {
      return {
        category: NetworkErrorCategory.SERVER_UNAVAILABLE,
        code: "SERVICE_UNAVAILABLE",
        message: "Service temporarily unavailable",
        retryable: true,
        suggestedRetryDelayMs: 30000, // 30 seconds
        originalError: error,
      };
    }

    // Gateway timeout (504)
    if (status === 504) {
      return {
        category: NetworkErrorCategory.SERVER_TIMEOUT,
        code: "GATEWAY_TIMEOUT",
        message: "Gateway timeout",
        retryable: true,
        originalError: error,
      };
    }

    // Default for other status codes
    return {
      category: NetworkErrorCategory.UNKNOWN,
      code: `HTTP_ERROR_${status}`,
      message: `HTTP error: ${status}`,
      retryable: status >= 500, // Only retry server errors by default
      originalError: error,
    };
  }

  /**
   * Analyze error string
   */
  private analyzeErrorString(error: string): NetworkErrorInfo {
    const lowerError = error.toLowerCase();

    if (lowerError.includes("network") || lowerError.includes("offline")) {
      return {
        category: NetworkErrorCategory.NETWORK_UNREACHABLE,
        code: "NETWORK_UNREACHABLE",
        message: "Network is unreachable",
        retryable: true,
      };
    }

    if (lowerError.includes("timeout")) {
      return {
        category: NetworkErrorCategory.CONNECTION_TIMEOUT,
        code: "CONNECTION_TIMEOUT",
        message: "Connection timed out",
        retryable: true,
      };
    }

    if (lowerError.includes("connection refused")) {
      return {
        category: NetworkErrorCategory.CONNECTION_REFUSED,
        code: "CONNECTION_REFUSED",
        message: "Connection refused",
        retryable: true,
      };
    }

    if (lowerError.includes("dns")) {
      return {
        category: NetworkErrorCategory.DNS_LOOKUP_FAILED,
        code: "DNS_LOOKUP_FAILED",
        message: "DNS lookup failed",
        retryable: true,
      };
    }

    return {
      category: NetworkErrorCategory.UNKNOWN,
      code: "UNKNOWN_STRING_ERROR",
      message: error,
      retryable: true,
    };
  }

  /**
   * Analyze error message
   */
  private analyzeErrorMessage(
    message: string,
    originalError: any
  ): NetworkErrorInfo {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes("timeout")) {
      return {
        category: NetworkErrorCategory.CONNECTION_TIMEOUT,
        code: "TIMEOUT_ERROR",
        message: "Connection timed out",
        retryable: true,
        originalError,
      };
    }

    if (lowerMessage.includes("network") || lowerMessage.includes("offline")) {
      return {
        category: NetworkErrorCategory.NETWORK_UNREACHABLE,
        code: "NETWORK_ERROR",
        message: "Network is unreachable",
        retryable: true,
        originalError,
      };
    }

    if (lowerMessage.includes("abort")) {
      return {
        category: NetworkErrorCategory.CLIENT_ABORT,
        code: "ABORT_ERROR",
        message: "Request was aborted",
        retryable: true,
        originalError,
      };
    }

    if (lowerMessage.includes("ssl") || lowerMessage.includes("certificate")) {
      return {
        category: NetworkErrorCategory.SSL_ERROR,
        code: "SSL_ERROR",
        message: "SSL/TLS error",
        retryable: false,
        originalError,
      };
    }

    return {
      category: NetworkErrorCategory.UNKNOWN,
      code: "UNKNOWN_ERROR",
      message: message,
      retryable: true,
      originalError,
    };
  }

  /**
   * Check if an error is retryable
   *
   * @param error The error to check
   * @returns True if the error is retryable
   */
  public isRetryableError(error: any): boolean {
    const errorInfo = this.analyzeError(error);
    return errorInfo.retryable;
  }

  /**
   * Get suggested retry delay for an error
   *
   * @param error The error to check
   * @param defaultDelayMs Default delay in milliseconds
   * @returns Suggested retry delay in milliseconds
   */
  public getSuggestedRetryDelay(
    error: any,
    defaultDelayMs: number = 5000
  ): number {
    const errorInfo = this.analyzeError(error);
    return errorInfo.suggestedRetryDelayMs || defaultDelayMs;
  }
}

export const networkErrorAnalyzer = NetworkErrorAnalyzer.getInstance();
