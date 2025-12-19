export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image?: string;
  description?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface ProductSearchProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export interface ProductGridProps {
  onAddToCart: (product: Product) => void;
  searchQuery: string;
  className?: string;
}

export interface CartProps {
  items: Product[];
  onRemoveItem: (productId: string) => void;
  className?: string;
}

export interface CheckoutBarProps {
  total: number;
  onCheckout: () => void;
  className?: string;
}