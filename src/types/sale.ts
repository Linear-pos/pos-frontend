import type { Product } from './product';
import type { User } from './user';
export type { Product } from './product';

export interface SaleItem {
  id?: string;
  sale_id: string;
  product_id: number;
  quantity: number;
  price: number;
  total: number;
  unit_size_value?: number;
  unit_size_type?: string;
  product?: Product;
}

export interface Sale {
  id: string;
  user_id: string;
  branch_id?: string;
  subtotal: number;
  tax: number;
  total: number;
  payment_method: string;
  status: 'completed' | 'pending' | 'cancelled';
  reference?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  items?: SaleItem[];
  user?: User;
  branch?: {
    id: string;
    name: string;
  };
}

export interface CreateSalePayload {
  branch_id?: string;
  payment_method: string;
  status?: 'completed' | 'pending';
  reference?: string;
  notes?: string;
  tax?: number;
  items: Array<{
    product_id: number;
    quantity: number;
    price?: number; // Uses product price if not provided
  }>;
}

export interface SalesListResponse {
  data: Sale[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface SaleResponse {
  data: Sale;
  message: string;
}

/**
 * Cart item for building a sale before submission
 */
export interface CartItem {
  product_id: number;
  product: Product;
  quantity: number;
  price: number;
  total: number;
}

/**
 * Sale summary for checkout
 */
export interface SaleSummary {
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  itemCount: number;
}
