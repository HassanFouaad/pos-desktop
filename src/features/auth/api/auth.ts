import { z } from "zod";
import apiClient from "../../../api";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

export type LoginCredentials = z.infer<typeof loginSchema>;

// TODO: Define a proper type based on the backend's LoginResponseDto
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: any;
}

export const login = async (
  credentials: LoginCredentials
): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>(
    "/v1/auth/login",
    credentials
  );
  return response.data;
};
