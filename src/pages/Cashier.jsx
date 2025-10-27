import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCashierStore } from '@/stores/cashierStore';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import ProductGrid from '@/components/cashier/ProductGrid';
import SummaryOrder from '@/components/cashier/SummaryOrder';
import SearchBar from '@/components/common/SearchBar';
import EmptyState from '@/components/common/EmptyState';
import { LogOut, User, Store } from 'lucide-react';
import { toast } from 'sonner';

const Cashier = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const {
    products,
    cartItems,
    isLoading,
    fetchProducts,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
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

  const handleClearCart = useCallback(() => {
    clearCart();
    toast.success('Keranjang dikosongkan');
  }, [clearCart]);

  const handleCheckout = useCallback(async () => {
    try {
      await checkout();
      toast.success('Transaksi berhasil!', {
        description: 'Terima kasih atas pembelian Anda'
      });
    } catch (error) {
      toast.error('Checkout gagal', {
        description: error.message || 'Silakan coba lagi'
      });
    }
  }, [checkout]);

  const handleLogout = useCallback(() => {
    logout();
    toast.success('Berhasil logout');
    navigate('/login', { replace: true });
  }, [logout, navigate]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Store className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-bold">POS System</h1>
            </div>
            <Separator orientation="vertical" className="h-6" />
            <Badge variant="secondary" className="hidden sm:flex">
              Kasir
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">{user?.name || user?.email}</span>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
          {/* Products Section */}
          <div className="space-y-4">
            {/* Search Bar */}
            <SearchBar
              onSearch={handleSearch}
              placeholder="Cari produk berdasarkan nama, SKU, atau kategori..."
            />

            {/* Products Grid */}
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
          <div className="lg:sticky lg:top-20 h-fit">
            <SummaryOrder
              cartItems={cartItems}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
              onCheckout={handleCheckout}
              onClearCart={handleClearCart}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Cashier;