import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useDeviceModeStore } from '@/stores/deviceMode.store';
import { useCashierStore } from '@/stores/cashier.store';
import { PINPadOverlay } from '@/components/auth/PINPadOverlay';

/**
 * Terminal-Aware Layout
 * Handles routing for terminal devices:
 * - If terminal mode + not authenticated → Shows POS with PIN overlay
 * - If terminal mode + authenticated → Shows POS normally
 * - If not terminal mode → Redirects to root for Terminal Setup
 */
export const TerminalAwareLayout = () => {
    const { isAuthenticated: isUserAuthenticated, isLoading } = useAuth();
    const { mode } = useDeviceModeStore();
    const { isAuthenticated: isCashierAuthenticated } = useCashierStore();

    console.log('[TerminalAwareLayout] Render:', {
        modeType: mode.type,
        isUserAuthenticated,
        isCashierAuthenticated,
        isLoading,
        timestamp: new Date().toISOString()
    });

    // If uninitialized, redirect to root (shows Terminal Setup)
    if (mode.type === 'uninitialized') {
        console.log('[TerminalAwareLayout] Uninitialized mode, redirecting to root for setup');
        return <Navigate to="/" replace />;
    }

    // Terminal mode logic - handle FIRST to prevent ProtectedLayout redirect
    if (mode.type === 'terminal') {
        console.log('[TerminalAwareLayout] Terminal mode detected, rendering POS with overlay');

        // In terminal mode, authentication is via cashier PIN (cashier.store),
        // not via management user session (auth.store).
        return (
            <>  
                <Outlet />
                {!isCashierAuthenticated && <PINPadOverlay />}
            </>
        );
    }

    // Management mode - redirect to root which will show Terminal Setup
    console.log('[TerminalAwareLayout] Management mode, redirecting to root for setup');
    return <Navigate to="/" replace />;
};
