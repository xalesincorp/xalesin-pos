import { memo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  CreditCard,
  Receipt,
  AlertCircle
} from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const SummaryOrder = memo(({ 
  cartItems = [], 
  onUpdateQuantity, 
  onRemoveItem, 
  onCheckout,
  onClearCart 
}) => {
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.price * item.quantity), 
    0
  );
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    
    setIsProcessing(true);
    try {
      await onCheckout();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearCart = () => {
    onClearCart();
    setShowClearDialog(false);
  };

  return (
    <>
      <Card className="flex flex-col h-full shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Keranjang
            </CardTitle>
            {totalItems > 0 && (
              <Badge variant="secondary" className="text-sm font-semibold">
                {totalItems} Item
              </Badge>
            )}
          </div>
        </CardHeader>

        <Separator />

        {/* Cart Items */}
        <CardContent className="flex-1 p-0">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <ShoppingCart className="w-16 h-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground font-medium">
                Keranjang masih kosong
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Tambahkan produk untuk memulai
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[calc(100vh-28rem)]">
              <div className="p-4 space-y-3">
                {cartItems.map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    <CardContent className="p-3">
                      <div className="flex gap-3">
                        {/* Product Image */}
                        <div className="w-16 h-16 rounded-md bg-muted flex-shrink-0 overflow-hidden">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Receipt className="w-6 h-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm line-clamp-1" title={item.name}>
                            {item.name}
                          </h4>
                          <p className="text-sm text-primary font-semibold mt-1">
                            {formatCurrency(item.price)}
                          </p>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2 mt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                              className="h-7 w-7 p-0"
                              aria-label="Kurangi jumlah"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            
                            <span className="font-semibold text-sm min-w-[2rem] text-center">
                              {item.quantity}
                            </span>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                              disabled={item.quantity >= item.stock}
                              className="h-7 w-7 p-0"
                              aria-label="Tambah jumlah"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onRemoveItem(item.id)}
                              className="h-7 w-7 p-0 ml-auto text-destructive hover:text-destructive hover:bg-destructive/10"
                              aria-label="Hapus item"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>

                          {/* Stock Warning */}
                          {item.quantity >= item.stock && (
                            <div className="flex items-center gap-1 mt-1 text-xs text-warning">
                              <AlertCircle className="w-3 h-3" />
                              <span>Stok maksimal</span>
                            </div>
                          )}
                        </div>

                        {/* Item Total */}
                        <div className="text-right">
                          <p className="font-bold text-sm">
                            {formatCurrency(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>

        {/* Summary Footer */}
        {cartItems.length > 0 && (
          <>
            <Separator />
            <CardFooter className="flex-col p-4 space-y-4">
              {/* Price Breakdown */}
              <div className="w-full space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Pajak (10%)</span>
                  <span className="font-medium">{formatCurrency(tax)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">{formatCurrency(total)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="w-full space-y-2">
                <Button
                  onClick={handleCheckout}
                  disabled={isProcessing}
                  className="w-full h-11 text-base font-semibold"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Checkout
                    </>
                  )}
                </Button>

                <Button
                  onClick={() => setShowClearDialog(true)}
                  variant="outline"
                  className="w-full"
                  disabled={isProcessing}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Kosongkan Keranjang
                </Button>
              </div>
            </CardFooter>
          </>
        )}
      </Card>

      {/* Clear Cart Confirmation Dialog */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kosongkan Keranjang?</AlertDialogTitle>
            <AlertDialogDescription>
              Semua item dalam keranjang akan dihapus. Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearCart} className="bg-destructive hover:bg-destructive/90">
              Ya, Kosongkan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
});

SummaryOrder.displayName = 'SummaryOrder';

export default SummaryOrder;