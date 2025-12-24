import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "./Sidebar";
import AdminHeader from "./Header";
import { MenuConfig } from "./menuConfig";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <SidebarProvider>
      <AppSidebar {...MenuConfig} />
      <SidebarInset>
        <AdminHeader title="pos" />
        <main className="flex-1 overflow-auto p-4">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Layout;
