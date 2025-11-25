import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AxiosError } from 'axios';
import { retryWithBackoff, getErrorMessage } from './retryWithBackoff';

describe('retryWithBackoff', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return result on first success', async () => {
    const fn = vi.fn().mockResolvedValue('success');
    
    const result = await retryWithBackoff(fn);
    
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should retry on network error', async () => {
    const error = new Error('Network error') as AxiosError;
    error.code = 'ERR_NETWORK';
    error.isAxiosError = true;
    
    const fn = vi.fn()
      .mockRejectedValueOnce(error)
      .mockResolvedValue('success');
    
    const promise = retryWithBackoff(fn, { maxRetries: 1, initialDelay: 1000 });
    
    // Fast-forward time
    await vi.runAllTimersAsync();
    
    const result = await promise;
    
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should retry on 5xx server error', async () => {
    const error = {
      isAxiosError: true,
      response: { status: 500 }
    } as AxiosError;
    
    const fn = vi.fn()
      .mockRejectedValueOnce(error)
      .mockResolvedValue('success');
    
    const promise = retryWithBackoff(fn, { maxRetries: 1, initialDelay: 1000 });
    
    await vi.runAllTimersAsync();
    
    const result = await promise;
    
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should retry on 429 Too Many Requests', async () => {
    const error = {
      isAxiosError: true,
      response: { status: 429 }
    } as AxiosError;
    
    const fn = vi.fn()
      .mockRejectedValueOnce(error)
      .mockResolvedValue('success');
    
    const promise = retryWithBackoff(fn, { maxRetries: 1, initialDelay: 1000 });
    
    await vi.runAllTimersAsync();
    
    const result = await promise;
    
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should not retry on 4xx client error (except 429)', async () => {
    const error = {
      isAxiosError: true,
      response: { status: 404 }
    } as AxiosError;
    
    const fn = vi.fn().mockRejectedValue(error);
    
    await expect(retryWithBackoff(fn, { maxRetries: 3 })).rejects.toEqual(error);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should use exponential backoff', async () => {
    const error = new Error('Network error') as AxiosError;
    error.code = 'ERR_NETWORK';
    error.isAxiosError = true;
    
    const fn = vi.fn()
      .mockRejectedValueOnce(error)
      .mockRejectedValueOnce(error)
      .mockResolvedValue('success');
    
    const onRetry = vi.fn();
    
    const promise = retryWithBackoff(fn, {
      maxRetries: 2,
      initialDelay: 1000,
      backoffMultiplier: 2,
      onRetry
    });
    
    await vi.runAllTimersAsync();
    
    await promise;
    
    expect(onRetry).toHaveBeenCalledTimes(2);
    expect(onRetry).toHaveBeenNthCalledWith(1, 1, error);
    expect(onRetry).toHaveBeenNthCalledWith(2, 2, error);
  });

  it('should respect maxDelay', async () => {
    const error = new Error('Network error') as AxiosError;
    error.code = 'ERR_NETWORK';
    error.isAxiosError = true;
    
    const fn = vi.fn()
      .mockRejectedValueOnce(error)
      .mockRejectedValueOnce(error)
      .mockResolvedValue('success');
    
    const promise = retryWithBackoff(fn, {
      maxRetries: 2,
      initialDelay: 1000,
      backoffMultiplier: 10,
      maxDelay: 2000
    });
    
    await vi.runAllTimersAsync();
    
    await promise;
    
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('should throw error after max retries', async () => {
    const error = new Error('Network error') as AxiosError;
    error.code = 'ERR_NETWORK';
    error.isAxiosError = true;
    
    const fn = vi.fn().mockRejectedValue(error);
    
    const promise = retryWithBackoff(fn, { maxRetries: 2, initialDelay: 100 });
    
    await vi.runAllTimersAsync();
    
    await expect(promise).rejects.toEqual(error);
    expect(fn).toHaveBeenCalledTimes(3); // Initial + 2 retries
  });
});

describe('getErrorMessage', () => {
  it('should return network error message', () => {
    const error = new Error('Network error') as AxiosError;
    error.code = 'ERR_NETWORK';
    error.isAxiosError = true;
    
    expect(getErrorMessage(error)).toBe('Network error. Please check your internet connection.');
  });

  it('should return timeout error message', () => {
    const error = new Error('Timeout') as AxiosError;
    error.code = 'ETIMEDOUT';
    error.isAxiosError = true;
    
    expect(getErrorMessage(error)).toBe('Request timed out. Please try again.');
  });

  it('should return 429 error message', () => {
    const error = {
      isAxiosError: true,
      response: { status: 429 }
    } as AxiosError;
    
    expect(getErrorMessage(error)).toBe('Too many requests. Please wait a moment and try again.');
  });

  it('should return 5xx error message', () => {
    const error = {
      isAxiosError: true,
      response: { status: 500 }
    } as AxiosError;
    
    expect(getErrorMessage(error)).toBe('Server error. Please try again later.');
  });

  it('should return 404 error message', () => {
    const error = {
      isAxiosError: true,
      response: { status: 404 }
    } as AxiosError;
    
    expect(getErrorMessage(error)).toBe('Location not found. Please try a different city.');
  });

  it('should return custom error message from response', () => {
    const error = {
      isAxiosError: true,
      response: { 
        status: 400,
        data: { message: 'Custom error message' }
      }
    } as AxiosError;
    
    expect(getErrorMessage(error)).toBe('Custom error message');
  });

  it('should return error message from Error object', () => {
    const error = new Error('Something went wrong');
    
    expect(getErrorMessage(error)).toBe('Something went wrong');
  });

  it('should return default message for unknown error', () => {
    const error = { unknown: 'error' };
    
    expect(getErrorMessage(error)).toBe('An unexpected error occurred. Please try again.');
  });
});
