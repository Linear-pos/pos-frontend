import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import { useDeviceModeStore } from "@/stores/deviceMode.store";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { User, LogOut, Settings, LayoutDashboard, CreditCard } from "lucide-react";

interface ProfileDropdownProps {
    variant?: "ghost" | "outline" | "default";
    size?: "sm" | "icon" | "default";
    showAvatar?: boolean;
}

export const ProfileDropdown = ({
    variant = "ghost",
    size = "sm",
    showAvatar = true,
}: ProfileDropdownProps) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout, hasRole } = useAuthStore();
    const { mode } = useDeviceModeStore();

    if (!user) return null;

    const userRole = typeof user.role === "string" ? user.role : user.role?.name;
    const isOnDashboard = location.pathname.startsWith("/dashboard");
    const isOnPOS = location.pathname.startsWith("/pos");
    const canAccessDashboard = hasRole(["SYSTEM_ADMIN", "BRANCH_MANAGER"]);
    const isCashier = userRole === "CASHIER";

    const handleLogout = () => {
        logout();
        if (mode.type === 'terminal') {
            navigate('/pos');
        } else {
            navigate("/login");
        }
    };

    const handleNavigateToPOS = () => {
        navigate("/pos");
    };

    const handleNavigateToDashboard = () => {
        navigate("/dashboard");
    };


    const getRoleBadgeColor = (role?: string) => {
        switch (role) {
            case "SYSTEM_ADMIN":
                return "text-purple-600 bg-purple-50 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-200 dark:border-purple-800";
            case "BRANCH_MANAGER":
                return "text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800";
            case "CASHIER":
                return "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800";
            default:
                return "text-gray-600 bg-gray-50 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700";
        }
    };

    const formatRoleName = (role?: string) => {
        if (!role) return "User";
        return role
            .split("_")
            .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
            .join(" ");
    };

    // If user is a cashier, show the static nametag with a logout button
    if (isCashier) {
        return (
            <div className="flex items-center gap-3 px-3 py-1.5 rounded-full bg-card border shadow-sm transition-all hover:shadow-md">
                <div className="flex flex-col items-end">
                    <span className="text-sm font-semibold leading-none">{user.name}</span>
                    <span className={`text-[10px] font-bold mt-1 px-1.5 py-0.5 rounded uppercase tracking-wider ${getRoleBadgeColor(userRole)}`}>
                        {formatRoleName(userRole)}
                    </span>
                </div>
                <div className="h-8 w-px bg-border" />
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                    onClick={handleLogout}
                    title="Log out"
                >
                    <LogOut className="h-4 w-4" />
                </Button>
            </div>
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant={variant} size={size} className="gap-2 rounded-full px-4">
                    {showAvatar && (
                        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-3.5 w-3.5 text-primary" />
                        </div>
                    )}
                    <span className="hidden sm:inline font-medium">{user.name}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 mt-2" align="end" forceMount>
                <DropdownMenuLabel className="font-normal p-4">
                    <div className="flex flex-col space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex flex-col">
                                <p className="text-sm font-semibold leading-none">{user.name}</p>
                                <p className="text-xs mt-1 text-muted-foreground truncate max-w-[150px]">
                                    {user.email}
                                </p>
                            </div>
                        </div>
                        <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full w-fit uppercase tracking-wider ${getRoleBadgeColor(
                                userRole
                            )}`}
                        >
                            {formatRoleName(userRole)}
                        </span>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {/* Navigation Options */}
                <div className="p-1">
                    {isOnDashboard && (
                        <DropdownMenuItem onClick={handleNavigateToPOS} className="rounded-md">
                            <CreditCard className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span>Open POS</span>
                        </DropdownMenuItem>
                    )}

                    {isOnPOS && canAccessDashboard && (
                        <DropdownMenuItem onClick={handleNavigateToDashboard} className="rounded-md">
                            <LayoutDashboard className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span>Open Dashboard</span>
                        </DropdownMenuItem>
                    )}

                    <DropdownMenuItem onClick={() => navigate('/settings')} className="rounded-md">
                        <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>Settings</span>
                    </DropdownMenuItem>
                </div>

                <DropdownMenuSeparator />

                <div className="p-1">
                    <DropdownMenuItem
                        onClick={handleLogout}
                        className="rounded-md text-red-600 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-950/30 focus:text-red-700 dark:focus:text-red-300"
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span className="font-medium">Log out</span>
                    </DropdownMenuItem>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

