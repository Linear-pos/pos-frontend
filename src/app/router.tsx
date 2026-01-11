import { createBrowserRouter } from "react-router-dom";
import { Suspense, lazy } from "react";
import { AuthGuard } from "./guards/AuthGuard";
import { RoleGuard } from "./guards/RoleGuard";
import { RootLayout } from "./RootLayout";
import { RouteErrorBoundary } from "@/components/RouteErrorBoundary";
import PagePlaceholder from "@/components/common/PagePlaceholder";

// Lazy load components
const PosPage = lazy(() => import("../features/pos/PosPage").then(module => ({ default: module.PosPage })));
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
      {
        path: "/",
        element: (
          <AuthGuard>
            <RouteErrorBoundary routeName="POS">
              <Suspense fallback={<LoadingFallback />}>
                <PosPage />
              </Suspense>
            </RouteErrorBoundary>
          </AuthGuard>
        ),
      },
      {
        path: "/pos",
        element: (
          <AuthGuard>
            <RouteErrorBoundary routeName="POS">
              <Suspense fallback={<LoadingFallback />}>
                <PosPage />
              </Suspense>
            </RouteErrorBoundary>
          </AuthGuard>
        ),
      },
      {
        path: "/products",
        element: (
          <AuthGuard>
            <RoleGuard allowedRoles={["SYSTEM_OWNER", "BRANCH_MANAGER"]}>
              <RouteErrorBoundary routeName="Products">
                <Suspense fallback={<LoadingFallback />}>
                  <Products />
                </Suspense>
              </RouteErrorBoundary>
            </RoleGuard>
          </AuthGuard>
        ),
      },
      {
        path: "/products/:productId/barcodes",
        element: (
          <AuthGuard>
            <RoleGuard allowedRoles={["SYSTEM_OWNER", "BRANCH_MANAGER"]}>
              <RouteErrorBoundary routeName="Product Barcodes">
                <Suspense fallback={<LoadingFallback />}>
                </Suspense>
              </RouteErrorBoundary>
            </RoleGuard>
          </AuthGuard>
        ),
      },
      {
        path: "/sales",
        element: (
          <AuthGuard>
            <RoleGuard allowedRoles={["SYSTEM_OWNER", "BRANCH_MANAGER", "CASHIER"]}>
              <RouteErrorBoundary routeName="Sales History">
                <Suspense fallback={<LoadingFallback />}>
                  <SalesHistory />
                </Suspense>
              </RouteErrorBoundary>
            </RoleGuard>
          </AuthGuard>
        ),
      },
      {
        path: "/scanner",
        element: (
          <AuthGuard>
            <RoleGuard allowedRoles={["SYSTEM_OWNER", "BRANCH_MANAGER", "CASHIER"]}>
              <RouteErrorBoundary routeName="Barcode Scanner">
                <Suspense fallback={<LoadingFallback />}>
                </Suspense>
              </RouteErrorBoundary>
            </RoleGuard>
          </AuthGuard>
        ),
      },

      {
        path: "/reports",
        element: (
          <AuthGuard>
            <RoleGuard allowedRoles={["SYSTEM_OWNER", "BRANCH_MANAGER"]}>
         <PagePlaceholder pageName="Reports" />
            </RoleGuard>
          </AuthGuard>
        ),
      },

      {

        path: "/shifts",
        element: (
          <AuthGuard>
            <RoleGuard allowedRoles={["SYSTEM_OWNER", "BRANCH_MANAGER", "CASHIER"]}>
              <PagePlaceholder pageName="Shifts" />
            </RoleGuard>
          </AuthGuard>
        ),
      },
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
