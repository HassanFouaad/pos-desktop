import { z } from "zod";
import httpClient, { endpoints } from "../../../api";
import { getLocalStorage, setLocalStorage } from "../../../utils/storage";

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
 * Get current user profile - offline-first approach
 * Returns user from local storage without making API call
 */
export const getCurrentUser = async (): Promise<AuthResponse["user"]> => {
  // Get user from local storage (offline-first approach)
  const user = getLocalStorage<AuthResponse["user"]>("user");

  // If we have user data in local storage, return it immediately
  if (user) {
    return user;
  }

  // Only fetch from API if not available in local storage
  try {
    const response = await httpClient.get<AuthResponse["user"]>(
      endpoints.auth.me
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || "Failed to get user profile");
    }

    // Store in local storage for future offline access
    setLocalStorage("user", response.data);
    return response.data;
  } catch (error) {
    throw new Error("User not found in local storage and API request failed");
  }
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
