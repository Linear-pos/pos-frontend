import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "./Sidebar";
import AdminHeader from "./Header";
import { MenuConfig } from "./menuConfig";
import { Outlet } from "react-router-dom";
import { useBranchScope } from "@/hooks/useBranchScope";
import { useAuthStore } from "@/stores/auth.store";
import { Badge } from "@/components/ui/badge";

const DashboardLayout = () => {
    const { isBranchScoped } = useBranchScope();
    const user = useAuthStore((state) => state.user);

    // Get branch name if user is branch-scoped
    const branchName = isBranchScoped && user?.branchId
        ? `Branch: ${user.branchId}` // TODO: Fetch actual branch name from API
        : null;

    return (
        <SidebarProvider>
            <AppSidebar {...MenuConfig} />
            <SidebarInset>
                <AdminHeader title="Dashboard" />
                {branchName && (
                    <div className="px-4 py-2 bg-muted/50 border-b">
                        <Badge variant="outline" className="text-sm">
                            {branchName}
                        </Badge>
                    </div>
                )}
                <main className="flex-1 overflow-auto p-4">
                    <Outlet />
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
};

export default DashboardLayout;
