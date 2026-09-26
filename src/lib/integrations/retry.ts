export interface RetryOptions {
  maxAttempts?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffFactor?: number;
  jitter?: boolean;
}

export class PermanentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PermanentError";
  }
}

/**
 * Executes an async task with exponential backoff and randomized jitter.
 * Immediately aborts if a PermanentError is thrown (e.g. 401 Unauthorized or 404 Not Found).
 */
export async function executeWithRetry<T>(
  task: (attempt: number) => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const maxAttempts = options.maxAttempts ?? 3;
  const initialDelay = options.initialDelayMs ?? 500;
  const maxDelay = options.maxDelayMs ?? 10000;
  const factor = options.backoffFactor ?? 2;
  const useJitter = options.jitter ?? true;

  let attempt = 0;

  while (attempt < maxAttempts) {
    attempt++;
    try {
      return await task(attempt);
    } catch (err: any) {
      if (err instanceof PermanentError || attempt >= maxAttempts) {
        throw err;
      }

      // Check HTTP status if present on error
      if (err.status === 401 || err.status === 403 || err.status === 404) {
        throw new PermanentError(`Permanent HTTP error: ${err.status} ${err.message}`);
      }

      // Calculate exponential delay
      let delay = Math.min(initialDelay * Math.pow(factor, attempt - 1), maxDelay);
      if (useJitter) {
        delay = delay * (0.75 + Math.random() * 0.5); // 75% to 125% jitter
      }

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw new Error(`Failed to complete task after ${maxAttempts} attempts`);
}
