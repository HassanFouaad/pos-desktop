/**
 * SyncMetrics - Collects and analyzes sync operation metrics
 *
 * This enables monitoring, debugging, and optimizing the sync process
 * by providing insights into performance and reliability.
 */

/**
 * Metric types for tracking different aspects of sync operations
 */
export enum MetricType {
  // Counter metrics (incrementing values)
  CHANGES_PROCESSED = "changes_processed",
  CHANGES_FAILED = "changes_failed",
  CHANGES_RETRIED = "changes_retried",
  SYNC_OPERATIONS = "sync_operations",
  NETWORK_RECONNECTS = "network_reconnects",

  // Gauge metrics (current value)
  PENDING_CHANGES = "pending_changes",
  DELAYED_CHANGES = "delayed_changes",
  NETWORK_LATENCY = "network_latency_ms",

  // Timing metrics (durations)
  SYNC_DURATION = "sync_duration_ms",
  HANDLER_DURATION = "handler_duration_ms",
  RETRY_DELAY = "retry_delay_ms",
}

/**
 * Metric labels to provide context for metrics
 */
export interface MetricLabels {
  entityType?: string;
  operation?: string;
  status?: string;
  handler?: string;
  [key: string]: string | number | undefined;
}

/**
 * Individual metric data point
 */
interface MetricEntry {
  type: MetricType;
  value: number;
  timestamp: number;
  labels: MetricLabels;
}

/**
 * Collection of metrics with aggregation and retrieval methods
 */
export class SyncMetrics {
  private static instance: SyncMetrics;
  private metrics: MetricEntry[] = [];
  private counters: Map<string, number> = new Map();
  private gauges: Map<string, number> = new Map();
  private readonly METRICS_RETENTION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

  private constructor() {
    // Schedule periodic cleanup of old metrics
    setInterval(() => this.cleanupOldMetrics(), 1 * 60 * 60 * 1000); // Clean hourly
  }

  public static getInstance(): SyncMetrics {
    if (!SyncMetrics.instance) {
      SyncMetrics.instance = new SyncMetrics();
    }
    return SyncMetrics.instance;
  }

  /**
   * Create a key for a metric based on its type and labels
   */
  private static createKey(
    type: MetricType,
    labels: MetricLabels = {}
  ): string {
    const labelString = Object.entries(labels)
      .filter(([_, value]) => value !== undefined)
      .map(([key, value]) => `${key}=${value}`)
      .join(",");

    return `${type}${labelString ? `{${labelString}}` : ""}`;
  }

  /**
   * Increment a counter metric
   */
  public incrementCounter(
    type: MetricType,
    value: number = 1,
    labels: MetricLabels = {}
  ): void {
    const key = SyncMetrics.createKey(type, labels);
    const currentValue = this.counters.get(key) || 0;
    const newValue = currentValue + value;

    this.counters.set(key, newValue);
    this.recordMetric(type, newValue, labels);
  }

  /**
   * Set a gauge metric to a specific value
   */
  public setGauge(
    type: MetricType,
    value: number,
    labels: MetricLabels = {}
  ): void {
    const key = SyncMetrics.createKey(type, labels);
    this.gauges.set(key, value);
    this.recordMetric(type, value, labels);
  }

  /**
   * Record timing information
   */
  public recordTiming(
    type: MetricType,
    durationMs: number,
    labels: MetricLabels = {}
  ): void {
    this.recordMetric(type, durationMs, labels);
  }

  /**
   * Start a timer and return a function to stop it and record the duration
   */
  public startTimer(type: MetricType, labels: MetricLabels = {}): () => number {
    const startTime = Date.now();

    return () => {
      const duration = Date.now() - startTime;
      this.recordTiming(type, duration, labels);
      return duration;
    };
  }

  /**
   * Get current counter value
   */
  public getCounter(type: MetricType, labels: MetricLabels = {}): number {
    const key = SyncMetrics.createKey(type, labels);
    return this.counters.get(key) || 0;
  }

  /**
   * Get current gauge value
   */
  public getGauge(type: MetricType, labels: MetricLabels = {}): number {
    const key = SyncMetrics.createKey(type, labels);
    return this.gauges.get(key) || 0;
  }

