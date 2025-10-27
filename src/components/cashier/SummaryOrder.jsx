import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ShoppingCart, Plus, Minus, X, Save, Users } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';
import { useState } from 'react';

const SummaryOrder = ({
  cartItems = [],
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  onSaveOrder
}) => {
  const [discount, setDiscount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.1; // 10% tax
  const discountAmount = (subtotal * discount) / 100;
  const total = subtotal + tax - discountAmount;
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = async () => {
    setIsProcessing(true);
    try {
      await onCheckout({ discount: discountAmount });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveOrder = async () => {
    setIsProcessing(true);
    try {
      await onSaveOrder();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 space-y-3">
        <CardTitle className="text-lg">Ringkasan Order</CardTitle>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" className="w-full gap-2">
            <Save className="w-4 h-4" />
            Daftar Order
          </Button>
          <Button variant="outline" size="sm" className="w-full gap-2">
            <Users className="w-4 h-4" />
            Pilih Pelanggan
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden px-4">
        {cartItems.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-8">
            <ShoppingCart className="w-16 h-16 text-muted-foreground/30 mb-4" />
            <p className="text-sm text-muted-foreground">
              Keranjang masih kosong
            </p>
          </div>
        ) : (
          <ScrollArea className="h-full pr-2">
            <div className="space-y-2">
              {cartItems.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center gap-2 p-2 rounded-lg border bg-card"
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm line-clamp-1">
                      {item.name}
                    </h4>
                    <p className="text-xs text-green-600 font-medium">
                      {formatCurrency(item.price)}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-6 w-6"
                      onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    
                    <span className="w-6 text-center font-medium text-sm">
                      {item.quantity}
                    </span>
                    
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-6 w-6"
                      onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>

                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => onRemoveItem(item.productId)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>

      <CardFooter className="flex-col gap-3 pt-3">
        <Separator />
        
        {/* Discount Input */}
        <div className="w-full space-y-2">
          <Label htmlFor="discount" className="text-xs text-muted-foreground">
            Diskon (%)
          </Label>
          <Input
            id="discount"
            type="number"
            min="0"
            max="100"
            value={discount}
            onChange={(e) => setDiscount(Math.min(100, Math.max(0, Number(e.target.value))))}
            className="h-9"
            placeholder="0"
          />
        </div>

        <div className="w-full space-y-1.5 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Tax (10%)</span>
            <span>{formatCurrency(tax)}</span>
          </div>
          <Separator />
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span className="text-green-600">{formatCurrency(total)}</span>
          </div>
        </div>

        <div className="w-full grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            className="w-full"
            onClick={handleSaveOrder}
            disabled={cartItems.length === 0 || isProcessing}
          >
            Simpan Order
          </Button>

          <Button
            className="w-full bg-green-600 hover:bg-green-700"
            onClick={handleCheckout}
            disabled={cartItems.length === 0 || isProcessing}
          >
            {isProcessing ? 'Memproses...' : 'Checkout'}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default SummaryOrder;
