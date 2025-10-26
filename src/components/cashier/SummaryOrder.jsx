import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/utils/formatters';
import { Trash2, Plus, Minus, User, Save, CreditCard } from 'lucide-react';

const SummaryOrder = ({
  cart,
  customer,
  discount,
  tax,
  onUpdateQty,
  onRemoveItem,
  onSelectCustomer,
  onSaveOrder,
  onCheckout
}) => {
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  
  let discountAmount = 0;
  if (discount) {
    discountAmount = discount.type === 'percent' 
      ? (subtotal * discount.value / 100)
      : discount.value;
  }

  let taxAmount = 0;
  if (tax.enabled) {
    const taxBase = tax.timing === 'before_discount' 
      ? subtotal 
      : subtotal - discountAmount;
    taxAmount = taxBase * (tax.rate / 100);
  }

  const total = subtotal - discountAmount + taxAmount;

  return (
    <Card className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="text-lg font-bold">Ringkasan Order</h2>
        <div className="mt-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start"
            onClick={onSelectCustomer}
          >
            <User className="w-4 h-4 mr-2" />
            {customer ? customer.name : 'Pilih Pelanggan'}
          </Button>
        </div>
      </div>

      {/* Cart Items */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <p className="text-sm">Belum ada produk</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm line-clamp-2">
                      {item.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(item.price)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 flex-shrink-0"
                    onClick={() => onRemoveItem(item.id)}
                    disabled={item.locked}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onUpdateQty(item.id, item.qty - 1)}
                      disabled={item.qty <= 1}
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="w-12 text-center font-medium">
                      {item.qty}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onUpdateQty(item.id, item.qty + 1)}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                  <p className="font-bold">
                    {formatCurrency(item.price * item.qty)}
                  </p>
                </div>
                {item.locked && (
                  <Badge variant="secondary" className="text-xs">
                    Item tersimpan
                  </Badge>
                )}
                <Separator />
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Summary */}
      <div className="p-4 border-t space-y-2">
        <div className="flex justify-between text-sm">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        {discount && discountAmount > 0 && (
          <div className="flex justify-between text-sm text-success">
            <span>Diskon ({discount.type === 'percent' ? `${discount.value}%` : 'Nominal'})</span>
            <span>-{formatCurrency(discountAmount)}</span>
          </div>
        )}
        {tax.enabled && (
          <div className="flex justify-between text-sm">
            <span>Pajak ({tax.rate}%)</span>
            <span>{formatCurrency(taxAmount)}</span>
          </div>
        )}
        <Separator />
        <div className="flex justify-between font-bold text-lg">
          <span>Total</span>
          <span className="text-primary">{formatCurrency(total)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 border-t space-y-2">
        <Button
          variant="outline"
          className="w-full"
          onClick={onSaveOrder}
          disabled={cart.length === 0}
        >
          <Save className="w-4 h-4 mr-2" />
          Simpan Order
        </Button>
        <Button
          className="w-full"
          onClick={onCheckout}
          disabled={cart.length === 0}
        >
          <CreditCard className="w-4 h-4 mr-2" />
          Checkout
        </Button>
      </div>
    </Card>
  );
};

export default SummaryOrder;
