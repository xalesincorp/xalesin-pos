import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { db } from '@/db/database';
import { generateUUID } from '@/utils/uuid';

/**
 * Cashier Store - Offline-first using Dexie.js
 * Manages products, cart, and transactions for the POS system
 */
export const useCashierStore = create(
  persist(
    (set, get) => ({
      products: [],
      categories: [],
      cartItems: [],
      savedOrders: [],
      isLoading: false,
      error: null,

      // Fetch products from IndexedDB
      fetchProducts: async () => {
        set({ isLoading: true, error: null });

        try {
          // Fetch all products and filter for non-deleted ones
          const allProducts = await db.products.toArray();
          const products = allProducts.filter(p => !p.deletedAt);

          // Calculate stock for recipe goods
          const productsWithStock = await Promise.all(
            products.map(async (product) => {
              if (product.type === 'recipe_goods' && product.recipe) {
                const calculatedStock = await calculateRecipeStock(product);
                return { ...product, currentStock: calculatedStock };
              }
              return product;
            })
          );

          set({
            products: productsWithStock,
            isLoading: false,
          });
        } catch (error) {
          console.error('Fetch products error:', error);
          set({
            error: error.message || 'Gagal memuat produk',
            isLoading: false,
          });
        }
      },

      // Fetch categories from IndexedDB
      fetchCategories: async () => {
        try {
          const allCategories = await db.categories.toArray();
          const categories = allCategories.filter(c => !c.deletedAt);

          set({ categories });
        } catch (error) {
          console.error('Fetch categories error:', error);
        }
      },

      // Add product to cart
      addToCart: (product) => {
        const { cartItems } = get();
        const existingItem = cartItems.find(item => item.productId === product.id);

        if (existingItem) {
          // Increment quantity
          set({
            cartItems: cartItems.map(item =>
              item.productId === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            ),
          });
        } else {
          // Add new item
          set({
            cartItems: [
              ...cartItems,
              {
                productId: product.id,
                name: product.name,
                price: product.price,
                quantity: 1,
                locked: false, // Not locked by default
                type: product.type,
                recipe: product.recipe,
              },
            ],
          });
        }
      },

      // Update cart item quantity
      updateCartQuantity: (productId, newQuantity) => {
        const { cartItems } = get();

        if (newQuantity <= 0) {
          // Remove item if quantity is 0 or less
          set({
            cartItems: cartItems.filter(item => item.productId !== productId),
          });
        } else {
          // Update quantity
          set({
            cartItems: cartItems.map(item =>
              item.productId === productId
                ? { ...item, quantity: newQuantity }
                : item
            ),
          });
        }
      },

      // Remove item from cart
      removeFromCart: (productId) => {
        const { cartItems } = get();
        set({
          cartItems: cartItems.filter(item => item.productId !== productId),
        });
      },

      // Clear cart
      clearCart: () => {
        set({ cartItems: [] });
      },

      // Save order (to Daftar Order)
      saveOrder: async (customerName = null) => {
        const { cartItems } = get();

        if (cartItems.length === 0) {
          throw new Error('Keranjang kosong');
        }

        try {
          const orderId = generateUUID();
          const order = {
            id: orderId,
            status: 'saved',
            items: cartItems.map(item => ({ ...item, locked: true })), // Lock all items
            customerName,
            savedAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          // Save to IndexedDB
          await db.transactions.add(order);

          // Clear cart
          set({ cartItems: [] });

          return order;
        } catch (error) {
          console.error('Save order error:', error);
          throw error;
        }
      },

      // Load saved order to cart
      loadSavedOrder: async (orderId) => {
        try {
          const order = await db.transactions.get(orderId);

          if (!order) {
            throw new Error('Order tidak ditemukan');
          }

          // Load items to cart (preserve locked status)
          set({ cartItems: order.items });

          return order;
        } catch (error) {
          console.error('Load saved order error:', error);
          throw error;
        }
      },

      // Checkout
      checkout: async (paymentData) => {
        const { cartItems } = get();

        if (cartItems.length === 0) {
          throw new Error('Keranjang kosong');
        }

        set({ isLoading: true, error: null });

        try {
          // Calculate totals
          const subtotal = cartItems.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          );

          // Apply tax and discount based on settings
          // TODO: Get settings from settingsStore
          const tax = subtotal * 0.1; // 10% default
          const discount = 0; // TODO: Apply discount logic
          const total = subtotal + tax - discount;

          // Create transaction
          const transactionId = generateUUID();
          const transaction = {
            id: transactionId,
            transactionNumber: `TRX-${Date.now()}`,
            status: paymentData.status || 'paid', // 'paid' or 'unpaid'
            items: cartItems,
            subtotal,
            tax,
            discount,
            total,
            payments: paymentData.payments || [],
            customerName: paymentData.customerName,
            createdAt: new Date(),
            updatedAt: new Date(),
            paidAt: paymentData.status === 'paid' ? new Date() : null,
          };

          // Save transaction to IndexedDB
          await db.transactions.add(transaction);

          // Deduct stock for paid transactions
          if (transaction.status === 'paid') {
            await deductStock(cartItems);
          }

          // Clear cart
          set({
            cartItems: [],
            isLoading: false,
          });

          // Refresh products
          await get().fetchProducts();

          return transaction;
        } catch (error) {
          console.error('Checkout error:', error);
          set({
            error: error.message || 'Checkout gagal',
            isLoading: false,
          });
          throw error;
        }
      },

      // Get cart total
      getCartTotal: () => {
        const { cartItems } = get();
        return cartItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
      },

      // Get cart item count
      getCartItemCount: () => {
        const { cartItems } = get();
        return cartItems.reduce((sum, item) => sum + item.quantity, 0);
      },

      // Clear error
      clearError: () => set({ error: null }),
    }),
    {
      name: 'cashier-storage',
      partialize: (state) => ({
        cartItems: state.cartItems,
      }),
    }
  )
);

/**
 * Calculate stock for recipe goods
 * Returns the minimum possible portions based on ingredient availability
 */
async function calculateRecipeStock(product) {
  if (!product.recipe || product.recipe.length === 0) {
    return 0;
  }

  try {
    const materialStocks = await Promise.all(
      product.recipe.map(async (ingredient) => {
        const material = await db.products.get(ingredient.materialId);
        if (!material) return 0;
        return Math.floor(material.currentStock / ingredient.qty);
      })
    );

    return Math.min(...materialStocks);
  } catch (error) {
    console.error('Calculate recipe stock error:', error);
    return 0;
  }
}

/**
 * Deduct stock after payment
 * Handles both finish goods and recipe goods
 */
async function deductStock(cartItems) {
  for (const item of cartItems) {
    const product = await db.products.get(item.productId);

    if (!product) continue;

    if (product.type === 'finish_goods' || product.type === 'raw_material') {
      // Direct deduction
      await db.products.update(product.id, {
        currentStock: product.currentStock - item.quantity,
        updatedAt: new Date(),
      });
    } else if (product.type === 'recipe_goods' && product.recipe) {
      // Deduct each ingredient
      for (const ingredient of product.recipe) {
        const material = await db.products.get(ingredient.materialId);
        if (material) {
          await db.products.update(material.id, {
            currentStock: material.currentStock - (ingredient.qty * item.quantity),
            updatedAt: new Date(),
          });
        }
      }
    }
  }
}