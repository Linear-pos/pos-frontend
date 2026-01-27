import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product, CartItem, SaleSummary } from '../types/sale';

interface CartState {
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  itemCount: number;

  // Actions
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getSaleSummary: () => SaleSummary;
  calculateTotals: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [] as CartItem[],
      subtotal: 0,
      tax: 0,
      total: 0,
      itemCount: 0,

      addItem: (product: Product, quantity = 1) => {
        set((state) => {
          const existingItem = state.items.find(item => item.product_id === product.id);
          const itemPrice = Number(product.price) || 0;

          let newItems: CartItem[];
          if (existingItem) {
            newItems = state.items.map(item =>
              item.product_id === product.id
                ? {
                  ...item,
                  quantity: item.quantity + quantity,
                  price: itemPrice,
                  total: (item.quantity + quantity) * itemPrice
                }
                : item
            );
          } else {
            const newItem: CartItem = {
              product_id: product.id,
              product: { ...product },
              quantity,
              price: itemPrice,
              total: itemPrice * quantity
            };
            newItems = [...state.items, newItem];
          }

          return { items: newItems };
        });

        get().calculateTotals();
      },

      removeItem: (productId: string) => {
        set((state) => ({
          items: state.items.filter(item => item.product_id !== productId)
        }));
        get().calculateTotals();
      },

      updateQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        set((state) => ({
          items: state.items.map(item =>
            item.product_id === productId
              ? {
                ...item,
                quantity,
                total: quantity * (Number(item.price) || 0)
              }
              : item
          )
        }));
        get().calculateTotals();
      },

      clearCart: () => {
        set({
          items: [] as CartItem[],
          subtotal: 0,
          tax: 0,
          total: 0,
          itemCount: 0
        });
      },

      calculateTotals: () => {
        const state = get();
        const total = state.items.reduce((sum, item) => sum + (Number(item.total) || 0), 0);

        // Tax is 16% of the inclusive total
        const tax = total * (0.16 / 1.16);

        const subtotal = total;
        const itemCount = state.items.reduce((sum, item) => sum + (item.quantity || 0), 0);

        set({
          subtotal,
          tax,
          total,
          itemCount
        });
      },

      getSaleSummary: (): SaleSummary => {
        const state = get();
        return {
          items: state.items,
          subtotal: state.subtotal,
          tax: state.tax,
          total: state.total,
          itemCount: state.itemCount
        };
      }
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({
        items: state.items,
        subtotal: state.subtotal,
        tax: state.tax,
        total: state.total,
        itemCount: state.itemCount
      })
    }
  )
);