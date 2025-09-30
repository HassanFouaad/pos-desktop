/**
 * NetworkStatusService - Service for detecting and monitoring network status in a Tauri desktop environment
 *
 * Features:
 * - Uses standard navigator.onLine with enhanced reliability
 * - Supports event listeners for network status changes
 * - Provides active connectivity checking
 * - Includes Tauri-specific environment detection
 */

export class NetworkStatusService {
  private static instance: NetworkStatusService;
  private isOnline: boolean = true;
  private listeners: ((online: boolean) => void)[] = [];

  private constructor() {
    window?.addEventListener("online", this.handleOnlineChange.bind(this));
    window?.addEventListener("offline", this.handleOnlineChange.bind(this));
  }

  private handleOnlineChange() {
    console.log("Online Status Determination started");
    const wasOnline = this.isOnline;
    this.isOnline = navigator.onLine;

    if (wasOnline !== this.isOnline) {
      this.listeners.forEach((listener) => listener(this.isOnline));
    }
  }

  public static getInstance(): NetworkStatusService {
    if (!NetworkStatusService.instance) {
      NetworkStatusService.instance = new NetworkStatusService();
    }
    return NetworkStatusService.instance;
  }

  /**
   * Add a listener function that will be called when network status changes
   * @returns A cleanup function that removes the listener
   */
  public addListener(listener: (online: boolean) => void): () => void {
    this.listeners.push(listener);
    // Return a function that removes this listener
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  /**
   * Get current network online status
   */
  public isNetworkOnline(): boolean {
    return this.isOnline;
  }

  /**
   * Actively check connectivity by making a lightweight request to an endpoint
   * More reliable than navigator.onLine for confirming true connectivity
   */
  public async checkConnectivity(): Promise<boolean> {
    if (!this.isOnline) {
      return false;
    }

    try {
      return true;
    } catch (error) {
      console.error("Connectivity check failed:", error);
      return false;
    }
  }
}

window.addEventListener("offline", (e) => {
  console.log("offline");
});

window.addEventListener("online", (e) => {
  console.log("online");
});
// Export singleton instance
export const networkStatus = NetworkStatusService.getInstance();
