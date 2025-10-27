# POS OFFLINE - TASK TO-DO LIST
## Version 1.0 - Phase 1.0 (MVP)

**Last Updated**: October 27, 2025  
**Status**: In Progress

---

## ✅ COMPLETED TASKS

### Sprint 1: Foundation (Week 1-2)
- [x] Setup project structure
- [x] Install core dependencies (Dexie, Zustand, UUID, date-fns, bcryptjs, etc.)
- [x] Database layer (Dexie.js with all schemas)
- [x] Initialize database with default settings
- [x] Create Zustand stores (authStore, cashierStore, uiStore)
- [x] UUID v7 utilities
- [x] Formatter utilities (currency, date, stock colors)
- [x] Supabase client setup
- [x] Login page with Supabase Auth integration
- [x] Session management (3-day offline)
- [x] PrivateRoute component (removed duplicate .tsx file)
- [x] Online/offline status detection
- [x] Design system (Tailwind + semantic tokens)
- [x] Fixed Vite config (React deduplication, optimizeDeps)

### Sprint 3: Cashier Core (Completed)
- [x] Header component (Notif bell, Lock, Menu, Online status, Search bar)
- [x] AppSidebar component (Navigation: Kasir, Produk, Inventory, Pelanggan, Laporan, Pengaturan)
- [x] ProductCard component (stock badge with color-coded indicators)
- [x] ProductGrid component (with search & filter)
- [x] SummaryOrder sidebar component (Daftar Order, Pilih Pelanggan, Discount input)
- [x] EmptyState component
- [x] SearchBar component
- [x] Cashier page structure with sidebar layout
- [x] Cart functionality (add/remove/update items)
- [x] Stock deduction logic (finish goods & recipe goods)
- [x] Recipe stock calculation (auto-calculate from ingredients)
- [x] Save Order functionality (lock items logic)
- [x] Load Saved Order functionality
- [x] Currency formatter (IDR format without decimals)
- [x] Online/offline status with visual indicator
- [x] Lock screen state management (uiStore)

---

## 🔴 PRIORITY 1 - CRITICAL (Sprint 2-3)

### Product Management Module
- [ ] **Create `src/services/products/productService.js`**
  - CRUD operations for products
  - Stock calculation for recipe goods
  - Validation logic
  
- [ ] **Create `src/services/products/categoryService.js`**
  - CRUD operations for categories
  
- [ ] **Create `src/services/products/recipeService.js`**
  - Recipe stock calculation logic
  - Material validation

- [ ] **Create `src/hooks/useProducts.js`**
  - Hook for product data management
  - Real-time stock updates

- [ ] **Create `src/components/products/ProductList.jsx`**
  - Product table view
  - Search, filter, sort
  - Edit/Delete actions

- [ ] **Create `src/components/products/ProductForm.jsx`**
  - Add/Edit product form
  - Image upload with compression
  - Product type selection (finish_goods/recipe_goods/raw_material)
  - UOM configuration
  
- [ ] **Create `src/components/products/RecipeBuilder.jsx`**
  - Add/remove ingredients
  - Quantity input with UOM
  - Preview calculated stock
  - Validation (check active transactions before edit)

- [ ] **Create `src/components/products/CategoryManager.jsx`**
  - Category list
  - Add/Edit/Delete categories
  
- [ ] **Create `src/components/products/UOMManager.jsx`**
  - Base unit setup
  - Conversion units configuration

- [ ] **Create `src/pages/products/ProductsPage.jsx`**
  - Main products page wrapper
  - Tab navigation (Products | Categories | UOM)

---

## 🟠 PRIORITY 2 - HIGH (Sprint 4)

### Checkout & Payment Module
- [ ] **Create `src/services/transactions/transactionService.js`**
  - Create transaction
  - Stock deduction logic (atomic)
  - Transaction number generation (TRX-YYYYMMDD-XXXX)
  - Save/Load saved orders

- [ ] **Create `src/services/transactions/paymentService.js`**
  - Payment processing
  - Change calculation
  - Multiple payment methods support

- [ ] **Create `src/services/transactions/discountService.js`**
  - Discount calculation (percent/nominal)
  - Tax calculation (before/after/included)

