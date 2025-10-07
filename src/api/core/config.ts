import { config } from "../../config";
import { ApiConfig } from "./types";

/**
 * Get the API configuration from environment variables
 */
export function getConfig(): ApiConfig {
  return {
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL || config.API_BASE_URL,
    timeout: import.meta.env.VITE_API_TIMEOUT
      ? Number(import.meta.env.VITE_API_TIMEOUT)
      : 30000,
    statusCodes: {
      ok: 200,
      created: 201,
      badRequest: 400,
      unauthorized: 401,
      forbidden: 403,
      notFound: 404,
      internalServerError: 500,
    },
  };
}

/**
 * Endpoint helpers - these can be extended as needed
 */
export const endpoints = {
  auth: {
    login: "/v1/auth/login",
    logout: "/v1/auth/logout",
    refreshToken: "/v1/auth/refresh",
    me: "/v1/auth/me",
    changePassword: "/v1/auth/change-password",
  },

  pos: {
    pair: "/v1/pos/pair",
    unpair: "/v1/pos/unpair", // For future backend implementation
    refreshToken: "/v1/pos/auth/refresh",
  },

  customers: {
    create: "/v1/pos/customers",
  },

  sync: {
    token: "/v1/pos/sync/token",
    upload: "/v1/pos/sync",
  },
};
