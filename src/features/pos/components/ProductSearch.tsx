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
      <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="text"
        placeholder="Search by name, category, or scan barcode..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={handleKeyPress}
        className="w-full pl-10 py-2 rounded-lg border-border focus:border-primary focus:ring-primary placeholder:text-muted-foreground/70"
      />
    </div>
  );
};

export default ProductSearch;
