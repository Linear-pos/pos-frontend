import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
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

    if (!user) return null;

    const userRole = typeof user.role === "string" ? user.role : user.role?.name;
    const isOnDashboard = location.pathname.startsWith("/dashboard");
    const isOnPOS = location.pathname.startsWith("/pos");
    const canAccessDashboard = hasRole(["SYSTEM_ADMIN", "BRANCH_MANAGER"]);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const handleNavigateToPOS = () => {
        navigate("/pos");
    };

    const handleNavigateToDashboard = () => {
        navigate("/dashboard");
    };

    const handleSettings = () => {
        // Placeholder for future settings page
        console.log("Settings clicked - not yet implemented");
    };

    const getRoleBadgeColor = (role?: string) => {
        switch (role) {
            case "SYSTEM_ADMIN":
                return "text-purple-600 bg-purple-50 dark:bg-purple-950 dark:text-purple-300";
            case "BRANCH_MANAGER":
                return "text-blue-600 bg-blue-50 dark:bg-blue-950 dark:text-blue-300";
            case "CASHIER":
                return "text-green-600 bg-green-50 dark:bg-green-950 dark:text-green-300";
            default:
                return "text-gray-600 bg-gray-50 dark:bg-gray-950 dark:text-gray-300";
        }
    };

    const formatRoleName = (role?: string) => {
        if (!role) return "User";
        return role
            .split("_")
            .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
            .join(" ");
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant={variant} size={size} className="gap-2">
                    {showAvatar && <User className="h-4 w-4" />}
                    <span className="hidden sm:inline">{user.name}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-2">
                        <p className="text-sm font-medium leading-none">{user.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {user.email}
                        </p>
                        <span
                            className={`text-xs font-medium px-2 py-1 rounded-md w-fit ${getRoleBadgeColor(
                                userRole
                            )}`}
                        >
                            {formatRoleName(userRole)}
                        </span>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {/* Navigation Options */}
                {isOnDashboard && (
                    <DropdownMenuItem onClick={handleNavigateToPOS}>
                        <CreditCard className="mr-2 h-4 w-4" />
                        <span>Open POS</span>
                    </DropdownMenuItem>
                )}

                {isOnPOS && canAccessDashboard && (
                    <DropdownMenuItem onClick={handleNavigateToDashboard}>
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>Open Dashboard</span>
                    </DropdownMenuItem>
                )}

                {/* Settings */}
                <DropdownMenuItem onClick={handleSettings}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {/* Logout */}
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 dark:text-red-400">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
