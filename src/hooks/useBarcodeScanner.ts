import { useEffect, useRef, useCallback } from 'react';

interface UseBarcodeScannerProps {
    onScan: (barcode: string) => void;
    minLength?: number;
    timeThreshold?: number; // Max time between keystrokes to be considered a scan
}

export const useBarcodeScanner = ({
    onScan,
    minLength = 3,
    timeThreshold = 50,
}: UseBarcodeScannerProps) => {
    const buffer = useRef<string>('');
    const lastKeyTime = useRef<number>(0);

    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            // Ignore if event target is an input or textarea
            const target = event.target as HTMLElement;
            if (['INPUT', 'TEXTAREA'].includes(target.tagName) || target.isContentEditable) {
                return;
            }

            const currentTime = Date.now();
            const timeSinceLastKey = currentTime - lastKeyTime.current;

            // If too much time passed, reset buffer (likely manual typing started)
            if (buffer.current.length > 0 && timeSinceLastKey > timeThreshold) {
                buffer.current = '';
            }

            lastKeyTime.current = currentTime;

            if (event.key === 'Enter') {
                if (buffer.current.length >= minLength) {
                    onScan(buffer.current);
                    buffer.current = ''; // Clear after successful scan
                }
            } else if (event.key.length === 1) {
                // Append printable characters
                buffer.current += event.key;
            }
        },
        [onScan, minLength, timeThreshold]
    );

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]);
};
