import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { ArrowDown, ArrowUp, Loader2 } from 'lucide-react';

interface CashOperationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (amount: number, notes?: string) => Promise<void>;
    type: 'drop' | 'addition';
    title?: string;
}

export function CashOperationModal({
    isOpen,
    onClose,
    onSubmit,
    type,
    title,
}: CashOperationModalProps) {
    const [amount, setAmount] = useState('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const isDrop = type === 'drop';
    const defaultTitle = isDrop ? 'Cash Drop' : 'Cash Addition';
    const Icon = isDrop ? ArrowDown : ArrowUp;
    const iconColor = isDrop ? 'text-red-600' : 'text-green-600';
    const iconBg = isDrop ? 'bg-red-100' : 'bg-green-100';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const amountNum = parseFloat(amount);

        // Validation
        if (isNaN(amountNum) || amountNum <= 0) {
            setError('Please enter a valid amount');
            return;
        }

        if (!isDrop && !notes.trim()) {
            setError('Please provide a reason for cash addition');
            return;
        }

        try {
            setLoading(true);
            await onSubmit(amountNum, notes.trim() || undefined);

            // Reset form
            setAmount('');
            setNotes('');
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to process operation');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
            setAmount('');
            setNotes('');
            setError('');
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <div className="flex items-center gap-3 mb-2">
                            <div className={`p-3 rounded-lg ${iconBg}`}>
                                <Icon className={`w-6 h-6 ${iconColor}`} />
                            </div>
                            <DialogTitle>{title || defaultTitle}</DialogTitle>
                        </div>
                        <DialogDescription>
                            {isDrop
                                ? 'Record cash removed from the drawer (e.g., for safe drop)'
                                : 'Record cash added to the drawer (requires supervisor approval)'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {/* Amount Input */}
                        <div className="space-y-2">
                            <Label htmlFor="amount">Amount (KSh)</Label>
                            <Input
                                id="amount"
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                disabled={loading}
                                className="text-lg"
                                autoFocus
                            />
                        </div>

                        {/* Notes/Reason */}
                        <div className="space-y-2">
                            <Label htmlFor="notes">
                                {isDrop ? 'Notes (optional)' : 'Reason (required)'}
                            </Label>
                            <Textarea
                                id="notes"
                                placeholder={
                                    isDrop
                                        ? 'Add any additional notes...'
                                        : 'Why is cash being added?'
                                }
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                disabled={loading}
                                rows={3}
                            />
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                `Record ${isDrop ? 'Drop' : 'Addition'}`
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
