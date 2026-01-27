import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "./Sidebar";
import AdminHeader from "./Header";
import { ManagerMenuConfig } from "./managerMenuConfig";
import { Outlet } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import { Badge } from "@/components/ui/badge";

const ManagerDashboardLayout = () => {
    const user = useAuthStore((state) => state.user);

    // Get branch name 
    const branchDisplay = user?.branch_name ? `Branch: ${user.branch_name}` : (user?.branch_id ? `Branch: ${user.branch_id.slice(0, 8)}...` : 'No Branch Assigned');

    return (
        <SidebarProvider>
            <AppSidebar {...ManagerMenuConfig} />
            <SidebarInset>
                <AdminHeader title="Branch Operations" />
                <div className="px-4 py-2 bg-muted/50 border-b">
                    <Badge variant="outline" className="text-sm bg-card text-card-foreground">
                        {branchDisplay}
                    </Badge>
                </div>
                <main className="flex-1 overflow-auto p-4">
                    <Outlet />
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
};

export default ManagerDashboardLayout;
