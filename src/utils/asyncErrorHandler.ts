/**
 * Async Error Handling Utilities
 * Provides utilities for better error handling in async operations
 */

interface AsyncErrorHandlerOptions {
  onError?: (error: Error) => void;
  onSuccess?: () => void;
  showToast?: boolean;
  toastMessage?: string;
}

/**
 * Wraps an async function with error handling
 * @param asyncFn The async function to wrap
 * @param options Error handling options
 */
export async function handleAsyncError<T>(
  asyncFn: () => Promise<T>,
  options: AsyncErrorHandlerOptions = {}
): Promise<T | null> {
  const { onError, onSuccess, showToast = false, toastMessage } = options;

  try {
    const result = await asyncFn();
    onSuccess?.();
    return result;
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error("Async operation failed:", err);
    onError?.(err);

    if (showToast) {
      // Import toast dynamically to avoid circular dependencies
      const { toast } = await import("sonner");
      toast.error(toastMessage || err.message);
    }

    return null;
  }
}

/**
 * Creates a safe error message from various error types
 */
export function getSafeErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as Record<string, unknown>).message === "string"
  ) {
    return (error as Record<string, unknown>).message as string;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as Record<string, unknown>).response === "object"
  ) {
    const response = (error as Record<string, unknown>).response;
    if (
      typeof response === "object" &&
      response !== null &&
      "data" in response
    ) {
      const data = (response as Record<string, unknown>).data;
      if (
        data &&
        typeof data === "object" &&
        "message" in data &&
        typeof (data as Record<string, unknown>).message === "string"
      ) {
        return (data as Record<string, unknown>).message as string;
      }
    }
  }

  return "An unexpected error occurred";
}

/**
 * Logs error details for debugging
 */
export function logError(error: unknown, context: string): void {
  const message = getSafeErrorMessage(error);
  console.error(`[${context}] ${message}`, error);
}

/**
 * Creates a retry wrapper for failed operations
 */
export async function retryAsync<T>(
  asyncFn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await asyncFn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.warn(
        `Attempt ${attempt}/${maxRetries} failed:`,
        lastError.message
      );

      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  throw lastError || new Error("Max retries exceeded");
}
