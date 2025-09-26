import { store } from "../../../store";
import {
  logout,
  setAuthTokens,
  setCurrentUser,
} from "../../../store/authSlice";
import { networkStatus } from "../../../utils/network-status";
import {
  getLocalStorage,
  removeLocalStorage,
  setLocalStorage,
} from "../../../utils/storage";
import {
  usersRepository,
  UsersRepository,
} from "../../users/repositories/users.repository";
import {
  login as apiLogin,
  AuthResponse,
  LoginCredentials,
  refreshTokenApi,
} from "../api/auth";

class AuthService {
  constructor(private readonly usersRepo: UsersRepository) {}
  /**
   * Determine if an error is retryable (typically network-related errors)
   */
  private isRetryableError(error: any): boolean {
    // Determine if the error is something we can retry
    // Network errors are typically retryable
    if (!error) return false;

    const message = error?.statusText?.toLowerCase() || "";
    const networkErrorKeywords = [
      "network",
      "timeout",
      "connection",
      "offline",
      "failed to fetch",
      "internet",
      "econnrefused",
      "internal",
    ];

    console.log("error", error);
    // Check for network-related errors
    const isRetryable =
      networkErrorKeywords.some((keyword) => message.includes(keyword)) ||
      error.name === "AbortError" ||
      (error.status &&
        (error.status >= 500 || error.status === 429 || error.status === 404));
    console.log("isRetryable", isRetryable);
    return isRetryable;
  }
  async refreshToken(): Promise<string | null> {
    try {
      const authResponse = await refreshTokenApi();
      if (authResponse.accessToken) {
        setLocalStorage("accessToken", authResponse.accessToken);
      }

      if (authResponse.refreshToken && authResponse.accessToken) {
        setLocalStorage("refreshToken", authResponse.refreshToken);
        store.dispatch(
          setAuthTokens({
            accessToken: authResponse.accessToken,
            refreshToken: authResponse.refreshToken,
          })
        );
      }

      if (authResponse.user) {
        setLocalStorage("user", authResponse.user);
        store.dispatch(setCurrentUser(authResponse.user));
      }

      return authResponse.refreshToken;
    } catch (error) {
      if (this.isRetryableError(error)) {
        return null;
      }

      removeLocalStorage("accessToken");
      removeLocalStorage("refreshToken");
      removeLocalStorage("user");

      store.dispatch(logout());

      return null;
    }
  }

  /**
   * Handles both online and offline login.
   * - Online: Authenticates against the API and caches the user.
   * - Offline: Authenticates against the local user cache.
   */
  async loginUser(
    credentials: LoginCredentials
  ): Promise<AuthResponse["user"]> {
    const isOnline = navigator.onLine;

    if (isOnline) {
      // Online login flow
      const authResponse = await apiLogin(credentials);

      // Persist user to local DB
      await this.usersRepo.setLoggedInUser(authResponse.user.id);
      await this.usersRepo.upsertUser(
        authResponse.user,
        authResponse.refreshToken
      );

      // Persist tokens to Local Storage
      setLocalStorage("accessToken", authResponse.accessToken);
      setLocalStorage("refreshToken", authResponse.refreshToken);
      setLocalStorage("user", authResponse.user);

      store.dispatch(
        setAuthTokens({
          accessToken: authResponse.accessToken,
          refreshToken: authResponse.refreshToken,
        })
      );
      store.dispatch(setCurrentUser(authResponse.user));

      return authResponse.user;
    } else {
      // Offline login flow
      const cachedUser = await this.usersRepo.findUserByUsername(
        credentials.username
      );

      if (cachedUser) {
        // NOTE: In a real-world scenario, we would need a more secure way
        // to verify credentials offline, like hashing the password.
        // For this POS system, we are trusting the user exists in the cache.
        await this.usersRepo.setLoggedInUser(cachedUser.id);
        setLocalStorage("user", cachedUser);

        // We don't have fresh tokens, but we can proceed with the cached user.
        return cachedUser as AuthResponse["user"];
      } else {
        throw new Error("Offline login failed: User not found in local cache.");
      }
    }
  }

  /**
   * Logs out the user and clears all persisted data.
   */
  async logoutUser(): Promise<void> {
    await this.usersRepo.logoutAllUsers();
    removeLocalStorage("accessToken");
    removeLocalStorage("refreshToken");
    removeLocalStorage("user");
    // Redux state will be cleared in the component/slice
  }

  /**
   * Retrieves the current user from the most reliable source available.
   * Order: Local Storage -> Drizzle DB
   */
  async getPersistedUser(): Promise<AuthResponse["user"] | null> {
    // 1. Try Local Storage first (quickest)
    const userFromStorage = getLocalStorage<AuthResponse["user"]>("user");
    if (userFromStorage) {
      return userFromStorage;
    }

    // 2. If not in storage, check the Drizzle DB for a logged-in user
    const userFromDb = await this.usersRepo.getLoggedInUser();

    if (userFromDb) {
      setLocalStorage("user", userFromDb);
      return userFromDb as AuthResponse["user"];
    }

    return null;
  }
}

export const authService = new AuthService(usersRepository);

networkStatus.addListener(async (online) => {
  if (online) {
    await authService.refreshToken();
  }
});
