import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Package } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';

const ProductCard = ({ product, onAddToCart, cartQuantity = 0 }) => {
  const getStockColor = (stock) => {
    if (stock > 10) return 'bg-green-500 text-white';
    if (stock >= 5) return 'bg-yellow-500 text-white';
    return 'bg-red-500 text-white';
  };

  const isOutOfStock = product.currentStock <= 0;

  return (
    <Card className="group hover:shadow-lg transition-shadow duration-200 relative overflow-hidden">
      {/* Stock Badge - Top Right */}
      <Badge 
        className={`absolute top-2 right-2 z-10 ${getStockColor(product.currentStock)} border-0`}
      >
        {product.currentStock}
      </Badge>

      <CardContent className="p-3">
        {/* Product Image */}
        <div className="aspect-square mb-3 bg-muted/50 rounded-lg flex items-center justify-center overflow-hidden">
          {product.imageUrl ? (
            <img 
              src={product.imageUrl} 
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <Package className="w-12 h-12 text-muted-foreground/30" />
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-1 mb-3">
          <h3 className="font-medium text-sm line-clamp-2 min-h-[2.5rem]">
            {product.name}
          </h3>
          <p className="text-base font-semibold text-green-600">
            {formatCurrency(product.price)}
          </p>
        </div>

        {/* Add Button */}
        <Button
          className="w-full"
          size="sm"
          onClick={() => onAddToCart(product)}
          disabled={isOutOfStock}
          variant={isOutOfStock ? "secondary" : "default"}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
