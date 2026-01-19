import { Outlet } from "react-router-dom";
import { ProfileDropdown } from "@/components/common/ProfileDropdown";

export const POSLayout = () => {
    return (
        <div className="flex flex-col h-screen bg-background">
            {/* Minimal Header */}
            <header className="flex items-center justify-between px-4 py-2 border-b bg-card">
                <div className="font-bold text-xl tracking-tight">OmniPos Terminal</div>

                <ProfileDropdown variant="ghost" size="sm" showAvatar={true} />
            </header>

            {/* Main Content Area */}
            <main className="flex-1 overflow-hidden relative">
                <Outlet />
            </main>
        </div>
    );
};
