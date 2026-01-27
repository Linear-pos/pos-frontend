import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDeviceModeStore } from '@/stores/deviceMode.store';
import { useAuthStore } from '@/stores/auth.store';
import { axiosInstance } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Monitor, Users, Building2 } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface Terminal {
    id: string;
    name: string;
    terminalCode: string;
    tenantId: string;
    branchId: string;
}

export const SelectModePage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { setManagementMode, setTerminalMode } = useDeviceModeStore();
    const { isAuthenticated, user, logout } = useAuthStore();

    const [view, setView] = useState<'MENU' | 'PROVISIONING' | 'TERMINAL_SELECT'>('MENU');
    const [terminals, setTerminals] = useState<Terminal[]>([]);
    const [selectedTerminalId, setSelectedTerminalId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Check for return from login
    useEffect(() => {
        if (location.state?.from === 'provisioning' && isAuthenticated && (user?.role === 'BRANCH_MANAGER' || user?.role === 'SYSTEM_ADMIN')) {
            setView('TERMINAL_SELECT');
            fetchTerminals();
        }
    }, [isAuthenticated, user, location.state]);

    const handleManagementMode = () => {
        setManagementMode();
        navigate('/login');
    };

    const handleProvisionDevice = () => {
        if (isAuthenticated) {
            setView('TERMINAL_SELECT');
            fetchTerminals();
        } else {
            // Redirect to login with return state
            navigate('/login', { state: { returnTo: '/select-mode', from: 'provisioning' } });
        }
    };

    const fetchTerminals = async () => {
        setLoading(true);
        setError(null);
        try {
            // Because we are authenticated as manager, this endpoint returns our branch's terminals
            // or all terminals if system admin (though logic should likely enforce branch)
            const response = await axiosInstance.get<{ data: Terminal[] }>('/terminals');

            // Filter: if user has a branch_id, ensure we only see those (redundancy check)
            const branchId = user?.branch_id;
            let fetchedTerminals = response.data.data;

            if (branchId) {
                fetchedTerminals = fetchedTerminals.filter((t: Terminal) => t.branchId === branchId);
            }

            if (fetchedTerminals.length === 0) {
                setError('No terminals found for your branch. Please create one in the dashboard first.');
            }

            setTerminals(fetchedTerminals);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch terminals');
        } finally {
            setLoading(false);
        }
    };

    const handleTerminalSelect = () => {
        const terminal = terminals.find((t: Terminal) => t.id === selectedTerminalId);
        const branchId = user?.branch_id || terminal?.branchId; // Fallback for admin

        if (!terminal || !branchId) return;

        setTerminalMode({
            terminalId: terminal.id,
            terminalCode: terminal.terminalCode,
            terminalName: terminal.name,
            tenantId: terminal.tenantId,
            branchId: branchId
        });

        // Logout the manager session as we are now in "Device Mode"
        // The device holds its own identity via persistent store
        logout();

        // Navigate to POS 
        navigate('/pos');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="w-full max-w-md">
                <div className="bg-card rounded-2xl shadow-xl border border-border p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="flex justify-center mb-4">
                            <img
                                src="/OmniPos.png"
                                alt="OmniPos Logo"
                                className="h-16 w-auto"
                            />
                        </div>
                        <h1 className="text-2xl font-bold text-foreground mb-2">
                            Device Setup
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            {view === 'MENU' && "Choose how this device will be used"}
                            {view === 'TERMINAL_SELECT' && "Select a terminal to assign"}
                        </p>
                    </div>

                    {view === 'MENU' && (
                        /* Mode Selection */
                        <div className="space-y-4">
                            <Button
                                onClick={handleManagementMode}
                                className="w-full h-24 flex flex-col items-center justify-center gap-3"
                                variant="outline"
                            >
                                <Users className="w-8 h-8" />
                                <div>
                                    <div className="font-semibold text-base">Management Access</div>
                                    <div className="text-xs text-muted-foreground">
                                        For admins and managers
                                    </div>
                                </div>
                            </Button>

                            <Button
                                onClick={handleProvisionDevice}
                                className="w-full h-24 flex flex-col items-center justify-center gap-3"
                                variant="outline"
                            >
                                <Monitor className="w-8 h-8" />
                                <div>
                                    <div className="font-semibold text-base">Provision Device</div>
                                    <div className="text-xs text-muted-foreground">
                                        Assign to a Branch (Manager Login)
                                    </div>
                                </div>
                            </Button>
                        </div>
                    )}

                    {view === 'TERMINAL_SELECT' && (
                        /* Terminal Selection */
                        <div className="space-y-4">
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg flex items-center gap-3 mb-4">
                                <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                <div>
                                    <p className="text-sm font-medium text-blue-900 dark:text-blue-200">Authenticated Provisioning</p>
                                    <p className="text-xs text-blue-700 dark:text-blue-300">
                                        Select the terminal you wish to bind to this device.
                                    </p>
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="terminal-select">Select Terminal</Label>
                                <Select
                                    value={selectedTerminalId}
                                    onValueChange={setSelectedTerminalId}
                                >
                                    <SelectTrigger className="mt-1.5">
                                        <SelectValue placeholder="Choose terminal" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {terminals.map((terminal) => (
                                            <SelectItem key={terminal.id} value={terminal.id}>
                                                {terminal.name} ({terminal.terminalCode})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {error && (
                                <p className="text-sm text-destructive">{error}</p>
                            )}

                            <div className="flex gap-3 pt-2">
                                <Button
                                    onClick={() => {
                                        setView('MENU');
                                        setTerminals([]);
                                        setSelectedTerminalId('');
                                        setError(null);
                                    }}
                                    variant="outline"
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleTerminalSelect}
                                    className="flex-1"
                                    disabled={!selectedTerminalId}
                                >
                                    Bind Device
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SelectModePage;
