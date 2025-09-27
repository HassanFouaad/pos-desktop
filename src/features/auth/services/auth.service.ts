import httpClient from "../../../api/core/httpClient";
import { store } from "../../../store";
import { logout } from "../../../store/authSlice";
import { networkStatus } from "../../../utils/network-status";
import { removeLocalStorage, setLocalStorage } from "../../../utils/storage";
import {
  usersRepository,
  UsersRepository,
} from "../../users/repositories/users.repository";
import {
  login as apiLogin,
  AuthResponse,
  getMe,
  LoginCredentials,
} from "../api/auth";

class AuthService {
  constructor(private readonly usersRepo: UsersRepository) {}

  async refreshToken(): Promise<string | null> {
    return await httpClient.refreshToken();
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
      const authResponse = await apiLogin(credentials);

      await this.usersRepo.setLoggedInUser(authResponse.user.id);
      await this.usersRepo.upsertUser(
        authResponse.user,
        authResponse.refreshToken
      );

      setLocalStorage("accessToken", authResponse.accessToken);
      setLocalStorage("refreshToken", authResponse.refreshToken);
      setLocalStorage("user", authResponse.user);

      return authResponse.user;
    } else {
      // Offline login flow
      const cachedUser = await this.usersRepo.findUserByUsername(
        credentials.username
      );

      if (cachedUser) {
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
    store.dispatch(logout());
  }

  /**
   * Retrieves the current user from the most reliable source available.
   * Order: Local Storage -> Drizzle DB
   */
  async getPersistedUser(): Promise<AuthResponse["user"] | null> {
    const isOnline = networkStatus.isNetworkOnline();

    if (isOnline) {
      await this.refreshToken();
      const user = await getMe();
      return user;
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
