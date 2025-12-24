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
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getSaleSummary: () => SaleSummary;
  calculateTotals: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      subtotal: 0,
      tax: 0,
      total: 0,
      itemCount: 0,

      addItem: (product: Product, quantity = 1) => {
        console.log('Adding product to cart:', product);
        set((state) => {
          const existingItem = state.items.find(item => item.product_id === product.id);
          const itemPrice = Number(product.price) || 0;
          
          console.log('Product details:', {
            id: product.id,
            name: product.name,
            price: product.price,
            itemPrice
          });
          
          let newItems: CartItem[];
          if (existingItem) {
              // Update existing item quantity
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
              // Add new item - only include necessary fields
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

      removeItem: (productId: number) => {
        set((state) => ({
          items: state.items.filter(item => item.product_id !== productId)
        }));
        get().calculateTotals();
      },

      updateQuantity: (productId: number, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        set((state) => ({
          items: state.items.map(item =>
            item.product_id === productId
              ? {
                  product_id: item.product_id,
                  product: item.product,
                  quantity,
                  price: Number(item.price) || 0,
                  total: quantity * (Number(item.price) || 0)
                }
              : item
          )
        }));
        get().calculateTotals();
      },

      clearCart: () => {
        set({
          items: [],
          subtotal: 0,
          tax: 0,
          total: 0,
          itemCount: 0
        });
      },

      calculateTotals: () => {
        const state = get();
        const subtotal = state.items.reduce((sum, item) => sum + (Number(item.total) || 0), 0);
        const tax = Math.round((subtotal * 0.16) * 100) / 100; // 16% tax
        const total = subtotal + tax;
        const itemCount = state.items.reduce((sum, item) => sum + (item.quantity || 0), 0);

        set({
          subtotal: Math.round(subtotal * 100) / 100,
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