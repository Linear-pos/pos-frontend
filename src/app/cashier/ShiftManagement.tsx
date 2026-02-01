import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShiftSummary } from '../../components/terminal/shift/ShiftSummary';
import { CashOperationModal } from '../../components/terminal/shift/CashOperationModal';
import { useShiftStore } from '../../stores/shift.store';
import { useCashierStore } from '../../stores/cashier.store';
import {
    getCurrentShift,
    openShift,
    closeShift,
    recordCashDrop as apiRecordCashDrop,
    recordCashAddition as apiRecordCashAddition,
} from '../../services/shift.api';
import { Button } from '../../components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import {
    PlayCircle,
    StopCircle,
    ArrowDown,
    ArrowUp,
    FileText,
    Loader2,
    ArrowLeft,
} from 'lucide-react';
import { toast } from 'sonner';

export function ShiftManagement() {
    const navigate = useNavigate();
    const {
        currentShift,
        selectedTerminalId,
        setCurrentShift,
        recordCashDrop,
        recordCashAddition,
        // resetShift,
    } = useShiftStore();
    const { cashier, hasPermission, isSupervisorOrAbove } = useCashierStore();

    const [loading, setLoading] = useState(true);
    const [openShiftModal, setOpenShiftModal] = useState(false);
    const [closeShiftModal, setCloseShiftModal] = useState(false);
    const [cashDropModal, setCashDropModal] = useState(false);
    const [cashAddModal, setCashAddModal] = useState(false);

    const [openingCash, setOpeningCash] = useState('');
    const [closingCash, setClosingCash] = useState('');
    const [notes, setNotes] = useState('');
    const [operationLoading, setOperationLoading] = useState(false);

    useEffect(() => {
        loadCurrentShift();
    }, [selectedTerminalId]);

    const loadCurrentShift = async () => {
        if (!selectedTerminalId) {
            navigate('/cashier/terminal-select');
            return;
        }

        try {
            setLoading(true);
            const response = await getCurrentShift(selectedTerminalId);
            setCurrentShift(response.data);
        } catch (err) {
            // No active shift
            setCurrentShift(null);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenShift = async () => {
        if (!cashier || !selectedTerminalId) return;

        const amount = parseFloat(openingCash);
        if (isNaN(amount) || amount < 0) {
            toast.error('Please enter a valid opening cash amount');
            return;
        }

        try {
            setOperationLoading(true);
            const response = await openShift({
                terminalId: selectedTerminalId,
                cashierId: cashier.id,
                openingCash: amount,
                notes: notes.trim() || undefined,
            });

            setCurrentShift(response.data);
            setOpenShiftModal(false);
            setOpeningCash('');
            setNotes('');
            toast.success('Shift opened successfully');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to open shift');
        } finally {
            setOperationLoading(false);
        }
    };

    const handleCloseShift = async () => {
        if (!cashier || !currentShift) return;

        const amount = parseFloat(closingCash);
        if (isNaN(amount) || amount < 0) {
            toast.error('Please enter a valid closing cash amount');
            return;
        }

        try {
            setOperationLoading(true);
            const response = await closeShift(currentShift.id, {
                closingCash: amount,
                closedByCashierId: cashier.id,
                notes: notes.trim() || undefined,
            });

            // Navigate to reconciliation
            navigate(`/cashier/reconciliation/${response.data.id}`);
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to close shift');
        } finally {
            setOperationLoading(false);
        }
    };

    const handleCashDrop = async (amount: number, dropNotes?: string) => {
        if (!currentShift || !cashier) return;

        await apiRecordCashDrop(currentShift.id, {
            amount,
            performedByCashierId: cashier.id,
            notes: dropNotes,
        });

        recordCashDrop(amount);
        toast.success(`Cash drop of KSh ${amount.toLocaleString()} recorded`);
    };

    const handleCashAddition = async (amount: number, reason?: string) => {
        if (!currentShift || !cashier) return;

        await apiRecordCashAddition(currentShift.id, {
            amount,
            performedByCashierId: cashier.id,
            reason: reason || 'Cash addition',
        });

        recordCashAddition(amount);
        toast.success(`Cash addition of KSh ${amount.toLocaleString()} recorded`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <Button
                            variant="ghost"
                            onClick={() => navigate('/cashier/terminal-select')}
                            className="mb-2"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Change Terminal
                        </Button>
                        <h1 className="text-3xl font-bold text-gray-900">Shift Management</h1>
                    </div>

                    {!currentShift && hasPermission('can_open_shift') && (
                        <Button
                            size="lg"
                            onClick={() => setOpenShiftModal(true)}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            <PlayCircle className="w-5 h-5 mr-2" />
                            Open Shift
                        </Button>
                    )}
                </div>

                {/* No Active Shift */}
                {!currentShift && (
                    <div className="text-center py-12 bg-card text-card-foreground rounded-lg border">
                        <PlayCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <h2 className="text-xl font-semibold mb-2">No Active Shift</h2>
                        <p className="text-muted-foreground mb-4">Open a shift to start selling</p>
                        {hasPermission('can_open_shift') && (
                            <Button onClick={() => setOpenShiftModal(true)}>
                                Open New Shift
                            </Button>
                        )}
                    </div>
                )}

                {/* Active Shift */}
                {currentShift && (
                    <div className="space-y-6">
                        {/* Shift Summary */}
                        <ShiftSummary />

                        {/* Quick Actions */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Button
                                variant="outline"
                                size="lg"
                                onClick={() => setCashDropModal(true)}
                                className="h-20 flex-col"
                            >
                                <ArrowDown className="w-6 h-6 mb-2 text-red-600" />
                                Cash Drop
                            </Button>

                            {isSupervisorOrAbove() && (
                                <Button
                                    variant="outline"
                                    size="lg"
                                    onClick={() => setCashAddModal(true)}
                                    className="h-20 flex-col"
                                >
                                    <ArrowUp className="w-6 h-6 mb-2 text-green-600" />
                                    Cash Addition
                                </Button>
                            )}

                            <Button
                                variant="outline"
                                size="lg"
                                onClick={() => navigate('/sales')}
                                className="h-20 flex-col"
                            >
                                <FileText className="w-6 h-6 mb-2" />
                                Make Sale
                            </Button>

                            {hasPermission('can_close_shift') && (
                                <Button
                                    variant="destructive"
                                    size="lg"
                                    onClick={() => setCloseShiftModal(true)}
                                    className="h-20 flex-col"
                                >
                                    <StopCircle className="w-6 h-6 mb-2" />
                                    Close Shift
                                </Button>
                            )}
                        </div>
                    </div>
                )}

                {/* Modals */}
                <OpenShiftModal
                    isOpen={openShiftModal}
                    onClose={() => setOpenShiftModal(false)}
                    onSubmit={handleOpenShift}
                    openingCash={openingCash}
                    setOpeningCash={setOpeningCash}
                    notes={notes}
                    setNotes={setNotes}
                    loading={operationLoading}
                />

                <CloseShiftModal
                    isOpen={closeShiftModal}
                    onClose={() => setCloseShiftModal(false)}
                    onSubmit={handleCloseShift}
                    closingCash={closingCash}
                    setClosingCash={setClosingCash}
                    notes={notes}
                    setNotes={setNotes}
                    loading={operationLoading}
                />

                <CashOperationModal
                    type="drop"
                    isOpen={cashDropModal}
                    onClose={() => setCashDropModal(false)}
                    onSubmit={handleCashDrop}
                />

                <CashOperationModal
                    type="addition"
                    isOpen={cashAddModal}
                    onClose={() => setCashAddModal(false)}
                    onSubmit={handleCashAddition}
                />
            </div>
        </div>
    );
}

// Helper components for modals
function OpenShiftModal({ isOpen, onClose, onSubmit, openingCash, setOpeningCash, notes, setNotes, loading }: any) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Open New Shift</DialogTitle>
                    <DialogDescription>
                        Count the cash in the drawer and enter the opening amount
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div>
                        <Label htmlFor="opening">Opening Cash (KSh)</Label>
                        <Input
                            id="opening"
                            type="number"
                            step="0.01"
                            value={openingCash}
                            onChange={(e) => setOpeningCash(e.target.value)}
                            placeholder="0.00"
                        />
                    </div>
                    <div>
                        <Label htmlFor="notes">Notes (optional)</Label>
                        <Textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Any additional notes..."
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={onSubmit} disabled={loading}>
                        {loading ? 'Opening...' : 'Open Shift'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function CloseShiftModal({ isOpen, onClose, onSubmit, closingCash, setClosingCash, notes, setNotes, loading }: any) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Close Shift</DialogTitle>
                    <DialogDescription>
                        Count the cash in the drawer and enter the closing amount
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div>
                        <Label htmlFor="closing">Closing Cash (KSh)</Label>
                        <Input
                            id="closing"
                            type="number"
                            step="0.01"
                            value={closingCash}
                            onChange={(e) => setClosingCash(e.target.value)}
                            placeholder="0.00"
                        />
                    </div>
                    <div>
                        <Label htmlFor="notes">Notes (optional)</Label>
                        <Textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Any additional notes..."
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={onSubmit} disabled={loading}>
                        {loading ? 'Closing...' : 'Close Shift'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
