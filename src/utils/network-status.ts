/**
 * NetworkStatusService - Service for detecting and monitoring network status in a Tauri desktop environment
 *
 * Features:
 * - Uses standard navigator.onLine with enhanced reliability
 * - Supports event listeners for network status changes
 * - Provides active connectivity checking
 * - Includes Tauri-specific environment detection
 */

import { fetch } from "@tauri-apps/plugin-http";

export type NetworkErrorCallback = (error: {
  code: string;
  message: string;
}) => void;

export class NetworkStatusService {
  private static instance: NetworkStatusService;
  private isOnline: boolean = true;
  private listeners: ((online: boolean) => void)[] = [];
  private networkErrorListeners: NetworkErrorCallback[] = [];
  private probeInterval?: number;
  private lastProbeTime: number = 0;
  private consecutiveFailures: number = 0;
  private readonly PROBE_URL = "http://localhost:3000/api/health";
  private readonly MIN_PROBE_INTERVAL_MS = 15000;
  private readonly MAX_CONSECUTIVE_FAILURES = 3;

  private constructor() {
    window?.addEventListener(
      "online",
      this.handleBrowserOnlineEvent.bind(this)
    );
    window?.addEventListener(
      "offline",
      this.handleBrowserOfflineEvent.bind(this)
    );

    // Start the connectivity probe on init
    this.setupConnectivityProbe();
  }

  private handleBrowserOnlineEvent() {
    console.log("Browser reported online status change: online");
    this.verifyConnectivity();
  }

  private handleBrowserOfflineEvent() {
    console.log("Browser reported online status change: offline");
    this.updateOnlineStatus(false);
  }

  private updateOnlineStatus(online: boolean) {
    const wasOnline = this.isOnline;
    this.isOnline = online;

    if (wasOnline !== this.isOnline) {
      console.log(
        `Network status changed: ${this.isOnline ? "online" : "offline"}`
      );
      this.listeners.forEach((listener) => listener(this.isOnline));
    }
  }

  private setupConnectivityProbe() {
    // Check connectivity right away on startup
    this.verifyConnectivity();

    // Set up periodic connectivity checks (but not too frequent)
    if (!this.probeInterval) {
      this.probeInterval = window.setInterval(() => {
        this.verifyConnectivity();
      }, this.MIN_PROBE_INTERVAL_MS);
    }
  }

  private async verifyConnectivity() {
    // Avoid excessive probing
    const now = Date.now();
    if (now - this.lastProbeTime < this.MIN_PROBE_INTERVAL_MS) {
      return;
    }

    this.lastProbeTime = now;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(this.PROBE_URL, {
        method: "HEAD",
        signal: controller.signal,
        cache: "no-store",
      });

      console.log("Connectivity probe response:", response);

      clearTimeout(timeoutId);

      if (response.ok) {
        this.consecutiveFailures = 0;
        this.updateOnlineStatus(true);
      } else {
        this.handleConnectivityFailure();
      }
    } catch (error) {
      this.handleConnectivityFailure();

      // Notify any error listeners
      if (error instanceof Error) {
        this.notifyNetworkError({
          code: "CONNECTIVITY_ERROR",
          message: error.message,
        });
      }
    }
  }

  private handleConnectivityFailure() {
    this.consecutiveFailures++;

    // Only mark as offline after multiple consecutive failures
    // to avoid false negatives from temporary issues
    if (this.consecutiveFailures >= this.MAX_CONSECUTIVE_FAILURES) {
      this.updateOnlineStatus(false);
    }
  }

  private notifyNetworkError(error: { code: string; message: string }) {
    this.networkErrorListeners.forEach((listener) => listener(error));
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
   * Add a listener function for network errors
   * @returns A cleanup function that removes the listener
   */
  public addNetworkErrorListener(listener: NetworkErrorCallback): () => void {
    this.networkErrorListeners.push(listener);
    return () => {
      this.networkErrorListeners = this.networkErrorListeners.filter(
        (l) => l !== listener
      );
    };
  }

  /**
   * Get current network online status
   */
  public isNetworkOnline(): boolean {
    return this.isOnline;
  }

  /**
   * Force an immediate connectivity check
   * Useful when we suspect network conditions might have changed
   */
  public forceConnectivityCheck(): void {
    this.verifyConnectivity();
  }

  /**
   * Actively check connectivity by making a lightweight request
   * Returns current online status (which may be cached)
   */
  public async checkConnectivity(): Promise<boolean> {
    // If we're clearly offline, no need to check
    if (
      !this.isOnline &&
      this.consecutiveFailures >= this.MAX_CONSECUTIVE_FAILURES
    ) {
      return false;
    }

    // If we've checked recently, return the cached status
    const now = Date.now();
    if (now - this.lastProbeTime < this.MIN_PROBE_INTERVAL_MS) {
      return this.isOnline;
    }

    // Otherwise, force a new connectivity check
    await this.verifyConnectivity();
    return this.isOnline;
  }

  /**
   * Clean up resources when this service is no longer needed
   */
  public dispose(): void {
    if (this.probeInterval) {
      window.clearInterval(this.probeInterval);
      this.probeInterval = undefined;
    }

    window?.removeEventListener(
      "online",
      this.handleBrowserOnlineEvent.bind(this)
    );
    window?.removeEventListener(
      "offline",
      this.handleBrowserOfflineEvent.bind(this)
    );

    this.listeners = [];
    this.networkErrorListeners = [];
  }
}

// Initialize and export singleton instance
export const networkStatus = NetworkStatusService.getInstance();
