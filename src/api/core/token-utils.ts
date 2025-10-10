/**
 * Token utility functions for JWT handling
 */

/**
 * Decode a JWT token without verification (client-side only)
 * @param token JWT token string
 * @returns Decoded token payload or null if invalid
 */
export function decodeJWT(token: string): Record<string, any> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }

    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded);
  } catch (error) {
    console.warn("Failed to decode JWT:", error);
    return null;
  }
}

/**
 * Check if a JWT token is expired
 * @param token JWT token string
 * @param bufferSeconds Optional buffer time in seconds (default: 60)
 * @returns True if token is expired or will expire within buffer time
 */
export function isTokenExpired(
  token: string | null,
  bufferSeconds: number = 60
): boolean {
  if (!token) return true;

  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) {
    return true;
  }

  const expiryTime = decoded.exp * 1000; // Convert to milliseconds
  const now = Date.now();
  const bufferMs = bufferSeconds * 1000;

  return now >= expiryTime - bufferMs;
}

/**
 * Get the expiry time of a JWT token
 * @param token JWT token string
 * @returns Expiry timestamp in milliseconds or null if invalid
 */
export function getTokenExpiry(token: string | null): number | null {
  if (!token) return null;

  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) {
    return null;
  }

  return decoded.exp * 1000; // Convert to milliseconds
}

/**
 * Get time remaining until token expires
 * @param token JWT token string
 * @returns Time remaining in milliseconds or 0 if expired/invalid
 */
export function getTokenTimeRemaining(token: string | null): number {
  const expiry = getTokenExpiry(token);
  if (!expiry) return 0;

  const remaining = expiry - Date.now();
  return Math.max(0, remaining);
}
