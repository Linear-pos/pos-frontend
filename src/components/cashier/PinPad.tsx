import { useState } from 'react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';
import { Delete, X } from 'lucide-react';

interface PinPadProps {
    onComplete: (pin: string) => void;
    onCancel?: () => void;
    maxLength?: number;
    title?: string;
    subtitle?: string;
    loading?: boolean;
    error?: string;
}

export function PinPad({
    onComplete,
    onCancel,
    maxLength = 6,
    title = 'Enter PIN',
    subtitle,
    loading = false,
    error,
}: PinPadProps) {
    const [pin, setPin] = useState('');

    const handleNumberClick = (num: string) => {
        if (pin.length < maxLength && !loading) {
            const newPin = pin + num;
            setPin(newPin);

            // Auto-submit when max length reached
            if (newPin.length === maxLength) {
                setTimeout(() => {
                    onComplete(newPin);
                }, 100);
            }
        }
    };

    const handleBackspace = () => {
        if (!loading) {
            setPin(pin.slice(0, -1));
        }
    };

    const handleClear = () => {
        if (!loading) {
            setPin('');
        }
    };

    const handleSubmit = () => {
        if (pin.length >= 4 && !loading) {
            onComplete(pin);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-semibold">{title}</h2>
                {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
            </div>

            {/* PIN Display */}
            <div className="flex items-center justify-center gap-3 min-h-[60px]">
                {Array.from({ length: maxLength }).map((_, index) => (
                    <div
                        key={index}
                        className={cn(
                            'w-12 h-12 rounded-lg border-2 flex items-center justify-center transition-all',
                            index < pin.length
                                ? 'border-primary bg-primary/10'
                                : 'border-border bg-card',
                            loading && 'opacity-50'
                        )}
                    >
                        {index < pin.length && (
                            <div className="w-3 h-3 rounded-full bg-primary" />
                        )}
                    </div>
                ))}
            </div>

            {/* Error Message */}
            {error && (
                <div className="text-sm text-red-600 text-center px-4 py-2 bg-red-50 rounded-md">
                    {error}
                </div>
            )}

            {/* Number Pad */}
            <div className="grid grid-cols-3 gap-3 w-full">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <Button
                        key={num}
                        variant="outline"
                        size="lg"
                        onClick={() => handleNumberClick(num.toString())}
                        disabled={loading}
                        className={cn(
                            'h-16 text-2xl font-semibold hover:bg-primary/10 hover:border-primary',
                            'active:scale-95 transition-transform'
                        )}
                    >
                        {num}
                    </Button>
                ))}

                {/* Bottom Row: Clear, 0, Backspace */}
                <Button
                    variant="outline"
                    size="lg"
                    onClick={handleClear}
                    disabled={loading || pin.length === 0}
                    className="h-16 hover:bg-red-50 hover:border-red-500"
                >
                    <X className="w-6 h-6" />
                </Button>

                <Button
                    variant="outline"
                    size="lg"
                    onClick={() => handleNumberClick('0')}
                    disabled={loading}
                    className={cn(
                        'h-16 text-2xl font-semibold hover:bg-primary/10 hover:border-primary',
                        'active:scale-95 transition-transform'
                    )}
                >
                    0
                </Button>

                <Button
                    variant="outline"
                    size="lg"
                    onClick={handleBackspace}
                    disabled={loading || pin.length === 0}
                    className="h-16 hover:bg-yellow-50 hover:border-yellow-500"
                >
                    <Delete className="w-6 h-6" />
                </Button>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 w-full pt-4">
                {onCancel && (
                    <Button
                        variant="outline"
                        onClick={onCancel}
                        disabled={loading}
                        className="flex-1"
                    >
                        Cancel
                    </Button>
                )}

                <Button
                    onClick={handleSubmit}
                    disabled={pin.length < 4 || loading}
                    className="flex-1"
                >
                    {loading ? 'Verifying...' : 'Submit'}
                </Button>
            </div>
        </div>
    );
}
