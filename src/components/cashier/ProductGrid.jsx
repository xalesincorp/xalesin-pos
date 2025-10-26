import { useMemo } from 'react';
import ProductCard from './ProductCard';
import { ScrollArea } from '@/components/ui/scroll-area';
import EmptyState from '../common/EmptyState';
import { Package } from 'lucide-react';

const ProductGrid = ({ products, onProductClick, searchQuery, selectedCategory }) => {
  const filteredProducts = useMemo(() => {
    let filtered = products.filter(p => !p.deletedAt);

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.sku?.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.categoryId === selectedCategory);
    }

    return filtered;
  }, [products, searchQuery, selectedCategory]);

  if (filteredProducts.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <EmptyState
          icon={Package}
          title="Tidak ada produk"
          description={
            searchQuery
              ? 'Tidak ditemukan produk yang sesuai dengan pencarian'
              : 'Belum ada produk ditambahkan'
          }
        />
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 p-4">
        {filteredProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onClick={onProductClick}
          />
        ))}
      </div>
    </ScrollArea>
  );
};

export default ProductGrid;
