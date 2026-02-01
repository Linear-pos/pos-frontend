import { Clock, DollarSign, TrendingUp, Wallet } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { useShiftStore } from '../../../stores/shift.store';
import { useCashierStore } from '../../../stores/cashier.store';
import { formatDistanceToNow } from 'date-fns';

export function ShiftSummary() {
    const { currentShift, runningTotals, getExpectedCash } = useShiftStore();
    const { cashier } = useCashierStore();

    if (!currentShift) {
        return (
            <div className="p-6 bg-gray-50 rounded-lg border border-gray-200 text-center">
                <p className="text-gray-600">No active shift</p>
            </div>
        );
    }

    const shiftDuration = formatDistanceToNow(new Date(currentShift.openedAt), {
        addSuffix: false,
    });

    const expectedCash = getExpectedCash();

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold">Current Shift</h3>
                    <p className="text-sm text-gray-600">{cashier?.fullName}</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-800 rounded-full">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-medium">{shiftDuration}</span>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <SummaryCard
                    icon={<DollarSign className="w-5 h-5" />}
                    label="Total Sales"
                    value={`KSh ${runningTotals.totalSales.toLocaleString()}`}
                    variant="default"
                />

                <SummaryCard
                    icon={<Wallet className="w-5 h-5" />}
                    label="Cash Sales"
                    value={`KSh ${runningTotals.totalCashSales.toLocaleString()}`}
                    variant="success"
                />

                <SummaryCard
                    icon={<TrendingUp className="w-5 h-5" />}
                    label="M-Pesa"
                    value={`KSh ${runningTotals.totalMpesaSales.toLocaleString()}`}
                    variant="info"
                />

                <SummaryCard
                    icon={<TrendingUp className="w-5 h-5" />}
                    label="Card"
                    value={`KSh ${runningTotals.totalCardSales.toLocaleString()}`}
                    variant="info"
                />
            </div>

            {/* Cash Breakdown */}
            <div className="p-4 bg-white rounded-lg border">
                <h4 className="font-medium mb-3">Cash Drawer</h4>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-600">Opening Cash</span>
                        <span className="font-medium">
                            KSh {currentShift.openingCash.toLocaleString()}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Cash Sales</span>
                        <span className="font-medium text-green-600">
                            + KSh {runningTotals.totalCashSales.toLocaleString()}
                        </span>
                    </div>
                    {runningTotals.cashDrops > 0 && (
                        <div className="flex justify-between">
                            <span className="text-gray-600">Cash Drops</span>
                            <span className="font-medium text-red-600">
                                - KSh {runningTotals.cashDrops.toLocaleString()}
                            </span>
                        </div>
                    )}
                    {runningTotals.cashAdditions > 0 && (
                        <div className="flex justify-between">
                            <span className="text-gray-600">Cash Additions</span>
                            <span className="font-medium text-green-600">
                                + KSh {runningTotals.cashAdditions.toLocaleString()}
                            </span>
                        </div>
                    )}
                    <div className="pt-2 border-t flex justify-between">
                        <span className="font-semibold">Expected Cash</span>
                        <span className="font-semibold text-lg">
                            KSh {expectedCash.toLocaleString()}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

interface SummaryCardProps {
    icon: React.ReactNode;
    label: string;
    value: string;
    variant?: 'default' | 'success' | 'info' | 'warning';
}

function SummaryCard({ icon, label, value, variant = 'default' }: SummaryCardProps) {
    const variants = {
        default: 'bg-gray-100 text-gray-700',
        success: 'bg-green-100 text-green-700',
        info: 'bg-blue-100 text-blue-700',
        warning: 'bg-yellow-100 text-yellow-700',
    };

    return (
        <div className="p-4 bg-white rounded-lg border hover:shadow-md transition-shadow">
            <div className={cn('inline-flex p-2 rounded-lg mb-2', variants[variant])}>
                {icon}
            </div>
            <p className="text-xs text-gray-600 mb-1">{label}</p>
            <p className="text-lg font-semibold">{value}</p>
        </div>
    );
}
