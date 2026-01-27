import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import { useSessionMonitor } from '@/hooks/useSessionMonitor';
import { useDeviceModeStore } from '@/stores/deviceMode.store';
import { SessionWarningModal } from '@/components/auth/SessionWarningModal';

/**
 * Session Monitor Wrapper
 * Monitors user session for idle timeout and app visibility changes
 * Only active when user is authenticated
 */
export const SessionMonitorWrapper = ({ children }: { children: React.ReactNode }) => {
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();

    const { mode } = useDeviceModeStore();

    const handleTimeout = () => {
        console.log('[SessionMonitor] Timeout triggered, logging out');
        logout();

        // If in terminal mode, stay on POS (PIN overlay will appear)
        // Otherwise go to login page
        if (mode.type === 'terminal') {
            navigate('/pos');
        } else {
            navigate('/login', { replace: true });
        }
    };

    const handleHeartbeat = async () => {
        // Optional: Send heartbeat to backend
        // await axiosInstance.post('/sessions/heartbeat');
    };

    const { showWarning, timeRemaining, resetTimeout } = useSessionMonitor(
        handleTimeout,
        handleHeartbeat,
        {
            idleTimeout: 15 * 60 * 1000, // 15 minutes
            heartbeatInterval: 60 * 1000, // 60 seconds
            warningTime: 60 * 1000, // 60 seconds warning
            monitorVisibility: true,
        }
    );

    // Only show warning if user is authenticated
    const shouldShowWarning = showWarning && user !== null;

    return (
        <>
            {children}
            <SessionWarningModal
                open={shouldShowWarning}
                timeRemaining={timeRemaining}
                onContinue={resetTimeout}
                onLogout={handleTimeout}
            />
        </>
    );
};
