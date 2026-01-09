import { ErrorBoundary as ReactErrorBoundary } from "react-error-boundary";
import { AlertCircle, Home, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface RouteErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

function RouteErrorFallback({
  error,
  resetErrorBoundary,
}: RouteErrorFallbackProps) {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-md p-8 bg-card rounded-lg shadow-lg border border-error-200">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="w-6 h-6 text-error-600" />
          <h1 className="text-2xl font-bold text-error-700">Page Error</h1>
        </div>

        <div className="mb-6">
          <p className="text-muted-foreground mb-4">
            This page encountered an error and couldn't load properly.
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
            size="sm"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
          <Button
            onClick={() => navigate("/")}
            variant="outline"
            className="flex-1"
            size="sm"
          >
            <Home className="h-4 w-4 mr-2" />
            Home
          </Button>
        </div>
      </div>
    </div>
  );
}

interface RouteErrorBoundaryProps {
  children: React.ReactNode;
  routeName?: string;
}

export function RouteErrorBoundary({
  children,
  routeName = "Route",
}: RouteErrorBoundaryProps) {
  return (
    <ReactErrorBoundary
      FallbackComponent={RouteErrorFallback}
      onError={(error, errorInfo) => {
        console.error(`[${routeName}] Error boundary caught:`, error);
        console.error(`[${routeName}] Error info:`, errorInfo);
      }}
      onReset={() => {
        // Reset error state
        window.location.href = window.location.pathname;
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
}

export default RouteErrorBoundary;
