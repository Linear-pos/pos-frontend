import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "./Sidebar";
import AdminHeader from "./Header";
import { MenuConfig } from "./menuConfig";
import { Outlet } from "react-router-dom";

const DashboardLayout = () => {
    return (
        <SidebarProvider>
            <AppSidebar {...MenuConfig} />
            <SidebarInset>
                <AdminHeader title="Dashboard" />
                <main className="flex-1 overflow-auto p-4">
                    <Outlet />
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
};

export default DashboardLayout;