  /**
   * Record a metric value
   */
  private recordMetric(
    type: MetricType,
    value: number,
    labels: MetricLabels = {}
  ): void {
    this.metrics.push({
      type,
      value,
      timestamp: Date.now(),
      labels: { ...labels },
    });
  }

  /**
   * Clean up metrics older than retention period
   */
  private cleanupOldMetrics(): void {
    const cutoffTime = Date.now() - this.METRICS_RETENTION_MS;
    this.metrics = this.metrics.filter(
      (entry) => entry.timestamp >= cutoffTime
    );
  }

  /**
   * Get metrics within a time range, optionally filtered by type and labels
   */
  public getMetrics(
    options: {
      type?: MetricType;
      labels?: Partial<MetricLabels>;
      startTime?: number;
      endTime?: number;
    } = {}
  ): MetricEntry[] {
    const { type, labels, startTime, endTime } = options;
    let filtered = [...this.metrics];

    if (type) {
      filtered = filtered.filter((entry) => entry.type === type);
    }

    if (labels) {
      filtered = filtered.filter((entry) => {
        return Object.entries(labels).every(([key, value]) => {
          return entry.labels[key] === value;
        });
      });
    }

    if (startTime) {
      filtered = filtered.filter((entry) => entry.timestamp >= startTime);
    }

    if (endTime) {
      filtered = filtered.filter((entry) => entry.timestamp <= endTime);
    }

    return filtered;
  }

  /**
   * Calculate statistics for a metric type
   */
  public getStats(
    type: MetricType,
    labels: MetricLabels = {},
    timeRangeMs: number = 60 * 60 * 1000 // Default to last hour
  ): {
    count: number;
    sum: number;
    min: number;
    max: number;
    avg: number;
    p50: number; // median
    p90: number; // 90th percentile
    p99: number; // 99th percentile
  } {
    const startTime = Date.now() - timeRangeMs;
    const metrics = this.getMetrics({
      type,
      labels,
      startTime,
    });

    if (metrics.length === 0) {
      return {
        count: 0,
        sum: 0,
        min: 0,
        max: 0,
        avg: 0,
        p50: 0,
        p90: 0,
        p99: 0,
      };
    }

    const values = metrics.map((m) => m.value).sort((a, b) => a - b);
    const sum = values.reduce((a, b) => a + b, 0);

    const p50Index = Math.floor(values.length * 0.5);
    const p90Index = Math.floor(values.length * 0.9);
    const p99Index = Math.floor(values.length * 0.99);

    return {
      count: values.length,
      sum,
      min: values[0],
      max: values[values.length - 1],
      avg: sum / values.length,
      p50: values[p50Index],
      p90: values[p90Index],
      p99: values[p99Index],
    };
  }

  /**
   * Generate a report of the current sync metrics
   */
  public getSummary(): Record<string, any> {
    const now = Date.now();
    const lastHour = now - 60 * 60 * 1000;
    const lastDay = now - 24 * 60 * 60 * 1000;

    const summary: Record<string, any> = {
      counters: {},
      gauges: {},
      timings: {
        lastHour: {},
        lastDay: {},
      },
    };

    // Collect counter metrics
    for (const [key, value] of this.counters.entries()) {
      summary.counters[key] = value;
    }

    // Collect gauge metrics
    for (const [key, value] of this.gauges.entries()) {
      summary.gauges[key] = value;
    }

    // Collect timing metrics
    [
      MetricType.SYNC_DURATION,
      MetricType.HANDLER_DURATION,
      MetricType.RETRY_DELAY,
    ].forEach((metricType) => {
      summary.timings.lastHour[metricType] = this.getStats(
        metricType,
        {},
        60 * 60 * 1000
      );
      summary.timings.lastDay[metricType] = this.getStats(
        metricType,
        {},
        24 * 60 * 60 * 1000
      );
    });

    return summary;
  }

  /**
   * Reset all metrics
   */
  public reset(): void {
    this.metrics = [];
    this.counters.clear();
    this.gauges.clear();
  }
}

// Export singleton instance
export const syncMetrics = SyncMetrics.getInstance();
