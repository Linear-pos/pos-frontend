import { RouterProvider } from "react-router-dom";
import { router } from "./router";
// import { AuthProvider } from "./providers/AuthProvider";
// import { QueryProvider } from "./providers/QueryProvider";
import { ThemeProvider } from "./providers/ThemeProvider";
// import { SocketProvider } from "./providers/SocketProvider";
// import { Layout } from "@/components/layout/Layout";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Toaster } from "sonner";

declare global {
  interface Window {
    electron?: {
      platform: string;
      products: {
        import: (data: unknown) => Promise<unknown>;
        validate: (data: unknown) => Promise<unknown>;
      };
    };
  }
}


export function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <RouterProvider router={router} />
        <Toaster 
          position="top-right"
          expand={false}
          richColors
          closeButton
        />
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
