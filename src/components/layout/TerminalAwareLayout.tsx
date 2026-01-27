import type { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useDeviceModeStore } from '@/stores/deviceMode.store';
import { PINPadOverlay } from '@/components/auth/PINPadOverlay';
import { ProtectedLayout } from './ProtectedLayout';
import type { UserRole } from '@/types/user';

interface TerminalAwareLayoutProps {
    requiredRole?: UserRole | UserRole[];
    children?: ReactNode;
}

/**
 * Terminal-Aware Layout
 * Handles routing for terminal devices:
 * - If terminal mode + not authenticated → Shows POS with PIN overlay
 * - If terminal mode + authenticated → Shows POS normally
 * - If not terminal mode → Uses standard ProtectedLayout
 */
export const TerminalAwareLayout = ({ requiredRole }: TerminalAwareLayoutProps) => {
    const { isAuthenticated, isLoading } = useAuth();
    const { mode } = useDeviceModeStore();

    console.log('[TerminalAwareLayout] Render:', {
        modeType: mode.type,
        isAuthenticated,
        isLoading,
        timestamp: new Date().toISOString()
    });

    // Terminal mode logic - handle FIRST to prevent ProtectedLayout redirect
    if (mode.type === 'terminal') {
        console.log('[TerminalAwareLayout] Terminal mode detected, rendering POS with overlay');



        // In terminal mode, always render the POS
        // If not authenticated, show PIN overlay
        return (
            <>
                <Outlet />
                {!isAuthenticated && <PINPadOverlay />}
            </>
        );
    }

    // Only use ProtectedLayout for non-terminal modes
    console.log('[TerminalAwareLayout] Non-terminal mode, using ProtectedLayout');
    return <ProtectedLayout requiredRole={requiredRole} />;
};
