import { create } from 'zustand';

/**
 * Cashier Store
 * Manages cart, checkout, and cashier UI state
 */
export const useCashierStore = create((set, get) => ({
  // Cart State
  cart: [], // Array of cart items: { productId, name, price, qty, locked, ... }
  customer: null, // Selected customer
  discount: { type: 'none', value: 0 }, // Discount: { type: 'percent' | 'amount' | 'none', value: number }
  notes: '', // Order notes
  
  // Saved Order State
  loadedOrderId: null, // ID of loaded saved order (for update)
  
  // UI State
  isCheckoutOpen: false, // Checkout modal state
  isLocked: false, // Lock screen state
  searchQuery: '', // Product search query
  selectedCategory: null, // Filter by category
  
  // Actions
  
  /**
   * Add product to cart
   */
  addToCart: (product) => {
    const { cart } = get();
    const existingIndex = cart.findIndex(item => item.productId === product.id);
    
    if (existingIndex >= 0) {
      // Update quantity if product already in cart
      const newCart = [...cart];
      newCart[existingIndex] = {
        ...newCart[existingIndex],
        qty: newCart[existingIndex].qty + 1
      };
      set({ cart: newCart });
    } else {
      // Add new product to cart
      set({ 
        cart: [...cart, {
          productId: product.id,
          name: product.name,
          price: product.price,
          qty: 1,
          locked: false, // Not locked by default
          image: product.image,
          type: product.type
        }]
      });
    }
  },
  
  /**
   * Update cart item quantity
   */
  updateCartQuantity: (productId, qty) => {
    const { cart } = get();
    
    if (qty <= 0) {
      // Remove item if quantity is 0
      set({ cart: cart.filter(item => item.productId !== productId) });
    } else {
      // Update quantity
      const newCart = cart.map(item => 
        item.productId === productId ? { ...item, qty } : item
      );
      set({ cart: newCart });
    }
  },
  
  /**
   * Remove item from cart (if not locked)
   */
  removeFromCart: (productId) => {
    const { cart } = get();
    const item = cart.find(i => i.productId === productId);
    
    // Check if item is locked (from saved order)
    if (item?.locked) {
      return false; // Cannot remove locked items
    }
    
    set({ cart: cart.filter(item => item.productId !== productId) });
    return true;
  },
  
  /**
   * Clear entire cart
   */
  clearCart: () => {
    set({ 
      cart: [], 
      customer: null, 
      discount: { type: 'none', value: 0 },
      notes: '',
      loadedOrderId: null
    });
  },
  
  /**
   * Load saved order into cart
   */
  loadSavedOrder: (order) => {
    // Mark existing items as locked
    const cartItems = order.items.map(item => ({
      ...item,
      locked: true // Lock items from saved order
    }));
    
    set({
      cart: cartItems,
      customer: order.customer,
      discount: order.discount || { type: 'none', value: 0 },
      notes: order.notes || '',
      loadedOrderId: order.id
    });
  },
  
  /**
   * Set customer
   */
  setCustomer: (customer) => set({ customer }),
  
  /**
   * Set discount
   */
  setDiscount: (discount) => set({ discount }),
  
  /**
   * Set notes
   */
  setNotes: (notes) => set({ notes }),
  
  /**
   * Calculate subtotal
   */
  getSubtotal: () => {
    const { cart } = get();
    return cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  },
  
  /**
   * Calculate discount amount
   */
  getDiscountAmount: (subtotal) => {
    const { discount } = get();
    
    if (discount.type === 'percent') {
      return subtotal * (discount.value / 100);
    } else if (discount.type === 'amount') {
      return discount.value;
    }
    
    return 0;
  },
  
  /**
   * Calculate total (with tax and discount from settings)
   */
  getTotal: (settings) => {
    const subtotal = get().getSubtotal();
    const discountAmount = get().getDiscountAmount(subtotal);
    
    if (!settings?.tax_settings?.enabled) {
      return subtotal - discountAmount;
    }
    
    const taxRate = settings.tax_settings.rate / 100;
    const taxTiming = settings.tax_settings.timing;
    
    if (taxTiming === 'before_discount') {
      const tax = subtotal * taxRate;
      return subtotal + tax - discountAmount;
    } else if (taxTiming === 'after_discount') {
      const afterDiscount = subtotal - discountAmount;
      const tax = afterDiscount * taxRate;
      return afterDiscount + tax;
    } else if (taxTiming === 'included') {
      // Tax already in price
      return subtotal - discountAmount;
    }
    
    return subtotal - discountAmount;
  },
  
  /**
   * Toggle checkout modal
   */
  setCheckoutOpen: (isOpen) => set({ isCheckoutOpen: isOpen }),
  
  /**
   * Lock/unlock screen
   */
  setLocked: (isLocked) => set({ isLocked }),
  
  /**
   * Set search query
   */
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  /**
   * Set selected category filter
   */
  setSelectedCategory: (categoryId) => set({ selectedCategory: categoryId })
}));
