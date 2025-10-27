import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCashierStore } from '@/stores/cashierStore';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import ProductGrid from '@/components/cashier/ProductGrid';
import SummaryOrder from '@/components/cashier/SummaryOrder';
import EmptyState from '@/components/common/EmptyState';
import { Bell, Lock, Grid3x3, ChevronLeft, Search } from 'lucide-react';
import { toast } from 'sonner';

const Cashier = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { isOnline } = useUIStore();
  const {
    products,
    cartItems,
    isLoading,
    fetchProducts,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    saveOrder,
    checkout
  } = useCashierStore();

  const [searchQuery, setSearchQuery] = useState('');

  // Fetch products on mount
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Filtered products with memoization
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;

    const query = searchQuery.toLowerCase();
    return products.filter(product =>
      product.name.toLowerCase().includes(query) ||
      product.sku?.toLowerCase().includes(query) ||
      product.category?.toLowerCase().includes(query)
    );
  }, [products, searchQuery]);

  // Memoized handlers
  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
  }, []);

  const handleResetSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  const handleAddToCart = useCallback((product, quantityChange = 1) => {
    const currentItem = cartItems.find(item => item.id === product.id);
    const currentQuantity = currentItem ? currentItem.quantity : 0;
    const newQuantity = currentQuantity + quantityChange;

    if (newQuantity <= 0) {
      removeFromCart(product.id);
      toast.success(`${product.name} dihapus dari keranjang`);
      return;
    }

    if (newQuantity > product.stock) {
      toast.error('Stok tidak mencukupi');
      return;
    }

    addToCart(product);
    
    if (quantityChange > 0) {
      toast.success(`${product.name} ditambahkan ke keranjang`);
    }
  }, [cartItems, addToCart, removeFromCart]);

  const handleUpdateQuantity = useCallback((productId, newQuantity) => {
    const product = products.find(p => p.id === productId);
    
    if (newQuantity <= 0) {
      removeFromCart(productId);
      toast.success('Item dihapus dari keranjang');
      return;
    }

    if (newQuantity > product.stock) {
      toast.error('Stok tidak mencukupi');
      return;
    }

    updateCartQuantity(productId, newQuantity);
  }, [products, updateCartQuantity, removeFromCart]);

  const handleRemoveItem = useCallback((productId) => {
    removeFromCart(productId);
    toast.success('Item dihapus dari keranjang');
  }, [removeFromCart]);

  const handleSaveOrder = useCallback(async () => {
    try {
      await saveOrder();
      toast.success('Order berhasil disimpan');
    } catch (error) {
      toast.error('Gagal menyimpan order', {
        description: error.message
      });
    }
  }, [saveOrder]);

  const handleCheckout = useCallback(async (data) => {
    try {
      await checkout(data);
      toast.success('Transaksi berhasil!', {
        description: 'Terima kasih atas pembelian Anda'
      });
    } catch (error) {
      toast.error('Checkout gagal', {
        description: error.message || 'Silakan coba lagi'
      });
    }
  }, [checkout]);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="sticky top-0 z-40 border-b bg-background">
            <div className="flex h-14 items-center gap-4 px-4">
              <SidebarTrigger>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </SidebarTrigger>

              <div className="flex items-center gap-2">
                <div className="text-sm font-semibold">POS</div>
                <div className="text-xs text-muted-foreground">Offline System</div>
              </div>

              <Badge 
                variant={isOnline ? "default" : "secondary"} 
                className="ml-2"
              >
                <div className={`w-2 h-2 rounded-full mr-2 ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                {isOnline ? 'Online' : 'Offline'}
              </Badge>

              <div className="flex-1 max-w-md mx-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8 relative">
                  <Bell className="h-4 w-4" />
                  <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Lock className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Grid3x3 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            <div className="flex gap-4 p-4 h-full">
              {/* Products Section */}
              <div className="flex-1 space-y-4">
                {isLoading ? (
                  <ProductGrid isLoading={true} />
                ) : filteredProducts.length > 0 ? (
                  <ProductGrid
                    products={filteredProducts}
                    onAddToCart={handleAddToCart}
                    cartItems={cartItems}
                  />
                ) : (
                  <EmptyState
                    type={searchQuery ? 'search' : 'empty'}
                    searchTerm={searchQuery}
                    onReset={searchQuery ? handleResetSearch : undefined}
                  />
                )}
              </div>

              {/* Order Summary Section */}
              <div className="w-[380px]">
                <SummaryOrder
                  cartItems={cartItems}
                  onUpdateQuantity={handleUpdateQuantity}
                  onRemoveItem={handleRemoveItem}
                  onCheckout={handleCheckout}
                  onSaveOrder={handleSaveOrder}
                />
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Cashier;