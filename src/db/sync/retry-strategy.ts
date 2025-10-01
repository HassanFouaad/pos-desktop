import { networkErrorAnalyzer } from "../../utils/network-errors";
import { LogCategory, syncLogger } from "./logger";

/**
 * Retry strategy options
 */
export interface RetryStrategyOptions {
  /**
   * Maximum number of retry attempts
   * @default 5
   */
  maxRetries?: number;

  /**
   * Base delay in milliseconds
   * @default 1000
   */
  baseDelay?: number;

  /**
   * Maximum delay in milliseconds
   * @default 60000 (1 minute)
   */
  maxDelay?: number;

  /**
   * Exponential backoff factor
   * @default 2
   */
  backoffFactor?: number;

  /**
   * Maximum jitter as a percentage of the delay
   * @default 0.2 (20%)
   */
  jitterFactor?: number;
}

/**
 * Service for managing retry strategies with exponential backoff and jitter
 */
export class RetryStrategy {
  private static instance: RetryStrategy;

  // Default options
  private readonly DEFAULT_OPTIONS: RetryStrategyOptions = {
    maxRetries: 5,
    baseDelay: 1000,
    maxDelay: 60000,
    backoffFactor: 2,
    jitterFactor: 0.2,
  };

  private constructor() {}

  public static getInstance(): RetryStrategy {
    if (!RetryStrategy.instance) {
      RetryStrategy.instance = new RetryStrategy();
    }
    return RetryStrategy.instance;
  }

  /**
   * Calculate the next retry time with exponential backoff and jitter
   *
   * @param retryCount Current retry count
   * @param options Retry strategy options
   * @returns Date object for the next retry time
   */
  public calculateNextRetryTime(
    retryCount: number,
    options: RetryStrategyOptions = {}
  ): Date {
    const {
      baseDelay = this.DEFAULT_OPTIONS.baseDelay!,
      maxDelay = this.DEFAULT_OPTIONS.maxDelay!,
      backoffFactor = this.DEFAULT_OPTIONS.backoffFactor!,
      jitterFactor = this.DEFAULT_OPTIONS.jitterFactor!,
    } = options;

    // Calculate base delay with exponential backoff
    let delay = Math.min(
      baseDelay * Math.pow(backoffFactor, retryCount),
      maxDelay
    );

    // Add jitter to prevent thundering herd problem
    const jitterRange = delay * jitterFactor;
    const jitter = Math.random() * jitterRange - jitterRange / 2;
    delay = Math.max(0, delay + jitter);

    // No metrics recording needed

    // Log the calculated delay
    syncLogger.debug(
      LogCategory.SYNC,
      `Calculated retry delay: ${Math.round(delay)}ms for retry ${retryCount}`,
      { retryCount, delay: Math.round(delay) }
    );

    // Return the next retry time
    return new Date(Date.now() + delay);
  }

  /**
   * Determine if an error is retryable based on its characteristics
   *
   * @param error The error to analyze
   * @returns True if the error is retryable
   */
  public isRetryableError(error: any): boolean {
    // Use the network error analyzer for detailed analysis
    const errorInfo = networkErrorAnalyzer.analyzeError(error);
    return errorInfo.retryable;
  }

  /**
   * Get suggested retry delay for a specific error
   *
   * @param error The error to analyze
   * @param retryCount Current retry count
   * @param options Retry strategy options
   * @returns Suggested delay in milliseconds
   */
  public getSuggestedRetryDelay(
    error: any,
    retryCount: number,
    options: RetryStrategyOptions = {}
  ): number {
    // Check if the error contains a suggested retry delay
    const errorInfo = networkErrorAnalyzer.analyzeError(error);
    if (errorInfo.suggestedRetryDelayMs) {
      return errorInfo.suggestedRetryDelayMs;
    }

    // Otherwise calculate based on retry count
    const nextRetryTime = this.calculateNextRetryTime(retryCount, options);
    return nextRetryTime.getTime() - Date.now();
  }

  /**
   * Check if maximum retries have been exceeded
   *
   * @param retryCount Current retry count
   * @param options Retry strategy options
   * @returns True if max retries exceeded
   */
  public isMaxRetriesExceeded(
    retryCount: number,
    options: RetryStrategyOptions = {}
  ): boolean {
    const maxRetries = options.maxRetries ?? this.DEFAULT_OPTIONS.maxRetries!;
    return retryCount >= maxRetries;
  }
}

export const retryStrategy = RetryStrategy.getInstance();
