/**
 * Standard API response format
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  error?: {
    code: string;
    message: string;
    details?: any;
    isNetworkError: boolean;
  };
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      totalItems: number;
      totalPages: number;
    };
  };
}

/**
 * Pagination parameters for requests
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  [key: string]: any;
}

/**
 * API configuration interface
 */
export interface ApiConfig {
  apiBaseUrl: string;
  timeout: number;
  statusCodes: {
    ok: number;
    created: number;
    badRequest: number;
    unauthorized: number;
    forbidden: number;
    notFound: number;
    internalServerError: number;
  };
}
