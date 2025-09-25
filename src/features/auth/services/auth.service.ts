import {
  getLocalStorage,
  setLocalStorage,
  removeLocalStorage,
} from "../../../utils/storage";
import {
  usersRepository,
  UsersRepository,
} from "../../users/repositories/users.repository";
import { login as apiLogin, LoginCredentials, AuthResponse } from "../api/auth";

class AuthService {
  constructor(private readonly usersRepo: UsersRepository) {}

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
      await this.usersRepo.upsertUser(authResponse.user);

      // Persist tokens to Local Storage
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
      setLocalStorage("user", userFromDb); // Re-hydrate local storage
      return userFromDb as AuthResponse["user"];
    }

    return null;
  }
}

export const authService = new AuthService(usersRepository);
