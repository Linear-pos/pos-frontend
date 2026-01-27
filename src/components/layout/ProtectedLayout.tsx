import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import type { UserRole } from "../../types/user";

interface ProtectedLayoutProps {
    requiredRole?: UserRole | UserRole[];
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

    console.log('[ProtectedLayout] Check:', {
        path: location.pathname,
        userRole,
        requiredRole,
        userIsAuthenticated: isAuthenticated
    });

    // Global "Bouncer" Logic

    // 1. If Cashier tries to access Manager/Admin Dashboards -> Redirect to POS
    if (userRole === 'CASHIER' && (location.pathname.startsWith('/manager') || location.pathname.startsWith('/admin'))) {
        return <Navigate to="/pos" replace />;
    }

    // 2. If Branch Manager tries to access Admin dashboard -> Unauthorized
    if (userRole === 'BRANCH_MANAGER' && location.pathname.startsWith('/admin')) {
        return <Navigate to="/unauthorized" replace />;
    }

    // 3. If System Admin tries to access Manager dashboard -> Allow (can view operations)
    // Admins can access manager dashboard for oversight - no redirect needed

    // 4. Handle legacy /dashboard/* routes - redirect to appropriate dashboard
    if (location.pathname.startsWith('/dashboard')) {
        if (userRole === 'BRANCH_MANAGER') {
            const subPath = location.pathname.replace('/dashboard', '');
            return <Navigate to={`/manager${subPath}`} replace />;
        } else if (userRole === 'SYSTEM_ADMIN') {
            const subPath = location.pathname.replace('/dashboard', '');
            return <Navigate to={`/admin${subPath}`} replace />;
        }
    }

    // 5. If valid user visits root '/', redirect based on role
    if (location.pathname === '/') {
        if (userRole === 'CASHIER') return <Navigate to="/pos" replace />;
        if (userRole === 'BRANCH_MANAGER') return <Navigate to="/manager/overview" replace />;
        if (userRole === 'SYSTEM_ADMIN') return <Navigate to="/admin/overview" replace />;
    }

    // 3. Check for specific route requirements
    if (requiredRole) {
        const rules = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
        if (!rules.includes(userRole)) {
            return <Navigate to="/unauthorized" replace />;
        }
    }

    return <Outlet />;
};
