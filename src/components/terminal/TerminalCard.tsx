import { Monitor, Wifi, WifiOff, Lock } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Terminal } from '../../services/terminal.api';
import { formatDistanceToNow } from 'date-fns';

interface TerminalCardProps {
    terminal: Terminal;
    selected?: boolean;
    onClick?: () => void;
    hasActiveShift?: boolean;
}

export function TerminalCard({
    terminal,
    selected = false,
    onClick,
    hasActiveShift = false,
}: TerminalCardProps) {
    const isOnline = terminal.lastSeenAt
        ? new Date().getTime() - new Date(terminal.lastSeenAt).getTime() < 5 * 60 * 1000 // 5 minutes
        : false;

    const lastSeenText = terminal.lastSeenAt
        ? formatDistanceToNow(new Date(terminal.lastSeenAt), { addSuffix: true })
        : 'Never';

    return (
        <div
            onClick={onClick}
            className={cn(
                'relative p-6 rounded-lg border-2 transition-all cursor-pointer',
                'hover:shadow-lg hover:scale-[1.02]',
                selected
                    ? 'border-primary bg-primary/10 shadow-lg'
                    : 'border-border bg-card hover:border-primary/50',
                !terminal.isActive && 'opacity-50 cursor-not-allowed',
                hasActiveShift && 'border-accent bg-accent/10'
            )}
        >
            {/* Status Indicators */}
            <div className="absolute top-3 right-3 flex items-center gap-2">
                {/* Online Status */}
                {isOnline ? (
                    <Wifi className="w-5 h-5 text-green-500" />
                ) : (
                    <WifiOff className="w-5 h-5 text-gray-400" />
                )}

                {/* Active Shift Indicator */}
                {hasActiveShift && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-orange-200 rounded-full text-xs font-medium text-orange-800">
                        <Lock className="w-3 h-3" />
                        Active
                    </div>
                )}
            </div>

            {/* Terminal Icon */}
            <div className={cn(
                'flex items-center justify-center w-16 h-16 rounded-xl mb-4',
                selected ? 'bg-primary/20' : 'bg-muted'
            )}>
                <Monitor className={cn(
                    'w-8 h-8',
                    selected ? 'text-primary' : 'text-muted-foreground'
                )} />
            </div>

            {/* Terminal Info */}
            <div className="space-y-2">
                <h3 className="font-semibold text-xl">{terminal.name}</h3>

                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Code:</span>
                    <code className="text-sm font-mono bg-gray-100 px-2 py-0.5 rounded">
                        {terminal.terminalCode}
                    </code>
                </div>

                {/* Status Badges */}
                <div className="flex flex-wrap gap-2 mt-3">
                    <StatusBadge
                        label={isOnline ? 'Online' : 'Offline'}
                        variant={isOnline ? 'success' : 'error'}
                    />

                    {terminal.offlineModeEnabled && (
                        <StatusBadge label="Offline Mode" variant="warning" />
                    )}

                    {!terminal.isActive && (
                        <StatusBadge label="Inactive" variant="error" />
                    )}
                </div>

                {/* Last Seen */}
                <div className="text-xs text-gray-500 mt-2">
                    Last seen: {lastSeenText}
                </div>

                {/* Max Shifts */}
                <div className="text-xs text-gray-500">
                    Max concurrent shifts: {terminal.maxConcurrentShifts}
                </div>
            </div>
        </div>
    );
}

interface StatusBadgeProps {
    label: string;
    variant: 'success' | 'warning' | 'error';
}

function StatusBadge({ label, variant }: StatusBadgeProps) {
    const colors = {
        success: 'bg-green-100 text-green-800',
        warning: 'bg-yellow-100 text-yellow-800',
        error: 'bg-red-100 text-red-800',
    };

    return (
        <span className={cn(
            'text-xs px-2 py-1 rounded-full font-medium',
            colors[variant]
        )}>
            {label}
        </span>
    );
}