- [ ] **Create `src/components/cashier/CheckoutModal.jsx`**
  - Payment amount input with calculator
  - Payment method selector (Cash, E-Wallet, QRIS)
  - Change display
  - Confirmation button

- [ ] **Create `src/components/cashier/PaymentSelector.jsx`**
  - Payment method buttons
  - Multiple payment split support

- [ ] **Create `src/components/cashier/Calculator.jsx`**
  - Number pad calculator
  - Quick amount buttons (10k, 20k, 50k, 100k)
  - Clear/backspace

- [ ] **Create `src/components/cashier/SavedOrdersList.jsx`**
  - List of saved orders (Daftar Order)
  - Load order action
  - Delete saved order
  - Badge showing count

- [ ] **Create `src/components/cashier/CustomerSelector.jsx`**
  - Search customer
  - Add new customer (quick form)
  - Select customer for transaction

- [ ] **Update Cashier page**
  - Integrate CheckoutModal
  - Handle save order functionality
  - Handle load saved order (with locked items logic)
  - Implement checkout flow

---

## 🟡 PRIORITY 3 - MEDIUM (Sprint 5)

### Inventory Management Module
- [ ] **Create `src/services/inventory/stockService.js`**
  - Stock tracking
  - Stock adjustment
  - Low stock checks

- [ ] **Create `src/services/inventory/invoiceService.js`**
  - Create purchase invoice
  - Update HPP (average method)
  - Invoice number generation (INV-YYYYMMDD-XXXX)
  - Debt tracking

- [ ] **Create `src/services/inventory/opnameService.js`**
  - Stock opname operations
  - Variance calculation

- [ ] **Create `src/services/inventory/wasteService.js`**
  - Record waste stock
  - Update stock

- [ ] **Create `src/services/inventory/supplierService.js`**
  - CRUD operations for suppliers

- [ ] **Create `src/components/inventory/StockList.jsx`**
  - Stock overview table
  - Filter by product type
  - Low stock indicators

- [ ] **Create `src/components/inventory/PurchaseInvoiceForm.jsx`**
  - Supplier selection
  - Product + quantity + unit price input
  - Subtotal/Total calculation
  - Actions: BAYAR (paid) | BELI (unpaid/hutang) | BATAL (cancel)

- [ ] **Create `src/components/inventory/StockOpnameForm.jsx`**
  - Product selection
  - System stock vs Actual stock input
  - Variance display
  - Notes field

- [ ] **Create `src/components/inventory/WasteStockForm.jsx`**
  - Product selection
  - Quantity input
  - Reason field

- [ ] **Create `src/components/inventory/SupplierList.jsx`**
  - Supplier table
  - Add/Edit/Delete

- [ ] **Create `src/components/inventory/DebtPaymentModal.jsx`**
  - Unpaid invoice list
  - Payment amount input
  - Update remaining debt

- [ ] **Create `src/pages/inventory/InventoryPage.jsx`**
  - Tab navigation (Stock | Faktur Pembelian | Stok Opname | Waste | Suppliers)

---

## 🔵 PRIORITY 4 - NORMAL (Sprint 6)

### Customer Management Module
- [ ] **Create `src/services/customers/customerService.js`**
  - CRUD operations for customers
  - Customer statistics

- [ ] **Create `src/hooks/useCustomers.js`**
  - Customer data hook

- [ ] **Create `src/components/customers/CustomerList.jsx`**
  - Customer table
  - Search by name/phone
  - Filter by gender

- [ ] **Create `src/components/customers/CustomerForm.jsx`**
  - Add/Edit customer
  - Fields: Name, Phone, Gender

- [ ] **Create `src/components/customers/CustomerStats.jsx`**
  - Total transactions
  - Total spent
  - Last visit

- [ ] **Create `src/pages/customers/CustomersPage.jsx`**
  - Main customers page wrapper

### Reports Module
- [ ] **Create `src/services/reports/reportService.js`**
  - Generate reports
  - Date range filtering
  - Aggregations

- [ ] **Create `src/services/reports/closeCashierService.js`**
  - Open shift logic
  - Close shift calculation
  - Variance tracking

- [ ] **Create `src/services/reports/exportService.js`**
  - Excel export (xlsx)
  - PDF export (jsPDF + jspdf-autotable)

- [ ] **Create `src/components/reports/TransactionReport.jsx`**
  - Transaction list
  - Filter: Date range, Status, Payment method
  - Export button

