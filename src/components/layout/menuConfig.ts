import {
  Clipboard,
  Home,
  ShoppingBag,
  Table,
  Scan,
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
          title: "POS",
          url: "/",
          icon: Home,
        },
        {
          title: "Scanner",
          url: "/scanner",
          icon: Scan,
        },
      ],
    },
    {
      label: "Management",
      items: [
        {
          title: "Overview",
          url: "/dashboard/overview",
          icon: Home,
        },
        {
          title: "Sales",
          url: "/dashboard/sales",
          icon: ShoppingBag,
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
