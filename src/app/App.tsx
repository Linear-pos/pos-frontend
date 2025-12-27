import { RouterProvider } from "react-router-dom";
import { router } from "./router";
// import { AuthProvider } from "./providers/AuthProvider";
// import { QueryProvider } from "./providers/QueryProvider";
import { ThemeProvider } from "./providers/ThemeProvider";
// import { SocketProvider } from "./providers/SocketProvider";
// import { Layout } from "@/components/layout/Layout";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
