import { useEffect, useRef, useState } from 'react';

export const useBarcodeScanner = (
  onScan: (barcode: string) => void,
  onError?: (error: Error) => void,
) => {
  const [isListening, setIsListening] = useState(false);
  const barcodeBufferRef = useRef<string>('');
  const lastScanTimeRef = useRef<number>(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Minimum time between barcode scans to avoid double scans
  const MIN_SCAN_INTERVAL = 500;

  // Typical barcode scanner sends all characters rapidly, then ENTER (code 13)
  const BARCODE_TERMINATOR = 'Enter';

  useEffect(() => {
    if (!isListening) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const now = Date.now();

      // Check if enough time has passed since last complete scan
      if (now - lastScanTimeRef.current < MIN_SCAN_INTERVAL) {
        return;
      }

      // Clear timeout if it exists
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Check if this is the terminator key (Enter)
      if (event.key === BARCODE_TERMINATOR) {
        event.preventDefault();

        const barcode = barcodeBufferRef.current.trim();

        // Only process if we have a barcode
        if (barcode.length > 0) {
          lastScanTimeRef.current = now;
          onScan(barcode);
        }

        // Reset buffer
        barcodeBufferRef.current = '';
        return;
      }

      // Add character to buffer (printable ASCII characters)
      if (event.key.length === 1 && !event.ctrlKey && !event.altKey && !event.metaKey) {
        event.preventDefault();
        barcodeBufferRef.current += event.key;

        // Set timeout to clear buffer if no terminator key is pressed within 5 seconds
        timeoutRef.current = setTimeout(() => {
          if (barcodeBufferRef.current.length > 0) {
            const error = new Error(
              `Barcode scan timeout. Partial scan: ${barcodeBufferRef.current}`,
            );
            onError?.(error);
            barcodeBufferRef.current = '';
          }
        }, 5000);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isListening, onScan, onError]);

  const start = () => {
    setIsListening(true);
  };

  const stop = () => {
    setIsListening(false);
    barcodeBufferRef.current = '';
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const reset = () => {
    barcodeBufferRef.current = '';
    lastScanTimeRef.current = 0;
  };

  return {
    isListening,
    start,
    stop,
    reset,
    getCurrentBuffer: () => barcodeBufferRef.current,
  };
};

export default useBarcodeScanner;