- [ ] **Create `src/components/reports/SalesReport.jsx`**
  - Sales summary by date
  - Top products
  - Revenue charts

- [ ] **Create `src/components/reports/CloseCashierReport.jsx`**
  - Open shift modal (opening balance input)
  - Close shift modal (actual cash count)
  - Expected vs Actual comparison
  - Variance display
  - Transaction summary

- [ ] **Create `src/components/reports/ExportButton.jsx`**
  - Export to Excel
  - Export to PDF
  - Format selection

- [ ] **Create `src/components/reports/DateRangeFilter.jsx`**
  - Start date picker
  - End date picker
  - Quick filters (Today, This Week, This Month)

- [ ] **Create `src/pages/reports/ReportsPage.jsx`**
  - Tab navigation (Transactions | Sales | Close Cashier)

---

## 🟢 PRIORITY 5 - LOW (Sprint 6-7)

### Settings Module
- [ ] **Create `src/stores/settingsStore.js`**
  - Settings state management

- [ ] **Create `src/components/settings/ReceiptSettings.jsx`**
  - Header settings (checkboxes)
  - Body settings (checkboxes)
  - Footer settings (checkboxes + custom message)
  - Preview receipt

- [ ] **Create `src/components/settings/TaxSettings.jsx`**
  - Enable/Disable tax
  - Tax rate input
  - Tax timing selection (before_discount | after_discount | included)

- [ ] **Create `src/components/settings/AccountSettings.jsx`**
  - Change name
  - Change email
  - Change PIN
  - Change password

- [ ] **Create `src/components/settings/BusinessSettings.jsx`**
  - Business name
  - Address
  - Phone
  - Logo upload

- [ ] **Create `src/components/settings/DataHealth.jsx`**
  - Database size info
  - Archive old transactions
  - Optimize database
  - Export backup (JSON)
  - Import backup

- [ ] **Create `src/components/settings/LanguageSwitch.jsx`**
  - Language selector (ID | EN)
  - Apply to all UI

- [ ] **Create `src/pages/settings/SettingsPage.jsx`**
  - Tab navigation (Receipt | Tax | Account | Business | Data Health)

### Notifications Module
- [ ] **Create `src/services/notifications/notificationService.js`**
  - Create notification
  - Mark as read
  - Delete notification
  - Check triggers (low stock, unpaid, saved orders)

- [ ] **Create `src/hooks/useNotifications.js`**
  - Notification data hook
  - Real-time badge count

- [ ] **Create `src/components/notifications/NotificationBell.jsx`**
  - Bell icon with badge
  - Unread count display

- [ ] **Create `src/components/notifications/NotificationPanel.jsx`**
  - Dropdown list
  - Mark all as read
  - Clear all

- [ ] **Create `src/components/notifications/NotificationItem.jsx`**
  - Notification card
  - Icon based on type
  - Timestamp
  - Action button (e.g., View Product)

- [ ] **Integrate Notifications**
  - Add to Header component
  - Trigger on stock changes
  - Trigger on unpaid transactions
  - Background check for old saved orders (every 1 hour)

### Lock Screen Feature
- [ ] **Create `src/components/cashier/LockScreen.jsx`**
  - Full-screen overlay
  - PIN input (6-digit)
  - Show user info
  - Unlock validation

- [ ] **Create `src/components/common/PinInput.jsx`**
  - 6-digit PIN input
  - Masked/Unmasked toggle
  - Auto-focus

- [ ] **Update UIStore**
  - Add `isLocked` state
  - Lock/unlock actions

- [ ] **Integrate Lock Screen**
  - Trigger from Header lock button
  - Preserve cart data while locked
  - Validate PIN against user.pin (bcrypt)

---

## 🟣 PRIORITY 6 - TECHNICAL (Sprint 7)

### Printing Module
- [ ] **Install printing dependencies**
  - `escpos-buffer` or `react-thermal-printer`

- [ ] **Create `src/services/printing/printerService.js`**
  - USB printer detection
  - Connect to printer
  - Send print job

- [ ] **Create `src/services/printing/receiptFormatter.js`**
  - Generate receipt content from template
  - Apply receipt settings
  - Format text (center, left, right align)

