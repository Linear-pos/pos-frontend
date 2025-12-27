import { ErrorBoundary as ReactErrorBoundary } from "react-error-boundary";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-error-50 to-error-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg border border-error-200">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="w-6 h-6 text-error-600" />
          <h1 className="text-2xl font-bold text-error-700">
            Oops! Something went wrong
          </h1>
        </div>

        <div className="mb-6">
          <p className="text-muted-foreground mb-4">
            An unexpected error occurred. Our team has been notified. Please try
            again or contact support.
          </p>

          <details className="mb-4">
            <summary className="cursor-pointer text-sm font-medium text-neutral-700 hover:text-neutral-900">
              Error details
            </summary>
            <pre className="mt-2 p-3 bg-neutral-100 rounded text-xs overflow-auto max-h-40 text-error-600">
              {error.message}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          </details>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={resetErrorBoundary}
            className="flex-1"
            variant="default"
          >
            Try again
          </Button>
          <Button
            onClick={() => (window.location.href = "/")}
            variant="outline"
            className="flex-1"
          >
            Go home
          </Button>
        </div>
      </div>
    </div>
  );
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export function ErrorBoundary({ children }: ErrorBoundaryProps) {
  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        console.error("Error caught by boundary:", error);
        console.error("Error info:", errorInfo);
        // You can also send to error tracking service here
        // e.g., Sentry.captureException(error);
      }}
      onReset={() => {
        // Clear any error state if needed
        window.location.href = "/";
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
}
