import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "./Sidebar";
import AdminHeader from "./Header";
import { AdminMenuConfig } from "./adminMenuConfig";
import { Outlet } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import { Badge } from "@/components/ui/badge";

const AdminDashboardLayout = () => {
    const user = useAuthStore((state) => state.user);

    // Display tenant information
    const tenantDisplay = user?.tenant_name ? `Tenant: ${user.tenant_name}` : (user?.tenant_id ? `Tenant: ${user.tenant_id.slice(0, 8)}...` : 'System');

    return (
        <SidebarProvider>
            <AppSidebar {...AdminMenuConfig} />
            <SidebarInset>
                <AdminHeader title="System Administration" />
                <div className="px-4 py-2 bg-muted/50 border-b">
                    <Badge variant="outline" className="text-sm bg-card text-card-foreground">
                        {tenantDisplay}
                    </Badge>
                </div>
                <main className="flex-1 overflow-auto p-4">
                    <Outlet />
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
};

export default AdminDashboardLayout;

