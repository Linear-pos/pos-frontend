import { Outlet } from "react-router-dom";
import { useDeviceModeStore } from "@/stores/deviceMode.store";
import { ProfileDropdown } from "@/components/common/ProfileDropdown";

export const POSLayout = () => {
    const { mode } = useDeviceModeStore();
    const terminalName = mode.type === 'terminal' ? mode.terminalName : 'OmniPos Terminal';

    return (
        <div className="flex flex-col h-screen bg-background">
            {/* Minimal Header */}
            <header className="flex items-center justify-between px-4 py-2 border-b bg-card">
                <div className="flex items-center gap-3">
                    <img src="/OmniPos.png" alt="OmniPos Logo" className="h-8 w-auto" />
                    <div className="h-6 w-px bg-border mx-1" />
                    <div className="font-bold text-lg tracking-tight text-muted-foreground uppercase">
                        {terminalName}
                    </div>
                </div>

                <ProfileDropdown variant="ghost" size="sm" showAvatar={true} />
            </header>

            {/* Main Content Area */}
            <main className="flex-1 overflow-hidden relative">
                <Outlet />
            </main>
        </div>
    );
};
