import {
    Home,
    ShoppingBag,
    Building2,
    Users,
    Package,
    LineChart,
    FileText,
    CreditCard,
    Settings,
    User,
    Barcode
} from "lucide-react";
import type { SidebarProps } from "./Sidebar";

export const AdminMenuConfig: SidebarProps = {
    brandLogo: "/omnipos-nobg.png",
    brandName: "OmniPos",
    brandSubtitle: "System Administration",
    brandUrl: "/admin",
    menuGroups: [
        {
            label: "Overview",
            items: [
                {
                    title: "Dashboard",
                    url: "/admin",
                    icon: Home,
                },
                {
                    title: "Analytics",
                    url: "/admin/analytics",
                    icon: LineChart,
                },
                {
                    title: "Reports",
                    url: "/admin/reports",
                    icon: FileText,
                },
            ],
        },
        {
            label: "Organization",
            items: [
                {
                    title: "Branches",
                    url: "/admin/branches",
                    icon: Building2,
                },
                {
                    title: "Users",
                    url: "/admin/users",
                    icon: Users,
                },
            ],
        },
        {
            label: "Catalog & Data",
            items: [
                {
                    title: "Product Catalog",
                    url: "/admin/products",
                    icon: Package,
                },
                {
                    title: "Print Barcodes",
                    url: "/admin/products?missing_barcode=1",
                    icon: Barcode,
                },
                {
                    title: "Sales",
                    url: "/admin/sales",
                    icon: ShoppingBag,
                },
                {
                    title: "Inventory",
                    url: "/admin/inventory",
                    icon: Package,
                },
            ],
        },
        {
            label: "System",
            items: [
                {
                    title: "Licensing",
                    url: "/admin/licensing",
                    icon: CreditCard,
                },
                {
                    title: "Settings",
                    url: "/admin/settings",
                    icon: Settings,
                },
            ],
        },
        {
            label: "Account",
            items: [
                {
                    title: "Profile",
                    url: "/admin/profile",
                    icon: User,
                },
            ],
        },
    ],

    footerGroups: [],
};
