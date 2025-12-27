// Quick test for cart functionality
import { useCartStore } from '../src/stores/cart.store';

// Test data
const testProduct = {
  id: 1,
  name: 'Test Product',
  sku: 'TEST001',
  price: '150.50', // String price to test conversion
  category: 'Test Category',
  stock_quantity: 10,
  reorder_level: 5,
  unit: 'pcs' as const,
  is_active: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
};

console.log('Testing cart functionality...');

const { addItem, items, subtotal, tax, total, itemCount } = useCartStore.getState();

// Test adding item with string price
addItem(testProduct, 2);

const state = useCartStore.getState();
console.log('Cart state after adding item:', {
  items: state.items,
  subtotal: state.subtotal,
  tax: state.tax,
  total: state.total,
  itemCount: state.itemCount
});

console.log('✅ Cart functionality test completed');