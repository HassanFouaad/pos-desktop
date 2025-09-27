import { z } from "zod";
import httpClient, { endpoints } from "../../../api";

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
    id: number;
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
): Promise<AuthResponse> => {
  const response = await httpClient.post<AuthResponse>(
    endpoints.auth.login,
    credentials
  );

  if (!response.success || !response.data) {
    throw new Error(response.error?.message || "Login failed");
  }

  return response.data;
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
export const refreshTokenApi = async (refreshToken: string) => {
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
): Promise<void> => {
  const response = await httpClient.post(endpoints.auth.changePassword, {
    currentPassword,
    newPassword,
  });

  if (!response.success) {
    throw new Error(response.error?.message || "Failed to change password");
  }
};

/**
 * Get me
 */
export const getMe = async (): Promise<AuthResponse["user"]> => {
  const response = await httpClient.get(endpoints.auth.me);
  return response.data;
};
