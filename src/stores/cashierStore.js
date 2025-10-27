import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/integrations/supabase/client';
import { generateUUID } from '@/utils/uuid';

export const useCashierStore = create(
  persist(
    (set, get) => ({
      products: [],
      cartItems: [],
      transactions: [],
      isLoading: false,
      error: null,

      // Fetch products from Supabase
      fetchProducts: async () => {
        set({ isLoading: true, error: null });

        try {
          const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('name', { ascending: true });

          if (error) throw error;

          set({
            products: data || [],
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

      // Add product to cart
      addToCart: (product) => {
        const { cartItems } = get();
        const existingItem = cartItems.find(item => item.id === product.id);

        if (existingItem) {
          // Increment quantity
          set({
            cartItems: cartItems.map(item =>
              item.id === product.id
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
                ...product,
                quantity: 1,
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
            cartItems: cartItems.filter(item => item.id !== productId),
          });
        } else {
          // Update quantity
          set({
            cartItems: cartItems.map(item =>
              item.id === productId
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
          cartItems: cartItems.filter(item => item.id !== productId),
        });
      },

      // Clear cart
      clearCart: () => {
        set({ cartItems: [] });
      },

      // Checkout
      checkout: async () => {
        const { cartItems, transactions } = get();

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
          const tax = subtotal * 0.1;
          const total = subtotal + tax;

          // Create transaction
          const transaction = {
            id: generateUUID(),
            items: cartItems,
            subtotal,
            tax,
            total,
            timestamp: new Date().toISOString(),
          };

          // Save to Supabase
          const { error } = await supabase
            .from('transactions')
            .insert({
              id: transaction.id,
              items: transaction.items,
              subtotal: transaction.subtotal,
              tax: transaction.tax,
              total: transaction.total,
            });

          if (error) throw error;

          // Update local state
          set({
            transactions: [transaction, ...transactions],
            cartItems: [],
            isLoading: false,
          });

          // Update product stock
          for (const item of cartItems) {
            const { error: stockError } = await supabase
              .from('products')
              .update({ stock: item.stock - item.quantity })
              .eq('id', item.id);

            if (stockError) {
              console.error('Stock update error:', stockError);
            }
          }

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
        transactions: state.transactions,
      }),
    }
  )
);