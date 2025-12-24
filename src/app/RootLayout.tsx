import { Outlet } from "react-router-dom";
import { AuthProvider } from "./providers/AuthProvider";
import { QueryProvider } from "./providers/QueryProvider";
import { ThemeProvider } from "./providers/ThemeProvider";
import { SocketProvider } from "./providers/SocketProvider";
import Layout from "@/components/layout/Layout";

export function RootLayout() {
  return (
    <ThemeProvider defaultTheme="system">
      <QueryProvider>
        <AuthProvider>
          <SocketProvider>
            <Layout>
              <Outlet />
            </Layout>
          </SocketProvider>
        </AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
