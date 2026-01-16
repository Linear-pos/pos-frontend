import {
  Clipboard,
  Home,
  ShoppingBag,
  Table,
  LineChart,
} from "lucide-react";
import type { SidebarProps } from "./Sidebar";

export const MenuConfig: SidebarProps = {
  brandLogo: "/logo.png",
  brandName: "Retail POS",
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
        {
          title: "Products",
          url: "/dashboard/products",
          icon: Table,
        },
        {
          title: "Inventory",
          url: "/dashboard/inventory",
          icon: Table, // Using Table icon for now, or Package if available
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
