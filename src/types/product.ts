export interface Product {
  id: number;
  name: string;
  sku: string;
  description?: string;
  category?: string;
  price: number;
  cost?: number;
  stock_quantity: number;
  reorder_level: number;
  unit: 'pcs' | 'ml' | 'g' | 'l' | 'm';
  unit_size?: number;
  image_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface CreateProductPayload {
  name: string;
  sku: string;
  price: number;
  cost?: number;
  description?: string;
  category?: string;
  stock_quantity?: number;
  reorder_level?: number;
  unit: 'pcs' | 'ml' | 'g' | 'l' | 'm';
  unit_size?: number;
  image_url?: string;
  is_active?: boolean;
}

export interface UpdateProductPayload extends Partial<CreateProductPayload> {}

export interface ProductsListResponse {
  data: Product[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface ProductResponse {
  data: Product;
  message: string;
}
