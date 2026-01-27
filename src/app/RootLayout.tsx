import { Outlet } from "react-router-dom";
import { AuthProvider } from "./providers/AuthProvider";
import { QueryProvider } from "./providers/QueryProvider";
import { ThemeProvider } from "./providers/ThemeProvider";
import { SocketProvider } from "./providers/SocketProvider";
import { AuthDebugPanel } from "@/components/debug/AuthDebugPanel";
import { SessionMonitorWrapper } from "@/components/auth/SessionMonitorWrapper";

export function RootLayout() {
  return (
    <ThemeProvider defaultTheme="system">
      <QueryProvider>
        <AuthProvider>
          <SocketProvider>
            <SessionMonitorWrapper>
              <Outlet />
            </SessionMonitorWrapper>
            {/* Debug Panel - Remove this in production */}
            {import.meta.env.DEV && <AuthDebugPanel />}
          </SocketProvider>
        </AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
