import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Shift, ShiftEvent } from '../services/shift.api';

interface ShiftState {
    // Current active shift
    currentShift: Shift | null;
    selectedTerminalId: string | null;

    // Real-time running totals (updated locally for responsiveness)
    runningTotals: {
        totalSales: number;
        totalCashSales: number;
        totalMpesaSales: number;
        totalCardSales: number;
        cashDrops: number;
        cashAdditions: number;
    };

    // Recent events cache
    recentEvents: ShiftEvent[];

    // Actions
    setCurrentShift: (shift: Shift | null) => void;
    setSelectedTerminal: (terminalId: string | null) => void;
    updateRunningTotals: (paymentMethod: 'cash' | 'mpesa' | 'card', amount: number) => void;
    recordCashDrop: (amount: number) => void;
    recordCashAddition: (amount: number) => void;
    addEvent: (event: ShiftEvent) => void;
    clearEvents: () => void;
    resetShift: () => void;

    // Computed values
    getExpectedCash: () => number;
    getCurrentCashInDrawer: () => number;
    hasActiveShift: () => boolean;
}

export const useShiftStore = create<ShiftState>()(
    persist(
        (set, get) => ({
            currentShift: null,
            selectedTerminalId: null,
            runningTotals: {
                totalSales: 0,
                totalCashSales: 0,
                totalMpesaSales: 0,
                totalCardSales: 0,
                cashDrops: 0,
                cashAdditions: 0,
            },
            recentEvents: [],

            setCurrentShift: (shift) => {
                if (shift) {
                    // Initialize running totals from shift data
                    set({
                        currentShift: shift,
                        runningTotals: {
                            totalSales: shift.totalSales,
                            totalCashSales: shift.totalCashSales,
                            totalMpesaSales: shift.totalMpesaSales,
                            totalCardSales: shift.totalCardSales,
                            cashDrops: shift.cashDrops,
                            cashAdditions: shift.cashAdditions,
                        },
                    });
                } else {
                    // Clear shift
                    set({
                        currentShift: null,
                        runningTotals: {
                            totalSales: 0,
                            totalCashSales: 0,
                            totalMpesaSales: 0,
                            totalCardSales: 0,
                            cashDrops: 0,
                            cashAdditions: 0,
                        },
                        recentEvents: [],
                    });
                }
            },

            setSelectedTerminal: (terminalId) => {
                set({ selectedTerminalId: terminalId });
            },

            updateRunningTotals: (paymentMethod, amount) => {
                set((state) => {
                    const newTotals = {
                        ...state.runningTotals,
                        totalSales: state.runningTotals.totalSales + amount,
                    };

                    // Update specific payment method total
                    switch (paymentMethod) {
                        case 'cash':
                            newTotals.totalCashSales += amount;
                            break;
                        case 'mpesa':
                            newTotals.totalMpesaSales += amount;
                            break;
                        case 'card':
                            newTotals.totalCardSales += amount;
                            break;
                    }

                    return { runningTotals: newTotals };
                });
            },

            recordCashDrop: (amount) => {
                set((state) => ({
                    runningTotals: {
                        ...state.runningTotals,
                        cashDrops: state.runningTotals.cashDrops + amount,
                    },
                }));
            },

            recordCashAddition: (amount) => {
                set((state) => ({
                    runningTotals: {
                        ...state.runningTotals,
                        cashAdditions: state.runningTotals.cashAdditions + amount,
                    },
                }));
            },

            addEvent: (event) => {
                set((state) => ({
                    recentEvents: [event, ...state.recentEvents].slice(0, 50), // Keep last 50 events
                }));
            },

            clearEvents: () => {
                set({ recentEvents: [] });
            },

            resetShift: () => {
                set({
                    currentShift: null,
                    selectedTerminalId: null,
                    runningTotals: {
                        totalSales: 0,
                        totalCashSales: 0,
                        totalMpesaSales: 0,
                        totalCardSales: 0,
                        cashDrops: 0,
                        cashAdditions: 0,
                    },
                    recentEvents: [],
                });
            },

            // Computed values
            getExpectedCash: () => {
                const { currentShift, runningTotals } = get();
                if (!currentShift) return 0;

                const openingCash = currentShift.openingCash;
                const cashSales = runningTotals.totalCashSales;
                const drops = runningTotals.cashDrops;
                const additions = runningTotals.cashAdditions;

                return openingCash + cashSales - drops + additions;
            },

            getCurrentCashInDrawer: () => {
                return get().getExpectedCash();
            },

            hasActiveShift: () => {
                const shift = get().currentShift;
                return shift !== null && shift.status === 'open';
            },
        }),
        {
            name: 'shift-storage',
            partialize: (state) => ({
                currentShift: state.currentShift,
                selectedTerminalId: state.selectedTerminalId,
                runningTotals: state.runningTotals,
            }),
        }
    )
);
