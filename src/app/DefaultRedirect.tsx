import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import { useDeviceModeStore } from "@/stores/deviceMode.store";

/**
 * Default redirect component that handles device mode routing
 * This is the landing page when users visit "/"
 */
export const DefaultRedirect = () => {
    const { isAuthenticated } = useAuthStore();
    const { mode } = useDeviceModeStore();

    // If authenticated, redirect to appropriate dashboard  
    if (isAuthenticated) {
        return <Navigate to="/pos" replace />;
    }

    // Device mode routing for unauthenticated users
    switch (mode.type) {
        case 'uninitialized':
            return <Navigate to="/select-mode" replace />;
        case 'terminal':
            // Terminal mode: go directly to POS where PIN overlay will appear
            return <Navigate to="/pos" replace />;
        case 'management':
            return <Navigate to="/login" replace />;
        default:
            return <Navigate to="/select-mode" replace />;
    }
};
