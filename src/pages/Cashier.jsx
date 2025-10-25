import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  ShoppingCart, 
  User, 
  Bell, 
  Lock, 
  Menu,
  Plus,
  Minus,
  Trash2,
  Save
} from 'lucide-react';

const Cashier = () => {
  const [cart, setCart] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Demo products
  const demoProducts = [
    { id: '1', name: 'Nasi Goreng', price: 25000, stock: 15, image: null },
    { id: '2', name: 'Mie Ayam', price: 20000, stock: 8, image: null },
    { id: '3', name: 'Es Teh Manis', price: 5000, stock: 30, image: null },
    { id: '4', name: 'Ayam Bakar', price: 35000, stock: 12, image: null },
    { id: '5', name: 'Soto Ayam', price: 22000, stock: 3, image: null },
    { id: '6', name: 'Jus Jeruk', price: 10000, stock: 20, image: null },
  ];

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id ? { ...item, qty: item.qty + 1 } : item
      ));
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
  };

  const updateCartQty = (productId, newQty) => {
    if (newQty <= 0) {
      setCart(cart.filter(item => item.id !== productId));
    } else {
      setCart(cart.map(item =>
        item.id === productId ? { ...item, qty: newQty } : item
      ));
    }
  };

  const getStockColor = (stock) => {
    if (stock > 10) return 'bg-stock-high text-white';
    if (stock >= 5) return 'bg-stock-medium text-white';
    return 'bg-stock-low text-white';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  return (
    <div className="flex h-screen bg-secondary">
      {/* Sidebar */}
      <aside className="w-20 bg-sidebar flex flex-col items-center py-6 space-y-6">
        <div className="w-12 h-12 bg-sidebar-primary rounded-xl flex items-center justify-center">
          <ShoppingCart className="w-6 h-6 text-sidebar-primary-foreground" />
        </div>
        <Separator className="w-12 bg-sidebar-border" />
        <button className="w-12 h-12 rounded-xl hover:bg-sidebar-accent transition-colors flex items-center justify-center">
          <Menu className="w-5 h-5 text-sidebar-foreground" />
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-background border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Cari produk..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="relative p-2 hover:bg-secondary rounded-lg transition-colors">
                <Bell className="w-5 h-5 text-foreground" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
              </button>
              <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
                <Lock className="w-5 h-5 text-foreground" />
              </button>
              <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
                <User className="w-5 h-5 text-foreground" />
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          {/* Product Grid */}
          <div className="flex-1 overflow-auto p-6">
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {demoProducts.map((product) => (
                <Card
                  key={product.id}
                  className="relative cursor-pointer hover:shadow-lg transition-all hover:scale-105 border-0"
                  onClick={() => addToCart(product)}
                >
                  <div className="aspect-square bg-gradient-to-br from-primary/10 to-primary/5 rounded-t-lg flex items-center justify-center">
                    <ShoppingCart className="w-12 h-12 text-primary/40" />
                  </div>
                  <Badge className={`absolute top-2 left-2 ${getStockColor(product.stock)}`}>
                    {product.stock}
                  </Badge>
                  <div className="p-4">
                    <h3 className="font-semibold text-base mb-2 line-clamp-2">{product.name}</h3>
                    <p className="text-primary font-bold text-lg">{formatCurrency(product.price)}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Cart Sidebar */}
          <aside className="w-96 bg-background border-l border-border flex flex-col">
            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-bold">Keranjang</h2>
              <p className="text-sm text-muted-foreground">{cart.length} item</p>
            </div>

            <div className="flex-1 overflow-auto p-6 space-y-4">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingCart className="w-16 h-16 text-muted-foreground/40 mb-4" />
                  <p className="text-muted-foreground">Keranjang masih kosong</p>
                  <p className="text-sm text-muted-foreground">Pilih produk untuk memulai</p>
                </div>
              ) : (
                cart.map((item) => (
                  <Card key={item.id} className="p-4 border-0 shadow-sm">
                    <div className="flex gap-3">
                      <div className="w-16 h-16 bg-secondary rounded-lg flex items-center justify-center flex-shrink-0">
                        <ShoppingCart className="w-6 h-6 text-primary/40" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm mb-1 truncate">{item.name}</h4>
                        <p className="text-primary font-bold text-sm">{formatCurrency(item.price)}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={() => updateCartQty(item.id, item.qty - 1)}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-8 text-center font-semibold">{item.qty}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={() => updateCartQty(item.id, item.qty + 1)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 ml-auto text-destructive hover:text-destructive"
                            onClick={() => updateCartQty(item.id, 0)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>

            <div className="p-6 border-t border-border bg-card space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">{formatCurrency(subtotal)}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="h-12" disabled={cart.length === 0}>
                  <Save className="w-4 h-4 mr-2" />
                  Simpan
                </Button>
                <Button className="h-12" disabled={cart.length === 0}>
                  Bayar
                </Button>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default Cashier;
