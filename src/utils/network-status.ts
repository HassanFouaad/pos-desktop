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
  private isOnline: boolean = navigator.onLine;
  private listeners: ((online: boolean) => void)[] = [];
  private checkEndpoint: string = "";

  private constructor() {
    window?.addEventListener("online", this.handleOnlineChange.bind(this));
    window?.addEventListener("offline", this.handleOnlineChange.bind(this));

    // Additional check for Tauri environment
    if (this.isTauriEnvironment()) {
      this.setupTauriListeners();
    }
  }

  private isTauriEnvironment(): boolean {
    return (
      typeof window !== "undefined" ||
      (window as any)?.["__TAURI__"] !== undefined
    );
  }

  private setupTauriListeners() {
    // Tauri-specific network event listeners if needed
    // Currently using browser's online/offline events which work in Tauri
  }

  private handleOnlineChange() {
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
   * Set the endpoint URL to use for active connectivity checking
   */
  public setCheckEndpoint(url: string): void {
    this.checkEndpoint = url;
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
      const endpoint = this.checkEndpoint || "/api/health";
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000); // 3 second timeout

      const response = await fetch(endpoint, {
        method: "HEAD",
        cache: "no-cache",
        headers: { "Cache-Control": "no-cache" },
        mode: "no-cors",
        signal: controller.signal,
      });

      clearTimeout(timeout);
      return response.ok;
    } catch (error) {
      console.error("Connectivity check failed:", error);
      return false;
    }
  }
}

// Export singleton instance
export const networkStatus = NetworkStatusService.getInstance();
