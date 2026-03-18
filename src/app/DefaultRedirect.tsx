import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import { useDeviceModeStore } from "@/stores/deviceMode.store";
import { validateTerminalCode } from "@/services/terminal.api";

/**
 * Terminal Setup Component
 * Shown on first launch to bind this device to a terminal
 */
const TerminalSetup = ({ onComplete }: { onComplete: () => void }) => {
    const navigate = useNavigate();
    const [terminalCode, setTerminalCode] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { setTerminalMode } = useDeviceModeStore();

    // Alt+M to go to login
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.altKey && e.key.toLowerCase() === 'm') {
                e.preventDefault();
                navigate('/login');
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!terminalCode.trim()) {
            setError("Please enter a terminal code");
            return;
        }

        setLoading(true);
        setError("");

        try {
            // Validate terminal code via API
            const response = await validateTerminalCode(terminalCode.trim());
            
            if (!response.valid) {
                setError(response.message || "Invalid terminal code. Please check and try again.");
                return;
            }

            // Store terminal code
            localStorage.setItem('omni:desktop:terminalCode', terminalCode.trim());
            
            // Set mode with validated terminal info from API
            setTerminalMode({
                terminalId: response.data!.terminalId,
                terminalCode: terminalCode.trim(),
                terminalName: response.data!.terminalName,
                tenantId: response.data!.tenantId,
                branchId: response.data!.branchId
            });
            
            onComplete();
        } catch (err: any) {
            setError(err.response?.data?.message || "Invalid terminal code. Please check and try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
            <div className="w-full max-w-md">
                <div className="bg-gray-800 rounded-2xl shadow-xl border border-gray-700 p-8">
                    <div className="text-center mb-8">
                        <div className="flex justify-center mb-4">
                            <img src="/omnipos-nobg.png" alt="OmniPos Logo" className="h-16 w-auto" />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">Terminal Setup</h1>
                        <p className="text-gray-400 text-sm">
                            Enter the terminal code from your dashboard to bind this device
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <input
                                type="text"
                                value={terminalCode}
                                onChange={(e) => setTerminalCode(e.target.value.toUpperCase())}
                                placeholder="Enter Terminal Code"
                                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white text-center text-lg tracking-widest uppercase"
                                autoFocus
                            />
                        </div>

                        {error && (
                            <p className="text-red-400 text-sm text-center">{error}</p>
                        )}

                        <button
                            type="submit"
                            disabled={loading || !terminalCode.trim()}
                            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
                        >
                            {loading ? "Connecting..." : "Connect Terminal"}
                        </button>
                    </form>

                    <p className="text-gray-500 text-xs text-center mt-6">
                        Get the terminal code from your manager dashboard<br />
                        <span className="text-gray-400">Press <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-gray-300">Alt</kbd> + <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-gray-300">M</kbd> to login</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

/**
 * Default redirect - handles routing to appropriate page
 * Always goes to POS with PIN pad, or terminal setup if not configured
 */
export const DefaultRedirect = () => {
    const { isAuthenticated, user } = useAuthStore();
    const { mode } = useDeviceModeStore();
    const [checkedSetup, setCheckedSetup] = useState(false);

    // Check for stored terminal configuration on first launch
    useEffect(() => {
        if (mode.type === 'uninitialized') {
            const storedCode = localStorage.getItem('omni:desktop:terminalCode');
            if (storedCode) {
                // Restore previous terminal configuration
                useDeviceModeStore.getState().setTerminalMode({
                    terminalId: 'desktop-' + storedCode,
                    terminalCode: storedCode,
                    terminalName: 'Desktop Terminal',
                    tenantId: '',
                    branchId: ''
                });
            }
        }
        setCheckedSetup(true);
    }, [mode.type]);

    // Show loading while checking setup
    if (!checkedSetup) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <div className="animate-pulse text-white">Loading...</div>
            </div>
        );
    }

    // If authenticated (manager/admin), redirect to appropriate dashboard
    if (isAuthenticated) {
        const roleName = typeof user?.role === 'string' ? user.role : user?.role?.name;
        if (roleName === 'SYSTEM_ADMIN') return <Navigate to="/admin" replace />;
        if (roleName === 'BRANCH_MANAGER') return <Navigate to="/manager" replace />;
        if (roleName === 'CASHIER') return <Navigate to="/pos" replace />;
        if (roleName === 'SAAS_ADMIN') return <Navigate to="/unauthorized" replace />;
        return <Navigate to="/pos" replace />;
    }

    // Unauthenticated users
    switch (mode.type) {
        case 'uninitialized':
            // Show terminal setup if no terminal configured
            return <TerminalSetup onComplete={() => window.location.reload()} />;
        case 'terminal':
            // Terminal mode: go directly to POS where PIN overlay will appear
            return <Navigate to="/pos" replace />;
        case 'management':
            // Management mode: go to manager login
            return <Navigate to="/login" replace />;
        default:
            // Default: show terminal setup
            return <TerminalSetup onComplete={() => window.location.reload()} />;
    }
};
