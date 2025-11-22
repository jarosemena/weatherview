import axios from 'axios';

export interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  onRetry?: (attempt: number, error: unknown) => void;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
  onRetry: () => {}
};

function isRetryableError(error: unknown): boolean {
  if (axios.isAxiosError(error)) {
    // Retry on network errors
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT' || error.code === 'ERR_NETWORK') {
      return true;
    }
    
    // Retry on 5xx server errors
    const status = error.response?.status;
    if (status && status >= 500 && status < 600) {
      return true;
    }
    
    // Retry on 429 (Too Many Requests)
    if (status === 429) {
      return true;
    }
  }
  
  return false;
}

function calculateDelay(attempt: number, options: Required<RetryOptions>): number {
  const delay = options.initialDelay * Math.pow(options.backoffMultiplier, attempt);
  return Math.min(delay, options.maxDelay);
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: unknown;

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry if it's not a retryable error
      if (!isRetryableError(error)) {
        throw error;
      }

      // Don't retry if we've exhausted all attempts
      if (attempt === opts.maxRetries) {
        throw error;
      }

      // Calculate delay and notify
      const delay = calculateDelay(attempt, opts);
      opts.onRetry(attempt + 1, error);

      // Wait before retrying
      await sleep(delay);
    }
  }

  throw lastError;
}

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.code === 'ERR_NETWORK') {
      return 'Network error. Please check your internet connection.';
    }
    
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return 'Request timed out. Please try again.';
    }
    
    const status = error.response?.status;
    if (status === 429) {
      return 'Too many requests. Please wait a moment and try again.';
    }
    
    if (status && status >= 500) {
      return 'Server error. Please try again later.';
    }
    
    if (status === 404) {
      return 'Location not found. Please try a different city.';
    }
    
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred. Please try again.';
}
