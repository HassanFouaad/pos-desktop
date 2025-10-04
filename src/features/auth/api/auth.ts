import { z } from "zod";
import httpClient, { ApiResponse, endpoints } from "../../../api";

export const loginSchema = z.object({
  tenantSubDomain: z.string().min(1, "Tenant Sub Domain is required"),
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export type LoginCredentials = z.infer<typeof loginSchema>;

// Auth response interface based on backend's LoginResponseDto
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    email: string;
    name: string;
    role?: string;
    permissions?: string[];
    [key: string]: any;
  };
}

/**
 * Login user with credentials
 */
export const login = async (
  credentials: LoginCredentials
): Promise<ApiResponse<AuthResponse>> => {
  const response = await httpClient.post<AuthResponse>(
    endpoints.auth.login,
    credentials
  );

  return response;
};

/**
 * Logout current user
 */
export const logout = async (): Promise<void> => {
  await httpClient.post(endpoints.auth.logout);
};

/**
 * Refresh token
 */
export const refreshTokenApi = async (
  refreshToken: string
): Promise<ApiResponse<Pick<AuthResponse, "accessToken">>> => {
  return httpClient.post(endpoints.auth.refreshToken, {
    refreshToken,
  });
};

/**
 * Change user password
 */
export const changePassword = async (
  currentPassword: string,
  newPassword: string
): Promise<ApiResponse<void>> => {
  const response = await httpClient.post(endpoints.auth.changePassword, {
    currentPassword,
    newPassword,
  });

  return response;
};

/**
 * Get me
 */
export const getMe = async (): Promise<ApiResponse<AuthResponse>> => {
  const response = await httpClient.get(endpoints.auth.me);
  return response;
};
