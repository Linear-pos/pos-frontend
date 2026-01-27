import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Cashier } from '../services/cashier.api';

interface CashierState {
    // Current authenticated cashier
    cashier: Cashier | null;
    cashierToken: string | null;

    // Actions
    setCashier: (cashier: Cashier, token: string) => void;
    clearCashier: () => void;
    isAuthenticated: () => boolean;
    hasPermission: (permission: 'can_open_shift' | 'can_close_shift' | 'can_override_prices') => boolean;
    isSupervisorOrAbove: () => boolean;
}

export const useCashierStore = create<CashierState>()(
    persist(
        (set, get) => ({
            cashier: null,
            cashierToken: null,

            setCashier: (cashier, token) => {
                set({ cashier, cashierToken: token });
            },

            clearCashier: () => {
                set({ cashier: null, cashierToken: null });
            },

            isAuthenticated: () => {
                return !!get().cashier && !!get().cashierToken;
            },

            hasPermission: (permission) => {
                const cashier = get().cashier;
                if (!cashier) return false;

                switch (permission) {
                    case 'can_open_shift':
                        return cashier.canOpenShift;
                    case 'can_close_shift':
                        return cashier.canCloseShift;
                    case 'can_override_prices':
                        return cashier.canOverridePrices;
                    default:
                        return false;
                }
            },

            isSupervisorOrAbove: () => {
                const cashier = get().cashier;
                return cashier?.role === 'supervisor' || cashier?.role === 'manager';
            },
        }),
        {
            name: 'cashier-storage',
            partialize: (state) => ({
                cashier: state.cashier,
                cashierToken: state.cashierToken,
            }),
        }
    )
);
