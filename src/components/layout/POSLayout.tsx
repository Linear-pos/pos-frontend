import { Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { LogOut, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export const POSLayout = () => {
    const { user, logout } = useAuth();

    return (
        <div className="flex flex-col h-screen bg-background">
            {/* Minimal Header */}
            <header className="flex items-center justify-between px-4 py-2 border-b bg-card">
                <div className="font-bold text-xl tracking-tight">POS Terminal</div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <UserIcon className="w-4 h-4" />
                        <span>{user?.name}</span>
                    </div>

                    <Button variant="ghost" size="icon" onClick={() => logout()}>
                        <LogOut className="w-4 h-4" />
                    </Button>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 overflow-hidden relative">
                <Outlet />
            </main>
        </div>
    );
};
