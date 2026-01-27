import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import { useDeviceModeStore } from '@/stores/deviceMode.store';

/**
 * Hook to handle logout with device mode-aware navigation
 * Terminal devices stay on /pos route (PIN overlay appears)
 */
export const useLogout = () => {
    const navigate = useNavigate();
    const { logout } = useAuthStore();
    const { mode } = useDeviceModeStore();

    return () => {
        logout();

        // Navigate based on device mode
        if (mode.type === 'terminal') {
            // Stay on POS route - PIN overlay will appear
            navigate('/pos');
        } else {
            navigate('/login');
        }
    };
};
