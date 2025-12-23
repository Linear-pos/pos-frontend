import { useState, useEffect } from "react";
import type { Product } from "../../../types/product";

interface ProductFormProps {
  product?: Product | null;
  onSubmit: (data: any) => Promise<void>;
  onClose: () => void;
  loading: boolean;
}

export const ProductForm = ({
  product,
  onSubmit,
  onClose,
  loading,
}: ProductFormProps) => {
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    price: 0,
    cost: 0,
    description: "",
    category: "",
    stock_quantity: 0,
    reorder_level: 10,
    unit: "pcs" as 'pcs' | 'ml' | 'g' | 'l' | 'm',
    unit_size: undefined as number | undefined,
    is_active: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

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
        unit: (product.unit || "pcs") as 'pcs' | 'ml' | 'g' | 'l' | 'm',
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

    if (formData.stock_quantity < 0) {
      newErrors.stock_quantity = "Stock quantity cannot be negative";
    }

    if (formData.reorder_level < 0) {
      newErrors.reorder_level = "Reorder level cannot be negative";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target as any;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
      [name]:
        name === "price" || name === "cost" ? parseFloat(value) || 0 : value,
      [name]:
        name === "stock_quantity" || name === "reorder_level"
          ? parseInt(value) || 0
          : value,
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {product ? "Edit Product" : "Add New Product"}
          </h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none disabled:opacity-50"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={loading}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 text-gray-900 placeholder-gray-400 ${
                errors.name
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
              } disabled:opacity-50 disabled:bg-gray-50`}
              placeholder="e.g., Laptop Dell XPS 13"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* SKU and Price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SKU (Barcode) *
              </label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                disabled={loading || !!product}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 text-gray-900 placeholder-gray-400 ${
                  errors.sku
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                } disabled:opacity-50 disabled:bg-gray-100 disabled:text-gray-500`}
                placeholder="e.g., SKU-001"
              />
              {errors.sku && (
                <p className="mt-1 text-sm text-red-600">{errors.sku}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 text-gray-900 placeholder-gray-400 ${
                  errors.price
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                } disabled:opacity-50 disabled:bg-gray-50`}
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400 disabled:opacity-50 disabled:bg-gray-50"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unit
              </label>
              <select
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                disabled={loading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:bg-gray-50"
              >
                <option value="pcs">Pieces (pcs)</option>
                <option value="ml">Milliliters (ml)</option>
                <option value="g">Grams (g)</option>
                <option value="l">Liters (l)</option>
                <option value="m">Meters (m)</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">Base unit for stock tracking</p>
            </div>
          </div>

          {/* Unit Size (e.g., 250ml yoghurt, 2L oil) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Unit Size <span className="text-gray-500 text-xs">(optional)</span>
            </label>
            <input
              type="number"
              name="unit_size"
              value={formData.unit_size || ""}
              onChange={handleChange}
              disabled={loading}
              step="0.01"
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400 disabled:opacity-50 disabled:bg-gray-50"
              placeholder="e.g., 250 or 2.5"
            />
            <p className="mt-1 text-xs text-gray-500">e.g., 250 for 250ml, 2.5 for 2.5L</p>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              disabled={loading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400 disabled:opacity-50 disabled:bg-gray-50"
              placeholder="e.g., Electronics"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              disabled={loading}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400 disabled:opacity-50 disabled:bg-gray-50"
              placeholder="Product description..."
            />
          </div>

          {/* Stock and Reorder */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Stock
              </label>
              <input
                type="number"
                name="stock_quantity"
                value={formData.stock_quantity}
                onChange={handleChange}
                disabled={loading}
                min="0"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 text-gray-900 placeholder-gray-400 ${
                  errors.stock_quantity
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                } disabled:opacity-50 disabled:bg-gray-50`}
                placeholder="0"
              />
              {errors.stock_quantity && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.stock_quantity}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reorder Level
              </label>
              <input
                type="number"
                name="reorder_level"
                value={formData.reorder_level}
                onChange={handleChange}
                disabled={loading}
                min="0"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 text-gray-900 placeholder-gray-400 ${
                  errors.reorder_level
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                } disabled:opacity-50 disabled:bg-gray-50`}
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
              className="w-4 h-4 border-gray-300 rounded text-blue-600 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 cursor-pointer"
            />
            <label
              htmlFor="is_active"
              className="text-sm font-medium text-gray-700 cursor-pointer"
            >
              Active Product
            </label>
          </div>

          {/* Info Box */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900 mb-2">
              <strong>Profit Margin:</strong>{" "}
              {formData.cost > 0
                ? (
                    ((formData.price - formData.cost) / formData.price) *
                    100
                  ).toFixed(1) + "%"
                : "N/A"}
            </p>
            {formData.unit_size && (
              <p className="text-sm text-blue-900">
                <strong>Unit Size:</strong> {formData.unit_size} {formData.unit}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2 border border-gray-300 hover:bg-gray-50 text-gray-900 rounded-lg font-medium transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition disabled:opacity-50"
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
