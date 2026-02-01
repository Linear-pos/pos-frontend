import { User, ShieldCheck, Crown } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { Cashier } from '../../../services/cashier.api';

interface CashierCardProps {
    cashier: Cashier;
    selected?: boolean;
    onClick?: () => void;
    showPermissions?: boolean;
}

export function CashierCard({
    cashier,
    selected = false,
    onClick,
    showPermissions = false,
}: CashierCardProps) {
    const getRoleIcon = () => {
        switch (cashier.role) {
            case 'manager':
                return <Crown className="w-5 h-5 text-amber-600" />;
            case 'supervisor':
                return <ShieldCheck className="w-5 h-5 text-blue-600" />;
            default:
                return <User className="w-5 h-5 text-gray-600" />;
        }
    };

    const getRoleBadgeColor = () => {
        switch (cashier.role) {
            case 'manager':
                return 'bg-amber-100 text-amber-800';
            case 'supervisor':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div
            onClick={onClick}
            className={cn(
                'relative p-4 rounded-lg border-2 transition-all cursor-pointer',
                'hover:shadow-md hover:scale-[1.02]',
                selected
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-blue-300',
                !cashier.isActive && 'opacity-50 cursor-not-allowed'
            )}
        >
            {/* Active Indicator */}
            {cashier.isActive && (
                <div className="absolute top-2 right-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                </div>
            )}

            {/* Header */}
            <div className="flex items-start gap-3">
                <div className={cn(
                    'flex items-center justify-center w-12 h-12 rounded-full',
                    selected ? 'bg-blue-200' : 'bg-gray-100'
                )}>
                    {getRoleIcon()}
                </div>

                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg truncate">{cashier.fullName}</h3>

                    <div className="flex items-center gap-2 mt-1">
                        <span className={cn(
                            'text-xs px-2 py-0.5 rounded-full font-medium uppercase',
                            getRoleBadgeColor()
                        )}>
                            {cashier.role}
                        </span>

                        {!cashier.isActive && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-800 font-medium">
                                Inactive
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Permissions */}
            {showPermissions && (
                <div className="mt-3 pt-3 border-t space-y-1">
                    <PermissionBadge
                        label="Open Shift"
                        enabled={cashier.canOpenShift}
                    />
                    <PermissionBadge
                        label="Close Shift"
                        enabled={cashier.canCloseShift}
                    />
                    <PermissionBadge
                        label="Override Prices"
                        enabled={cashier.canOverridePrices}
                    />
                </div>
            )}

            {/* Last Login */}
            {cashier.lastLoginAt && (
                <div className="mt-2 text-xs text-gray-500">
                    Last login: {new Date(cashier.lastLoginAt).toLocaleDateString()}
                </div>
            )}
        </div>
    );
}

function PermissionBadge({ label, enabled }: { label: string; enabled: boolean }) {
    return (
        <div className="flex items-center gap-2 text-xs">
            <div className={cn(
                'w-2 h-2 rounded-full',
                enabled ? 'bg-green-500' : 'bg-gray-300'
            )} />
            <span className={enabled ? 'text-gray-700' : 'text-gray-400'}>
                {label}
            </span>
        </div>
    );
}
