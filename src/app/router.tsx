import { createBrowserRouter, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import { RootLayout } from "./RootLayout";
import { ProtectedLayout } from "@/components/layout/ProtectedLayout";
import { POSLayout } from "@/components/layout/POSLayout";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { RouteErrorBoundary } from "@/components/RouteErrorBoundary";
import PagePlaceholder from "@/components/common/PagePlaceholder";

// Lazy load components
const POSTerminal = lazy(() => import("../features/pos/pages/POSTerminal").then(module => ({ default: module.POSTerminal }))); // Updated path
const LoginPage = lazy(() => import("../features/auth/LoginPage").then(module => ({ default: module.LoginPage })));
const Products = lazy(() => import("../features/products/pages/Products"));
const SalesHistory = lazy(() => import("../features/sales/SalesHistory"));

// Loading component
const LoadingFallback = () => (
  <div className="flex items-center justify-center w-full h-64">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

export const router = createBrowserRouter([
  {
    path: "/login",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <LoginPage />
      </Suspense>
    ),
  },
  {
    path: "/",
    element: <RootLayout />,
    children: [
      // Root Redirect Logic (handled by ProtectedLayout)
      {
        path: "/",
        element: <ProtectedLayout />,
      },

      // POS Routes (Cashier & Manager)
      {
        path: "/pos",
        element: <ProtectedLayout />,
        children: [
          {
            element: <POSLayout />,
            children: [
              {
                index: true,
                element: (
                  <RouteErrorBoundary routeName="POS">
                    <Suspense fallback={<LoadingFallback />}>
                      <POSTerminal />
                    </Suspense>
                  </RouteErrorBoundary>
                ),
              },
            ],
          },
        ],
      },

      // Dashboard / Admin Routes (Manager Only)
      // Note: ProtectedLayout checks specific roles if we pass them, or we can rely on its global bouncer 
      // strictly for cashier. 
      // For now, Managers access these. Cashiers redirected to POS by ProtectedLayout Bouncer if they try.
      // Dashboard / Admin Routes (Manager Only)
      {
        element: <ProtectedLayout requiredRole={['SYSTEM_OWNER', 'BRANCH_MANAGER']} />,
        children: [
          {
            path: "dashboard",
            element: <DashboardLayout />,
            children: [
              {
                index: true,
                element: <Navigate to="overview" replace />,
              },
              {
                path: "overview",
                element: <PagePlaceholder pageName="Dashboard Overview" />,
              },
              {
                path: "products",
                element: (
                  <RouteErrorBoundary routeName="Products">
                    <Suspense fallback={<LoadingFallback />}>
                      <Products />
                    </Suspense>
                  </RouteErrorBoundary>
                ),
              },
              {
                path: "products/:productId/barcodes",
                element: <PagePlaceholder pageName="Product Barcodes" />,
              },
              {
                path: "sales",
                element: (
                  <RouteErrorBoundary routeName="Sales History">
                    <Suspense fallback={<LoadingFallback />}>
                      <SalesHistory />
                    </Suspense>
                  </RouteErrorBoundary>
                ),
              },
              {
                path: "inventory",
                element: <PagePlaceholder pageName="Inventory Management" />,
              },
              {
                path: "reports",
                element: <PagePlaceholder pageName="Reports" />,
              },
            ],
          },
        ],
      },

      // Unauthorized Page
      {
        path: "/unauthorized",
        element: (
          <div className="flex items-center justify-center w-full h-screen">
            <div className="text-center">
              <h1 className="text-4xl font-bold">403</h1>
              <p className="mt-4 text-lg text-muted-foreground">
                You do not have permission to access this page.
              </p>
            </div>
          </div>
        ),
      },
      {
        path: "*",
        element: (
          <div className="flex items-center justify-center w-full h-screen">
            <div className="text-center">
              <h1 className="text-4xl font-bold">404</h1>
              <p className="mt-4 text-lg text-muted-foreground">
                Page not found
              </p>
            </div>
          </div>
        ),
      },
    ],
  },
]);
