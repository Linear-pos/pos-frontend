import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface ProductSearchProps {
  value: string;
  onChange: (value: string) => void;
  onBarcodeSubmit?: (barcode: string) => void;
  className?: string;
}

export const ProductSearch = ({
  value,
  onChange,
  onBarcodeSubmit,
  className = "",
}: ProductSearchProps) => {
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && value.trim() && onBarcodeSubmit) {
      onBarcodeSubmit(value.trim());
    }
  };

  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-500" />
      <Input
        type="text"
        placeholder="Search by name, category, or scan barcode..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={handleKeyPress}
        className="w-full pl-10 py-2 border-neutral-300 rounded-lg focus:border-primary-500 focus:ring-primary-500"
      />
    </div>
  );
};

export default ProductSearch;
