import { createBrowserRouter } from "react-router-dom";
import { PosPage } from "../features/pos/PosPage";
import { LoginPage } from "../features/auth/LoginPage";
import Products from "../features/products/pages/Products";
import { AuthGuard } from "./guards/AuthGuard";
import { RoleGuard } from "./guards/RoleGuard";

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <AuthGuard>
        <PosPage />
      </AuthGuard>
    ),
  },
  {
    path: "/pos",
    element: (
      <AuthGuard>
        <PosPage />
      </AuthGuard>
    ),
  },
  {
    path: "/products",
    element: (
      <AuthGuard>
        <RoleGuard allowedRoles={["SYSTEM_OWNER", "BRANCH_MANAGER"]}>
          <Products />
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
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "*",
    element: (
      <div className="flex items-center justify-center w-full h-screen">
        <div className="text-center">
          <h1 className="text-4xl font-bold">404</h1>
          <p className="mt-4 text-lg text-muted-foreground">Page not found</p>
        </div>
      </div>
    ),
  },
]);
