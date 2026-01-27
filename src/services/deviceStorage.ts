/**
 * Device Storage Service
 * Manages persistent device mode state using localStorage
 */

export interface DeviceMode {
    type: 'terminal' | 'management' | 'uninitialized';
    terminalId?: string;
    terminalCode?: string;
    terminalName?: string;
    tenantId?: string;
    lastUpdated: string;
}

const STORAGE_KEY = 'omnipos_device_mode';

/**
 * Device storage service for managing device mode persistence
 */
export const deviceStorage = {
    /**
     * Get the current device mode from localStorage
     */
    getMode(): DeviceMode | null {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (!stored) return null;

            const mode: DeviceMode = JSON.parse(stored);

            // Validate mode structure
            if (!mode.type || !mode.lastUpdated) {
                console.warn('[DeviceStorage] Invalid mode structure, clearing');
                this.clearMode();
                return null;
            }

            return mode;
        } catch (error) {
            console.error('[DeviceStorage] Failed to get mode:', error);
            return null;
        }
    },

    /**
     * Save device mode to localStorage
     */
    setMode(mode: DeviceMode): void {
        try {
            const updatedMode = {
                ...mode,
                lastUpdated: new Date().toISOString()
            };

            localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedMode));
            console.log('[DeviceStorage] Mode saved:', updatedMode.type);
        } catch (error) {
            console.error('[DeviceStorage] Failed to set mode:', error);
        }
    },

    /**
     * Clear device mode from localStorage
     */
    clearMode(): void {
        try {
            localStorage.removeItem(STORAGE_KEY);
            console.log('[DeviceStorage] Mode cleared');
        } catch (error) {
            console.error('[DeviceStorage] Failed to clear mode:', error);
        }
    },

    /**
     * Check if device is in terminal mode
     */
    isTerminalMode(): boolean {
        const mode = this.getMode();
        return mode?.type === 'terminal';
    },

    /**
     * Check if device is in management mode
     */
    isManagementMode(): boolean {
        const mode = this.getMode();
        return mode?.type === 'management';
    }
};
