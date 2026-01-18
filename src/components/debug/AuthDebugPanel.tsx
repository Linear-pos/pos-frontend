import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'react-router-dom';
import { useState } from 'react';

export const AuthDebugPanel = () => {
    const { user, isAuthenticated, token } = useAuth();
    const location = useLocation();
    const [isVisible, setIsVisible] = useState(true);

    if (!isVisible) {
        return (
            <button
                onClick={() => setIsVisible(true)}
                className="fixed bottom-4 right-4 bg-purple-600 text-white px-3 py-2 rounded-lg shadow-lg text-xs font-mono z-50"
            >
                Show Debug
            </button>
        );
    }

    const userRole = typeof user?.role === 'string' ? user.role : user?.role?.name;

    return (
        <div className="fixed bottom-4 right-4 bg-black/90 text-white p-4 rounded-lg shadow-2xl max-w-md font-mono text-xs z-50 border border-purple-500">
            <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-purple-400">🔍 Auth Debug Panel</h3>
                <button
                    onClick={() => setIsVisible(false)}
                    className="text-gray-400 hover:text-white"
                >
                    ✕
                </button>
            </div>

            <div className="space-y-2">
                <div className="flex justify-between">
                    <span className="text-gray-400">Route:</span>
                    <span className="text-yellow-300">{location.pathname}</span>
                </div>

                <div className="flex justify-between">
                    <span className="text-gray-400">Authenticated:</span>
                    <span className={isAuthenticated ? 'text-green-400' : 'text-red-400'}>
                        {isAuthenticated ? '✓ Yes' : '✗ No'}
                    </span>
                </div>

                <div className="flex justify-between">
                    <span className="text-gray-400">Email:</span>
                    <span className="text-blue-300">{user?.email || 'N/A'}</span>
                </div>

                <div className="flex justify-between">
                    <span className="text-gray-400">Role (raw):</span>
                    <span className="text-pink-300">{JSON.stringify(user?.role)}</span>
                </div>

                <div className="flex justify-between">
                    <span className="text-gray-400">Role (parsed):</span>
                    <span className="text-green-300 font-bold">{userRole || 'N/A'}</span>
                </div>

                <div className="flex justify-between">
                    <span className="text-gray-400">Token:</span>
                    <span className="text-gray-500 truncate max-w-[120px]">
                        {token ? `${token.substring(0, 20)}...` : 'None'}
                    </span>
                </div>

                <div className="pt-3 border-t border-gray-700 mt-3">
                    <button
                        onClick={() => {
                            localStorage.removeItem('auth-storage');
                            window.location.href = '/login';
                        }}
                        className="w-full bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded transition-colors"
                    >
                        Clear Storage & Reload
                    </button>
                </div>

                <div className="pt-2">
                    <button
                        onClick={() => {
                            console.log('[DEBUG] Full localStorage:', localStorage.getItem('auth-storage'));
                            console.log('[DEBUG] Full user object:', user);
                            console.log('[DEBUG] Parsed role:', userRole);
                        }}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded transition-colors"
                    >
                        Log to Console
                    </button>
                </div>
            </div>
        </div>
    );
};
