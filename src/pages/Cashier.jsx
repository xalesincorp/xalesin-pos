import { useState, useEffect } from 'react';
import { useCashierStore } from '@/stores/cashierStore';
import { useUIStore } from '@/stores/uiStore';
import { db } from '@/db/database';
import { toast } from 'sonner';
import Header from '@/components/layout/Header';
import ProductGrid from '@/components/cashier/ProductGrid';
import SummaryOrder from '@/components/cashier/SummaryOrder';
import SearchBar from '@/components/common/SearchBar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Cashier = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const {
    cart,
    customer,
    discount,
    addToCart,
    updateCartItemQty,
    removeFromCart,
  } = useCashierStore();

  const { setLocked } = useUIStore();

  // Load products and categories from database
  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadProducts = async () => {
    try {
      const allProducts = await db.products
        .where('deletedAt')
        .equals(null)
        .toArray();
      setProducts(allProducts);
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Gagal memuat produk');
    }
  };

  const loadCategories = async () => {
    try {
      const allCategories = await db.categories
        .where('deletedAt')
        .equals(null)
        .toArray();
      setCategories(allCategories);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleProductClick = (product) => {
    // Check if product has stock (if monitoring is enabled)
    if (product.monitorStock) {
      const stock = product.type === 'recipe_goods' 
        ? product.calculatedStock 
        : product.currentStock;
      
      if (stock <= 0) {
        toast.error(`${product.name} sedang tidak tersedia`);
        return;
      }
    }

    addToCart(product);
    toast.success(`${product.name} ditambahkan ke keranjang`);
  };

  const handleUpdateQty = (id, newQty) => {
    if (newQty < 1) return;
    updateCartItemQty(id, newQty);
  };

  const handleRemoveItem = (id) => {
    const item = cart.find(c => c.id === id);
    if (item?.locked) {
      toast.error('Tidak dapat menghapus item yang sudah tersimpan');
      return;
    }
    removeFromCart(id);
    toast.success('Item dihapus dari keranjang');
  };

  const handleSelectCustomer = () => {
    toast.info('Fitur pilih pelanggan akan segera tersedia');
  };

  const handleSaveOrder = () => {
    toast.info('Fitur simpan order akan segera tersedia');
  };

  const handleCheckout = () => {
    toast.info('Fitur checkout akan segera tersedia');
  };

  const handleLockScreen = () => {
    setLocked(true);
    toast.info('Layar dikunci. Fitur unlock akan segera tersedia');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header onLockScreen={handleLockScreen} />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Search and Filters */}
          <div className="p-4 border-b space-y-3">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Cari produk (nama atau SKU)..."
            />
            
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
              <TabsList className="w-full justify-start overflow-x-auto">
                <TabsTrigger value="all">Semua</TabsTrigger>
                {categories.map((category) => (
                  <TabsTrigger key={category.id} value={category.id}>
                    {category.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {/* Product Grid */}
          <div className="flex-1 overflow-hidden">
            <ProductGrid
              products={products}
              onProductClick={handleProductClick}
              searchQuery={searchQuery}
              selectedCategory={selectedCategory}
            />
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="w-96 border-l hidden lg:block">
          <SummaryOrder
            cart={cart}
            customer={customer}
            discount={discount}
            tax={{ enabled: false, rate: 0, timing: 'after_discount' }}
            onUpdateQty={handleUpdateQty}
            onRemoveItem={handleRemoveItem}
            onSelectCustomer={handleSelectCustomer}
            onSaveOrder={handleSaveOrder}
            onCheckout={handleCheckout}
          />
        </div>
      </div>
    </div>
  );
};

export default Cashier;
