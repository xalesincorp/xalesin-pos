import { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Minus, Package } from 'lucide-react';
import { formatCurrency, getStockBadgeVariant } from '@/utils/formatters';

const ProductCard = memo(({ 
  product, 
  onAddToCart, 
  cartQuantity = 0 
}) => {
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  const handleAdd = () => {
    if (!isOutOfStock) {
      onAddToCart(product);
    }
  };

  const handleRemove = () => {
    if (cartQuantity > 0) {
      onAddToCart(product, -1);
    }
  };

  return (
    <Card 
      className={`group relative overflow-hidden transition-all duration-200 hover:shadow-md ${
        isOutOfStock ? 'opacity-60' : 'hover:scale-[1.02]'
      }`}
    >
      <CardContent className="p-4">
        {/* Stock Badge */}
        <div className="absolute top-2 right-2 z-10">
          <Badge 
            variant={getStockBadgeVariant(product.stock)}
            className="text-xs font-medium"
          >
            <Package className="w-3 h-3 mr-1" />
            {product.stock}
          </Badge>
        </div>

        {/* Product Image */}
        <div className="aspect-square mb-3 rounded-lg bg-muted overflow-hidden">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-12 h-12 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-2">
          <h3 
            className="font-semibold text-sm line-clamp-2 min-h-[2.5rem]"
            title={product.name}
          >
            {product.name}
          </h3>
          
          <div className="flex items-baseline justify-between">
            <p className="text-lg font-bold text-primary">
              {formatCurrency(product.price)}
            </p>
            {product.sku && (
              <p className="text-xs text-muted-foreground">
                SKU: {product.sku}
              </p>
            )}
          </div>

          {/* Add to Cart Controls */}
          {cartQuantity > 0 ? (
            <div className="flex items-center justify-between gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRemove}
                className="h-9 w-9 p-0"
                aria-label="Kurangi jumlah"
              >
                <Minus className="h-4 w-4" />
              </Button>
              
              <span className="font-semibold text-base min-w-[2rem] text-center">
                {cartQuantity}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleAdd}
                disabled={isOutOfStock || cartQuantity >= product.stock}
                className="h-9 w-9 p-0"
                aria-label="Tambah jumlah"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              onClick={handleAdd}
              disabled={isOutOfStock}
              className="w-full h-9 text-sm font-medium"
              variant={isOutOfStock ? 'secondary' : 'default'}
            >
              {isOutOfStock ? (
                'Stok Habis'
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-1" />
                  Tambah
                </>
              )}
            </Button>
          )}

          {/* Low Stock Warning */}
          {isLowStock && !isOutOfStock && (
            <p className="text-xs text-warning text-center pt-1">
              Stok terbatas!
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;