import {
  Check,
  Clipboard,
  CreditCard,
  Home,
  ShoppingBag,
  Table,
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
      ],
    },
    {
      label: "Management",
      items: [
        {
          title: "Sales",
          url: "/sales",
          icon: ShoppingBag,
        },
        {
          title: "Products",
          url: "/products",
          icon: Table,
        },
        {
          title: "Payments",
          url: "/payments",
          icon: CreditCard,
        },
        {
          title: "Shifts",
          url: "/shifts",
          icon: Check,
        },
        {
          title: "Reports",
          url: "/reports",
          icon: Clipboard,
        },
      ],
    },
  ],

  footerGroups: [],
};