- [ ] **Create `src/services/printing/escposAdapter.js`**
  - ESC/POS command builder
  - Init, text, cut, feed

- [ ] **Create `src/hooks/usePrinter.js`**
  - Printer connection hook
  - Print receipt function

- [ ] **Integrate Printing**
  - Print after successful payment (if autoPrint enabled)
  - Manual print button in transaction history

### PWA Setup
- [ ] **Create `public/manifest.json`**
  - App name, short name
  - Icons (192x192, 512x512)
  - Theme color, background color
  - Display: standalone
  - Start URL

- [ ] **Create PWA icons**
  - Generate 192x192 icon
  - Generate 512x512 icon
  - Place in `public/icons/`

- [ ] **Configure Service Worker**
  - Cache-first strategy for static assets
  - Network-first for API calls
  - Offline fallback page

- [ ] **Update `index.html`**
  - Add manifest link
  - Add meta tags (viewport, theme-color)

### Common Components
- [ ] **Create `src/components/common/ConfirmDialog.jsx`**
  - Reusable confirmation modal
  - Custom title, message, actions

- [ ] **Create `src/components/common/LoadingSpinner.jsx`**
  - Full-screen spinner
  - Inline spinner variants

- [ ] **Create `src/components/common/ErrorBoundary.jsx`**
  - Catch React errors
  - Display error page
  - Reload button

### Utilities & Helpers
- [ ] **Create `src/utils/constants.js`**
  - App constants
  - Payment methods
  - Product types
  - Transaction statuses

- [ ] **Create `src/utils/validators.js`**
  - Zod schemas for all forms
  - Product schema
  - Transaction schema
  - Customer schema
  - Invoice schema

- [ ] **Create `src/utils/calculations.js`**
  - Tax calculation helpers
  - Discount calculation helpers
  - HPP calculation
  - Recipe stock calculation

- [ ] **Create `src/utils/imageUtils.js`**
  - Image compression (max 200KB)
  - WebP conversion
  - Resize to 800x800px

- [ ] **Create `src/utils/dateUtils.js`**
  - Date formatting wrappers (date-fns)
  - Date range helpers
  - Transaction number date part

- [ ] **Create `src/utils/errorHandlers.js`**
  - Global error handler
  - Error logging
  - User-friendly error messages

### Additional Stores
- [ ] **Create `src/stores/productStore.js`**
  - Products cache
  - Real-time updates

- [ ] **Create `src/stores/inventoryStore.js`**
  - Inventory cache
  - Stock tracking

- [ ] **Create `src/stores/customerStore.js`**
  - Customers cache

- [ ] **Create `src/stores/settingsStore.js`**
  - App settings cache
  - Tax settings
  - Receipt settings

- [ ] **Create `src/stores/notificationStore.js`**
  - Notifications state
  - Badge count

---

## 🔬 TESTING & OPTIMIZATION

### Manual Testing Checklist
- [ ] Login/Logout (online & offline)
- [ ] Session expiry (3-day check)
- [ ] Add product (all 3 types)
- [ ] Add recipe product with materials
- [ ] Create transaction with recipe goods
- [ ] Check stock deduction (recipe materials)
- [ ] Save order → Load order → Complete
- [ ] Locked items in saved order (cannot delete)
- [ ] Checkout with multiple payment methods
- [ ] Void transaction (with PIN if kasir)
- [ ] Create purchase invoice (BAYAR/BELI)
- [ ] Check HPP update after invoice
- [ ] Stock opname with variance
- [ ] Stock waste
- [ ] Debt payment
- [ ] Open cashier shift
- [ ] Close cashier shift (with variance)
- [ ] Generate transaction report
- [ ] Export to Excel
- [ ] Export to PDF
- [ ] Print receipt (USB)
- [ ] Lock screen → Unlock with PIN
- [ ] Notifications (low stock, unpaid, saved orders)
- [ ] Offline mode (disconnect network)
- [ ] Product search & filter
- [ ] Customer management
- [ ] Settings (all tabs)
- [ ] Role-based access (Owner vs Kasir)

### Performance Optimization
- [ ] Optimize IndexedDB queries (add indexes)
- [ ] Implement virtual scrolling for large lists
- [ ] Lazy load heavy components
- [ ] Debounce search inputs (300ms)
- [ ] Memoize expensive calculations
- [ ] Code splitting by route
- [ ] Compress images on upload

