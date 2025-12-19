import type { Product, ProductGridProps } from '../pos.types';

// Mock data - in a real app, this would come from an API
const MOCK_PRODUCTS: Product[] = [
  { id: '1', name: 'Laptop', price: 999.99, category: 'Electronics' },
  { id: '2', name: 'Smartphone', price: 699.99, category: 'Electronics' },
  { id: '3', name: 'Headphones', price: 199.99, category: 'Accessories' },
  { id: '4', name: 'Keyboard', price: 149.99, category: 'Accessories' },
  { id: '5', name: 'Mouse', price: 59.99, category: 'Accessories' },
  { id: '6', name: 'Monitor', price: 249.99, category: 'Electronics' },
];

export const ProductGrid = ({
  onAddToCart,
  searchQuery,
  className = ''
}: ProductGridProps) => {
  const filteredProducts = MOCK_PRODUCTS.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 ${className}`}>
      {filteredProducts.map((product) => (
        <div 
          key={product.id}
          className="bg-white rounded-lg shadow-md p-4 flex flex-col hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => onAddToCart(product)}
        >
          <div className="h-32 bg-gray-200 rounded mb-3 flex items-center justify-center text-gray-500">
            {product.image ? (
              <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
            ) : (
              <span>No Image</span>
            )}
          </div>
          <h3 className="font-semibold text-lg">{product.name}</h3>
          <p className="text-gray-600 text-sm mb-2">{product.category}</p>
          <div className="mt-auto flex justify-between items-center">
            <span className="font-bold">${product.price.toFixed(2)}</span>
            <button 
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(product);
              }}
            >
              Add
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductGrid;