export interface Product {
  id: string;
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

export interface ProductBarcode {
  id: string;
  product_id: string;
  barcode: string;
  barcode_type: BarcodeType;
  is_primary: boolean;
  quantity?: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface BarcodeTypesResponse {
  data: Record<BarcodeType, string>;
  message: string;
}

export interface BarcodeLookupResponse {
  message: string;
  data: Product & {
    barcodes: ProductBarcode[];
    matched_barcode: ProductBarcode;
  };
}

export interface CreateBarcodePayload {
  barcode: string;
  barcode_type?: BarcodeType;
  is_primary?: boolean;
  quantity?: number;
}

export interface UpdateBarcodePayload extends Partial<CreateBarcodePayload> {}

export type BarcodeType = 
  | 'CODE128'
  | 'CODE39'
  | 'EAN13'
  | 'EAN8'
  | 'UPC'
  | 'UPCE'
  | 'ISBN'
  | 'ISSN'
  | 'ITF14'
  | 'GS1_128';

export const BARCODE_TYPES: Record<BarcodeType, string> = {
  CODE128: 'Code 128',
  CODE39: 'Code 39',
  EAN13: 'EAN-13',
  EAN8: 'EAN-8',
  UPC: 'UPC-A',
  UPCE: 'UPC-E',
  ISBN: 'ISBN',
  ISSN: 'ISSN',
  ITF14: 'ITF-14',
  GS1_128: 'GS1-128',
} as const;