### Error Handling
- [ ] Implement ErrorBoundary for all routes
- [ ] Add try-catch to all service functions
- [ ] Toast notifications for all user actions
- [ ] Validate all form inputs (Zod)
- [ ] Handle offline scenarios gracefully

---

## 🎨 UI/UX POLISH

### Design Consistency
- [ ] Review all components for semantic token usage
- [ ] Consistent spacing (4px grid)
- [ ] Consistent typography (font sizes, weights)
- [ ] Consistent button variants
- [ ] Consistent form layouts

### Loading States
- [ ] Skeleton loaders for data tables
- [ ] Shimmer effect for cards
- [ ] Spinner in buttons during actions
- [ ] Full-screen loader for page transitions

### Empty States
- [ ] Empty cart illustration
- [ ] No products found
- [ ] No transactions yet
- [ ] No customers yet
- [ ] No notifications

### Responsive Design
- [ ] Mobile layout (< 768px)
  - Hide sidebar
  - Modal for summary order
  - Single column grid
- [ ] Tablet layout (768px - 1024px)
  - Sidebar visible
  - 2-3 column grid
- [ ] Desktop layout (> 1024px)
  - Full layout
  - 4-6 column grid

### Accessibility
- [ ] Keyboard navigation for all interactive elements
- [ ] ARIA labels for icons
- [ ] Focus states for all inputs
- [ ] Screen reader friendly
- [ ] High contrast mode support

---

## 📝 DOCUMENTATION

### Code Documentation
- [ ] JSDoc comments for complex functions
- [ ] README.md with setup instructions
- [ ] .env.example file
- [ ] API documentation (if any)

### User Guide
- [ ] How to open cashier shift
- [ ] How to add products
- [ ] How to create recipe goods
- [ ] How to process transactions
- [ ] How to manage inventory
- [ ] How to generate reports
- [ ] How to close cashier shift

---

## 🚀 DEPLOYMENT PREPARATION

### Build Optimization
- [ ] Remove console.logs from production
- [ ] Minimize bundle size
- [ ] Tree-shake unused code
- [ ] Optimize images
- [ ] Enable gzip compression

### Environment Setup
- [ ] Production Supabase project
- [ ] Environment variables configuration
- [ ] HTTPS certificate (required for PWA)

### Deployment
- [ ] Deploy to Netlify/Vercel
- [ ] Test PWA install prompt
- [ ] Test offline functionality
- [ ] Test service worker caching

---

## 📊 PROGRESS SUMMARY

**Total Tasks**: ~180+  
**Completed**: ~25  
**Remaining**: ~155+  
**Progress**: ~14%

### By Priority:
- **Priority 1 (Critical)**: 15 tasks
- **Priority 2 (High)**: 12 tasks
- **Priority 3 (Medium)**: 20 tasks
- **Priority 4 (Normal)**: 25 tasks
- **Priority 5 (Low)**: 15 tasks
- **Priority 6 (Technical)**: 35 tasks
- **Testing & Polish**: 50+ tasks

---

## 🎯 NEXT STEPS (Recommended Order)

1. **Complete Product Management Module** (Priority 1)
   - ProductForm, RecipeBuilder, CategoryManager
   - Product CRUD services
   - Testing with real data

2. **Complete Checkout Flow** (Priority 2)
   - CheckoutModal, PaymentSelector, Calculator
   - Transaction services
   - Stock deduction logic

3. **Saved Orders & Customer Selection** (Priority 2)
   - SavedOrdersList component
   - CustomerSelector modal
   - Integration with Cashier page

4. **Inventory Management** (Priority 3)
   - Invoice creation
   - HPP calculation
   - Stock opname & waste

5. **Reports & Close Cashier** (Priority 4)
   - Transaction reports
   - Cashier shift management
   - Export functionality

6. **Settings & Notifications** (Priority 5)
   - All settings pages
   - Notification system
   - Lock screen

7. **Printing & PWA** (Priority 6)
   - Receipt printing
   - PWA manifest
   - Service worker

8. **Testing & Polish** (Continuous)
   - Manual testing after each module
   - Bug fixes
   - UI/UX improvements

---

**Last Updated**: October 26, 2025  
**Next Review**: After completing Priority 1 & 2 tasks
