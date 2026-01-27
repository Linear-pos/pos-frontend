import {
    Home,
    ShoppingBag,
    Package,
    Users,
    Monitor,
    LineChart,
    FileText,
    User,
} from "lucide-react";
import type { SidebarProps } from "./Sidebar";

export const ManagerMenuConfig: SidebarProps = {
    brandLogo: "/OmniPos.png",
    brandName: "OmniPos",
    brandSubtitle: "Branch Operations",
    brandUrl: "/manager",
    menuGroups: [
        {
            label: "Operations",
            items: [
                {
                    title: "Overview",
                    url: "/manager",
                    icon: Home,
                },
                {
                    title: "Sales",
                    url: "/manager/sales",
                    icon: ShoppingBag,
                },
                {
                    title: "Inventory",
                    url: "/manager/inventory",
                    icon: Package,
                },
                {
                    title: "Analytics",
                    url: "/manager/analytics",
                    icon: LineChart,
                },
                {
                    title: "Reports",
                    url: "/manager/reports",
                    icon: FileText,
                },
            ],
        },
        {
            label: "Staff Management",
            items: [
                {
                    title: "Cashiers",
                    url: "/manager/cashiers",
                    icon: Users,
                },
                {
                    title: "Terminals",
                    url: "/manager/terminals",
                    icon: Monitor,
                },
            ],
        },
        {
            label: "Account",
            items: [
                {
                    title: "Profile",
                    url: "/manager/profile",
                    icon: User,
                },
            ],
        },
    ],

    footerGroups: [],
};
