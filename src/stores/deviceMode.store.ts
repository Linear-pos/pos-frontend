import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type DeviceMode =
    | { type: 'uninitialized' }
    | { type: 'management' }
    | {
        type: 'terminal';
        terminalId: string;
        terminalCode: string;
        terminalName: string;
        tenantId: string;
        branchId: string;
        verifiedAt: number;
    };

interface DeviceModeStore {
    mode: DeviceMode;
    setManagementMode: () => void;
    setTerminalMode: (terminal: {
        terminalId: string;
        terminalCode: string;
        terminalName: string;
        tenantId: string;
        branchId: string;
    }) => void;
    clearMode: () => void;
    requiresTerminalReverification: () => boolean;
}

const REVALIDATION_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

export const useDeviceModeStore = create<DeviceModeStore>()(
    persist(
        (set, get) => ({
            mode: { type: 'uninitialized' },

            setManagementMode: () => {
                set({ mode: { type: 'management' } });
            },

            setTerminalMode: (terminal) => {
                set({
                    mode: {
                        type: 'terminal',
                        terminalId: terminal.terminalId,
                        terminalCode: terminal.terminalCode,
                        terminalName: terminal.terminalName,
                        tenantId: terminal.tenantId,
                        branchId: terminal.branchId,
                        verifiedAt: Date.now(),
                    },
                });
            },

            clearMode: () => {
                set({ mode: { type: 'uninitialized' } });
            },

            requiresTerminalReverification: () => {
                const { mode } = get();
                if (mode.type !== 'terminal') return false;

                const now = Date.now();
                const timeSinceVerification = now - mode.verifiedAt;

                return timeSinceVerification > REVALIDATION_INTERVAL;
            },
        }),
        {
            name: 'omni:device-mode',
        }
    )
);
