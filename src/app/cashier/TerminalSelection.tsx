import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TerminalCard } from '../../components/terminal/TerminalCard';
import { getTerminals } from '../../services/terminal.api';
import { getCurrentShift } from '../../services/shift.api';
import { useShiftStore } from '../../stores/shift.store';
import { useCashierStore } from '../../stores/cashier.store';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/button';
import type { Terminal } from '../../services/terminal.api';

export function TerminalSelection() {
    const navigate = useNavigate();
    const { cashier } = useCashierStore();
    const { setSelectedTerminal } = useShiftStore();

    const [terminals, setTerminals] = useState<Terminal[]>([]);
    const [activeShifts, setActiveShifts] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedId, setSelectedId] = useState<string | null>(null);

    useEffect(() => {
        loadTerminals();
    }, []);

    const loadTerminals = async () => {
        try {
            setLoading(true);
            setError('');

            // Fetch terminals (filter by branch if cashier has one)
            const params: any = {};
            if (cashier?.branchId) {
                params.branchId = cashier.branchId;
            }

            const response = await getTerminals(params);
            const terminalList = response.data;

            setTerminals(terminalList);

            // Check which terminals have active shifts
            const shiftsSet = new Set<string>();
            await Promise.all(
                terminalList.map(async (terminal) => {
                    try {
                        const shiftResponse = await getCurrentShift(terminal.id);
                        if (shiftResponse.success) {
                            shiftsSet.add(terminal.id);
                        }
                    } catch (err) {
                        // No active shift, ignore
                    }
                })
            );
            setActiveShifts(shiftsSet);

            // Auto-select if only one terminal
            if (terminalList.length === 1) {
                handleSelect(terminalList[0]);
            }
        } catch (err: any) {
            console.error('Failed to load terminals:', err);
            setError('Failed to load terminals. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (terminal: Terminal) => {
        setSelectedId(terminal.id);
        setSelectedTerminal(terminal.id);

        // Navigate to shift management
        setTimeout(() => {
            navigate('/cashier/shift');
        }, 300);
    };

    const handleBack = () => {
        navigate('/cashier/login');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading terminals...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Button
                        variant="ghost"
                        onClick={handleBack}
                        className="mb-4"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>

                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Select Terminal
                    </h1>
                    <p className="text-gray-600">
                        Choose which terminal you'll be using
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-600">{error}</p>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={loadTerminals}
                            className="mt-2"
                        >
                            Retry
                        </Button>
                    </div>
                )}

                {/* No Terminals */}
                {!loading && terminals.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-600 mb-4">No terminals available</p>
                        <Button onClick={loadTerminals}>Refresh</Button>
                    </div>
                )}

                {/* Terminal Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {terminals.map((terminal) => (
                        <TerminalCard
                            key={terminal.id}
                            terminal={terminal}
                            selected={selectedId === terminal.id}
                            hasActiveShift={activeShifts.has(terminal.id)}
                            onClick={() => handleSelect(terminal)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
