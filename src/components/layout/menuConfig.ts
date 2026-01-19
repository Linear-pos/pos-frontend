import {
  Clipboard,
  Home,
  ShoppingBag,
  Table,
  LineChart,
  CreditCard,
} from "lucide-react";
import type { SidebarProps } from "./Sidebar";

export const MenuConfig: SidebarProps = {
  brandLogo: "/OmniPos.png",
  brandName: "OmniPos",
  brandSubtitle: "Point of Sale System",
  brandUrl: "/",
  menuGroups: [
    {
      label: "Main",
      items: [
        {
          title: "Overview",
          url: "/",
          icon: Home,
        },
        {
          title: "Sales",
          url: "/dashboard/sales",
          icon: ShoppingBag,
        },
        {
          title: "Analytics",
          url: "/dashboard/analytics",
          icon: LineChart,
        },
        // Admin-only items
        {
          title: "Branches",
          url: "/dashboard/branches",
          icon: Table,
          roles: ["SYSTEM_ADMIN"], // Only visible to admins
        },
        {
          title: "Users",
          url: "/dashboard/users",
          icon: Table,
          roles: ["SYSTEM_ADMIN"], // Only visible to admins
        },
        {
          title: "Products",
          url: "/dashboard/products-catalog",
          icon: Table,
          roles: ["SYSTEM_ADMIN"], // Only visible to admins
        },
        {
          title: "Account Profile",
          url: "/dashboard/profile",
          icon: Table,
          roles: ["SYSTEM_ADMIN"], // Only visible to admins  
        },
        {
          title: "Licensing",
          url: "/dashboard/licensing",
          icon: CreditCard,
          roles: ["SYSTEM_ADMIN"], // Only visible to admins
        },
        // Shared items
        {
          title: "Inventory",
          url: "/dashboard/inventory",
          icon: Table,
        },
        {
          title: "Reports",
          url: "/dashboard/reports",
          icon: Clipboard,
        }
      ],
    },
  ],

  footerGroups: [],
};
