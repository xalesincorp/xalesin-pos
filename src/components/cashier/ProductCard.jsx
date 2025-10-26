import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { getStockColor, getStockBadgeVariant, formatCurrency } from '@/utils/formatters';
import { Package } from 'lucide-react';

const ProductCard = ({ product, onClick }) => {
  const stock = product.type === 'recipe_goods' 
    ? product.calculatedStock 
    : product.currentStock;

  const stockColor = getStockColor(stock);
  const stockVariant = getStockBadgeVariant(stock);

  return (
    <Card
      className="relative overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:scale-105 h-full"
      onClick={() => onClick(product)}
    >
      {/* Stock Badge - Top Left */}
      <div className="absolute top-2 left-2 z-10">
        <Badge variant={stockVariant} className="font-medium">
          {stock}
        </Badge>
      </div>

      {/* Product Image */}
      <div className="aspect-square bg-muted flex items-center justify-center overflow-hidden">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <Package className="w-16 h-16 text-muted-foreground" />
        )}
      </div>

      {/* Product Info */}
      <div className="p-3">
        <h3 className="font-medium text-sm line-clamp-2 min-h-[2.5rem]">
          {product.name}
        </h3>
        <p className="text-lg font-bold text-primary mt-1">
          {formatCurrency(product.price)}
        </p>
        {product.sku && (
          <p className="text-xs text-muted-foreground mt-1">
            SKU: {product.sku}
          </p>
        )}
      </div>
    </Card>
  );
};

export default ProductCard;
