import { createHashRouter, Navigate } from "react-router-dom";
import { RootLayout } from "./RootLayout";
import { DefaultRedirect } from "./DefaultRedirect";
import { ProtectedLayout } from "@/components/layout/ProtectedLayout";
import { TerminalAwareLayout } from "@/components/layout/TerminalAwareLayout";
import { POSLayout } from "@/components/layout/POSLayout";
import ManagerDashboardLayout from "@/components/layout/ManagerDashboardLayout";
import AdminDashboardLayout from "@/components/layout/AdminDashboardLayout";
import PagePlaceholder from "@/components/common/PagePlaceholder";
import { createLazyRoute, createLazyIndexRoute } from "./routeHelpers";

export const router = createHashRouter([
  createLazyRoute("/login", () => import("@/components/auth/LoginPage").then(m => ({ default: m.LoginPage })), "Login"),
  createLazyRoute("/select-mode", () => import("@/components/auth/SelectModePage").then(m => ({ default: m.SelectModePage })), "Select Mode"),
  createLazyRoute("/terminal-login", () => import("@/components/auth/TerminalLoginPage").then(m => ({ default: m.TerminalLoginPage })), "Terminal Login"),
  // createLazyRoute("/pin-reset", () => import("@/components/auth/PinResetPage").then(m => ({ default: m.PinResetPage })), "PIN Reset"),
  createLazyRoute("/unauthorized", () => import("@/components/auth/UnauthorizedPage").then(m => ({ default: m.UnauthorizedPage })), "Unauthorized"),
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <Navigate to="/pos" replace />,
    children: [
      {
        index: true,
        element: <DefaultRedirect />,
      },
    ],
  },

  // Dashboard Redirect (Legacy/Convenience)
  {
    path: "/dashboard",
    element: <ProtectedLayout />,
    children: [
      {
        index: true,
        // Role-based redirection can be handled by a component or we just redirect to manager for now
        // Ideally LoginPage should send them to the right place.
        element: <Navigate to="/manager" replace />,
      }
    ]
  },

  // POS Routes (Cashier & Manager)
  // Uses TerminalAwareLayout to support PIN overlay in terminal mode
  {
    path: "/pos",
    element: <TerminalAwareLayout />,
    children: [
      {
        element: <POSLayout />,
        children: [
          createLazyIndexRoute(
            () => import("../features/pos/pages/POSTerminal").then(m => ({ default: m.POSTerminal })),
            "POS"
          ),
          createLazyRoute(
            "receipt/:saleId",
            () => import("../features/pos/pages/ReceiptPage").then(m => ({ default: m.ReceiptPage })),
            "Receipt"
          ),
        ],
      },
    ],
  },

  // Cashier Routes
  {
    path: "/cashier",
    element: <ProtectedLayout />,
    children: [
      createLazyRoute(
        "login",
        () => import("../app/cashier/CashierLogin").then(m => ({ default: m.CashierLogin })),
        "Cashier Login"
      ),
      createLazyRoute(
        "terminal-select",
        () => import("../app/cashier/TerminalSelection").then(m => ({ default: m.TerminalSelection })),
        "Terminal Selection"
      ),
      createLazyRoute(
        "shift",
        () => import("../app/cashier/ShiftManagement").then(m => ({ default: m.ShiftManagement })),
        "Shift Management"
      ),
    ],
  },

  // Manager Routes
  {
    path: "/manager",
    element: <ProtectedLayout requiredRole="BRANCH_MANAGER" />,
    children: [
      {
        element: <ManagerDashboardLayout />,
        children: [
          createLazyIndexRoute(
            () => import("../features/admin/dashboard/pages/DashboardOverview"),
            "Manager Overview"
          ),
          createLazyRoute("sales", () => import("../features/sales/SalesHistory"), "Sales History"),
          createLazyRoute("inventory", () => import("../features/products/pages/InventoryPage"), "Inventory"),
          createLazyRoute("analytics", () => import("../features/admin/dashboard/pages/AnalyticsPage"), "Analytics"),
          createLazyRoute(
            "reports",
            () => Promise.resolve({ default: () => <PagePlaceholder pageName="Reports" /> }),
            "Reports"
          ),
          createLazyRoute(
            "cashiers",
            () => import("../features/admin/pages/CashierManagement").then(m => ({ default: m.default })),
            "Cashier Management"
          ),
          createLazyRoute(
            "terminals",
            () => import("../features/admin/pages/TerminalManagement").then(m => ({ default: m.default })),
            "Terminal Management"
          ),
          createLazyRoute(
            "profile",
            () => import("../features/admin/pages/AccountProfile"),
            "Account Profile"
          ),
        ],
      },
    ],
  },

  // Admin Routes
  {
    path: "/admin",
    element: <ProtectedLayout requiredRole="SYSTEM_ADMIN" />,
    children: [
      {
        element: <AdminDashboardLayout />,
        children: [
          createLazyIndexRoute(
            () => import("../features/admin/dashboard/pages/DashboardOverview"),
            "Admin Overview"
          ),
          createLazyRoute(
            "branches",
            () => import("../features/admin/pages/BranchManagement").then(m => ({ default: m.BranchManagement })),
            "Branch Management"
          ),
          createLazyRoute(
            "users",
            () => import("../features/admin/pages/UserManagement").then(m => ({ default: m.UserManagement })),
            "User Management"
          ),
          createLazyRoute(
            "products",
            () => import("../features/admin/pages/ProductCatalog"),
            "Product Catalog"
          ),
          createLazyRoute("sales", () => import("../features/sales/SalesHistory"), "Sales History"),
          createLazyRoute("inventory", () => import("../features/products/pages/InventoryPage"), "Inventory"),
          createLazyRoute("analytics", () => import("../features/admin/dashboard/pages/AnalyticsPage"), "Analytics"),
          createLazyRoute(
            "reports",
            () => Promise.resolve({ default: () => <PagePlaceholder pageName="Reports" /> }),
            "Reports"
          ),
          createLazyRoute(
            "licensing",
            () => import("../features/admin/pages/LicensingManagement").then(m => ({ default: m.default })),
            "Licensing"
          ),
          createLazyRoute(
            "settings",
            () => Promise.resolve({ default: () => <PagePlaceholder pageName="Settings" /> }),
            "Settings"
          ),
          createLazyRoute(
            "profile",
            () => import("../features/admin/pages/AccountProfile"),
            "Account Profile"
          ),
        ],
      },
    ],
  },
]);
