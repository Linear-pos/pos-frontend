import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import type { UserRole } from "../../types/user";

interface ProtectedLayoutProps {
    requiredRole?: UserRole[];
}

export const ProtectedLayout = ({ requiredRole }: ProtectedLayoutProps) => {
    const { isAuthenticated, isLoading, user } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center w-full h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    const userRole = typeof user?.role === 'string'
        ? user.role as UserRole
        : user?.role?.name as UserRole;

    // Global "Bouncer" Logic

    // 1. If Cashier tries to access Dashboard -> Redirect to POS
    if (userRole === 'CASHIER' && location.pathname.startsWith('/dashboard')) {
        return <Navigate to="/pos" replace />;
    }

    // 2. If valid user visits root '/', redirect based on role
    if (location.pathname === '/') {
        if (userRole === 'CASHIER') return <Navigate to="/pos" replace />;
        return <Navigate to="/dashboard/overview" replace />;
    }

    // 3. Check for specific route requirements
    if (requiredRole && !requiredRole.includes(userRole)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return <Outlet />;
};
