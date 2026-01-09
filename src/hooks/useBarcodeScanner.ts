import { useEffect, useRef, useState } from 'react';
import { barcodeApi } from '../services/barcode.api';
import type { BarcodeLookupResponse } from '../types/product';

type UseBarcodeScannerOptions = {
  onScan: (barcode: string, product?: BarcodeLookupResponse['data']) => void;
  onError?: (error: Error) => void;
  validate?: (barcode: string) => boolean;
  lookupProduct?: boolean; // Whether to automatically look up product
  debounceMs?: number; // Debounce for product lookup
};

export const useBarcodeScanner = ({
  onScan,
  onError,
  validate,
  lookupProduct = false,
  debounceMs = 500,
}: UseBarcodeScannerOptions) => {
  const [isListening, setIsListening] = useState(false);
  const [isLookingUp, setIsLookingUp] = useState(false);

  const bufferRef = useRef('');
  const lastScanTimeRef = useRef(0);
  const lastKeyTimeRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lookupTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ---- Configuration (tuned for real scanners) ----
  const MIN_SCAN_INTERVAL = 500; // ms
  const MAX_KEY_INTERVAL = 50; // ms between chars
  const SCAN_TIMEOUT = 3000; // ms
  const MIN_BARCODE_LENGTH = 6;
  const TERMINATORS = ['Enter', 'Tab', 'NumpadEnter'];

  useEffect(() => {
    if (!isListening) return;

    const clearTimeoutRef = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };

    const resetBuffer = () => {
      bufferRef.current = '';
      clearTimeoutRef();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;

      // Ignore typing inside inputs/editables
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      const now = Date.now();

      // Prevent double scans
      if (now - lastScanTimeRef.current < MIN_SCAN_INTERVAL) return;

      // Detect manual typing (too slow)
      if (
        lastKeyTimeRef.current &&
        now - lastKeyTimeRef.current > MAX_KEY_INTERVAL &&
        bufferRef.current.length > 0
      ) {
        resetBuffer();
      }

      lastKeyTimeRef.current = now;
      clearTimeoutRef();

      // Terminator received → process scan
      if (TERMINATORS.includes(event.key)) {
        event.preventDefault();

        const barcode = bufferRef.current.trim();
        resetBuffer();

        if (barcode.length < MIN_BARCODE_LENGTH) return;

        if (validate && !validate(barcode)) {
          onError?.(new Error('Invalid barcode format'));
          return;
        }

        lastScanTimeRef.current = now;

        // Auto lookup product if enabled
        if (lookupProduct) {
          setIsLookingUp(true);
          barcodeApi.findByBarcode(barcode)
            .then((response) => {
              onScan(barcode, response.data);
            })
            .catch((error) => {
              // Still call onScan with barcode, but include error info
              onScan(barcode, undefined);
              if (onError) {
                onError(error instanceof Error ? error : new Error('Product lookup failed'));
              }
            })
            .finally(() => {
              setIsLookingUp(false);
            });
        } else {
          onScan(barcode);
        }
        return;
      }

      // Accept printable characters only
      if (
        event.key.length === 1 &&
        !event.ctrlKey &&
        !event.altKey &&
        !event.metaKey
      ) {
        event.preventDefault();
        bufferRef.current += event.key;

        // Timeout for incomplete scans
        timeoutRef.current = setTimeout(() => {
          if (bufferRef.current.length >= MIN_BARCODE_LENGTH) {
            onError?.(
              new Error(`Barcode scan timeout: ${bufferRef.current}`)
            );
          }
          resetBuffer();
        }, SCAN_TIMEOUT);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeoutRef();
    };
  }, [isListening, onScan, onError, validate]);

  const start = () => setIsListening(true);

  const stop = () => {
    setIsListening(false);
    bufferRef.current = '';
  };

  const reset = () => {
    bufferRef.current = '';
    lastScanTimeRef.current = 0;
    lastKeyTimeRef.current = 0;
  };

  return {
    isListening,
    isLookingUp,
    start,
    stop,
    reset,
    getCurrentBuffer: () => bufferRef.current,
  };
};

export default useBarcodeScanner;
