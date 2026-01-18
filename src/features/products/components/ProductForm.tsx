import { useState, useEffect } from "react";
import type { Product } from "../../../types/product";

type FormDataState = {
  name: string;
  sku: string;
  price: number;
  cost: number;
  description: string;
  category: string;
  stock_quantity: number;
  reorder_level: number;
  unit: 'pcs' | 'ml' | 'g' | 'l' | 'm';
  unit_size?: number;
  is_active: boolean;
};

interface ProductFormProps {
  product?: Product | null;
  onSubmit: (data: Partial<Product>) => Promise<void>;
  onClose: () => void;
  loading: boolean;
}

export const ProductForm = ({
  product,
  onSubmit,
  onClose,
  loading,
}: ProductFormProps) => {
  const [formData, setFormData] = useState<FormDataState>({
    name: "",
    sku: "",
    price: 0,
    cost: 0,
    description: "",
    category: "",
    stock_quantity: 0,
    reorder_level: 10,
    unit: "pcs",
    unit_size: undefined,
    is_active: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Determine if unit_size field should be shown
  const showUnitSize = ['ml', 'g', 'l', 'm'].includes(formData.unit);

  useEffect(() => {

    if (product) {
      setFormData({
        name: product.name,
        sku: product.sku,
        price: product.price,
        cost: product.cost || 0,
        description: product.description || "",
        category: product.category || "",
        stock_quantity: product.stock_quantity,
        reorder_level: product.reorder_level,
        unit: product.unit || "pcs",
        unit_size: product.unit_size,
        is_active: product.is_active,
      });
    }
  }, [product]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Product name is required";
    }

    if (!formData.sku.trim()) {
      newErrors.sku = "SKU is required";
    }

    if (formData.price <= 0) {
      newErrors.price = "Price must be greater than 0";
    }

    if (formData.cost < 0) {
      newErrors.cost = "Cost cannot be negative";
    }

    if (formData.cost > formData.price) {
      newErrors.cost = "Cost cannot exceed selling price";
    }

    if (formData.stock_quantity < 0) {
      newErrors.stock_quantity = "Stock quantity cannot be negative";
    }

    if (formData.reorder_level < 0) {
      newErrors.reorder_level = "Reorder level cannot be negative";
    }

    if (showUnitSize && formData.unit_size && formData.unit_size <= 0) {
      newErrors.unit_size = "Unit size must be greater than 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    let processedValue: any = value;

    if (type === "checkbox") {
      processedValue = (e.target as HTMLInputElement).checked;
    } else if (name === "price" || name === "cost" || name === "unit_size") {
      processedValue = parseFloat(value) || (name === "unit_size" ? undefined : 0);
    } else if (name === "stock_quantity" || name === "reorder_level") {
      processedValue = parseInt(value) || 0;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-card text-card-foreground rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">
            {product ? "Edit Product" : "Add New Product"}
          </h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-muted-foreground hover:text-foreground text-2xl leading-none disabled:opacity-50 transition-colors duration-200 focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Product Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={loading}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 text-foreground placeholder-muted-foreground ${errors.name
                ? "border-red-500 focus:ring-red-500"
                : "border-input focus:ring-ring"
                } disabled:opacity-50 disabled:bg-muted`}
              placeholder="e.g., Laptop Dell XPS 13"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* SKU and Price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                SKU (Barcode) *
              </label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                disabled={loading || !!product}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 text-foreground placeholder-muted-foreground ${errors.sku
                  ? "border-red-500 focus:ring-red-500"
                  : "border-input focus:ring-ring"
                  } disabled:opacity-50 disabled:bg-muted disabled:text-muted-foreground`}
                placeholder="e.g., SKU-001"
              />
              {errors.sku && (
                <p className="mt-1 text-sm text-red-600">{errors.sku}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Selling Price (KES) *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                disabled={loading}
                step="0.01"
                min="0"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 text-foreground placeholder-muted-foreground ${errors.price
                  ? "border-red-500 focus:ring-red-500"
                  : "border-input focus:ring-ring"
                  } disabled:opacity-50 disabled:bg-muted`}
                placeholder="0.00"
              />
              {errors.price && (
                <p className="mt-1 text-sm text-red-600">{errors.price}</p>
              )}
            </div>
          </div>

          {/* Cost and Unit */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Cost Price (KES)
              </label>
              <input
                type="number"
                name="cost"
                value={formData.cost}
                onChange={handleChange}
                disabled={loading}
                step="0.01"
                min="0"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 text-foreground placeholder-muted-foreground ${errors.cost
                    ? "border-red-500 focus:ring-red-500"
                    : "border-input focus:ring-ring"
                  } disabled:opacity-50 disabled:bg-muted`}
                placeholder="0.00"
              />
              {errors.cost && (
                <p className="mt-1 text-sm text-red-600">{errors.cost}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Unit
              </label>
              <select
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                disabled={loading}
                className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:bg-muted"
              >
                <option value="pcs">Pieces (pcs)</option>
                <option value="kg">Kilograms (kg)</option>
                <option value="g">Grams (g)</option>
                <option value="l">Liters (l)</option>
                <option value="ml">Milliliters (ml)</option>
                <option value="m">Meters (m)</option>
                <option value="box">Box</option>
                <option value="pack">Pack</option>
              </select>
            </div>
          </div>

          {/* Conditional Unit Size Field */}
          {showUnitSize && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Unit Size ({formData.unit}) <span className="text-muted-foreground text-xs">e.g., 500 for 500ml bottle</span>
              </label>
              <input
                type="number"
                name="unit_size"
                value={formData.unit_size || ""}
                onChange={handleChange}
                disabled={loading}
                step="0.01"
                min="0"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 text-foreground placeholder-muted-foreground ${errors.unit_size
                    ? "border-red-500 focus:ring-red-500"
                    : "border-input focus:ring-ring"
                  } disabled:opacity-50 disabled:bg-muted`}
                placeholder={`Size in ${formData.unit}`}
              />
              {errors.unit_size && (
                <p className="mt-1 text-sm text-red-600">{errors.unit_size}</p>
              )}
            </div>
          )}

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Category
            </label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              disabled={loading}
              className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder-muted-foreground disabled:opacity-50 disabled:bg-muted"
              placeholder="e.g., Electronics"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              disabled={loading}
              rows={3}
              className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder-muted-foreground disabled:opacity-50 disabled:bg-muted"
              placeholder="Product description..."
            />
          </div>

          {/* Stock and Reorder */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Current Stock
              </label>
              <input
                type="number"
                name="stock_quantity"
                value={formData.stock_quantity}
                onChange={handleChange}
                disabled={loading}
                min="0"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 text-foreground placeholder-muted-foreground ${errors.stock_quantity
                  ? "border-red-500 focus:ring-red-500"
                  : "border-input focus:ring-ring"
                  } disabled:opacity-50 disabled:bg-muted`}
                placeholder="0"
              />
              {errors.stock_quantity && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.stock_quantity}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Reorder Level
              </label>
              <input
                type="number"
                name="reorder_level"
                value={formData.reorder_level}
                onChange={handleChange}
                disabled={loading}
                min="0"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 text-foreground placeholder-muted-foreground ${errors.reorder_level
                  ? "border-red-500 focus:ring-red-500"
                  : "border-input focus:ring-ring"
                  } disabled:opacity-50 disabled:bg-muted`}
                placeholder="10"
              />
              {errors.reorder_level && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.reorder_level}
                </p>
              )}
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              disabled={loading}
              className="w-4 h-4 border-input rounded text-primary focus:ring-2 focus:ring-ring disabled:opacity-50 cursor-pointer"
            />
            <label
              htmlFor="is_active"
              className="text-sm font-medium text-foreground cursor-pointer"
            >
              Active Product
            </label>
          </div>

          {/* Info Box */}
          <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
            <p className="text-sm text-primary-foreground">
              <strong>Profit Margin:</strong>{" "}
              {formData.cost > 0
                ? (
                  ((formData.price - formData.cost) / formData.price) *
                  100
                ).toFixed(1) + "%"
                : "N/A"}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2 border border-input hover:bg-muted text-foreground rounded-lg font-medium transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition disabled:opacity-50"
            >
              {loading
                ? "Saving..."
                : product
                  ? "Update Product"
                  : "Create Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
