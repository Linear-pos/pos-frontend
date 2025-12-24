import {
  Check,
  Clipboard,
  CreditCard,
  Home,
  ShoppingBag,
  Table,
} from "lucide-react";
import type { SidebarProps } from "./Sidebar";
import { colors } from "@/constants/colors";

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

// Brand colors for consistent theming
export const brandColors = {
  primary: colors.primary[600],
  primaryLight: colors.primary[500],
  primaryDark: colors.primary[700],
  success: colors.success[600],
  warning: colors.warning[600],
  error: colors.error[600],
} as const;
