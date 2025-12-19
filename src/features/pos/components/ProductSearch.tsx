import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import type { ProductSearchProps } from '../pos.types';

export const ProductSearch = ({
  value,
  onChange,
  className = ''
}: ProductSearchProps) => {
  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <Input
        type="text"
        placeholder="Search products..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-9"
      />
    </div>
  );
};

export default ProductSearch;