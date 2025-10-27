# MASTER PROMPT: POS OFFLINE SYSTEM DEVELOPMENT

## 🎯 PROJECT OVERVIEW

You are tasked with building a **fully functional offline-first Point of Sale (POS) System** as a Progressive Web App (PWA). This system is designed for UMKM (small-medium businesses) in Indonesia, focusing on F&B, retail, and service-based industries.

### Primary Objectives
1. **Minimize internet dependency**: System must work 100% offline after initial login
2. **Data integrity**: Ensure accurate stock tracking, HPP calculation, and transaction records
3. **User experience**: Fast, intuitive, and reliable cashier workflow
4. **Scalability**: Clean architecture for future online sync (Version 2.0)

### Version Scope
**Current**: Version 1.0 - Phase 1.0 (MVP)
**Future**: Version 2.0 (Online sync with Supabase, multi-device, multi-outlet)

---

## 📐 ARCHITECTURE REFERENCE

**CRITICAL**: You have been provided with a complete **File Architecture & Tech Stack document**. This document is your **SOURCE OF TRUTH** for:
- Folder structure
- Tech stack decisions
- Database schemas
- Component specifications
- Business logic rules
- UI/UX guidelines

**Always refer to the Architecture document before implementing any feature.**

---

## 🛠️ TECH STACK (NON-NEGOTIABLE)

### Core Framework
- **React 18.x** (Create React App)
- **JavaScript ES6+** (NO TypeScript in Phase 1.0)
- **React Router v6** for navigation

### State Management
- **Zustand 4.x** (lightweight, perfect for offline-first)
- **Why NOT Redux**: Too much boilerplate for this use case
- **Why NOT Context API**: Performance issues with frequent updates

### Database
- **IndexedDB** via **Dexie.js 3.x**
- **UUID v7** for all primary keys (time-sortable, sync-ready)
- **Soft delete** for all master data (products, customers, suppliers)

### UI Layer
- **shadcn/ui** (Radix UI primitives) + **Tailwind CSS 3.x**
- **lucide-react** for icons
- **react-hot-toast** for notifications

### Authentication
- **Supabase Auth** (online required for initial login)
- **Session management**: 3-day offline grace period

### Printing
- **escpos-buffer** or **react-thermal-printer** for USB printers
- **Phase 1.0 ONLY**: USB support (Bluetooth & Network in Phase 1.5)

### Exports
- **xlsx** (SheetJS) for Excel export
- **jsPDF + jspdf-autotable** for PDF export

### Image Handling
- **browser-image-compression** for client-side compression
- **Canvas API** for WebP conversion
- **Max size**: 200KB, 800x800px

---

## 🗄️ DATABASE DESIGN PRINCIPLES

### Schema Rules
1. **Every table MUST have**:
   - `id` (String, UUID v7)
   - `createdAt` (Date)
   - `updatedAt` (Date)
   - `deletedAt` (Date | null) for soft delete

2. **Master data tables MUST have**:
   - `createdBy` (String, user.id)
   - Soft delete support

3. **Audit trail**: Log who created/updated/deleted (via `createdBy`, `updatedBy`, `deletedBy`)

### Indexing Strategy
```javascript
// Dexie.js schema example
db.version(1).stores({
  products: 'id, name, categoryId, type, [deletedAt+name]', // Composite index
  transactions: 'id, transactionNumber, customerId, status, createdAt',
  customers: 'id, name, phone, [deletedAt+name]'
});
```

### Data Integrity Rules
- **Foreign keys**: Validate existence before insert
- **Stock updates**: Use transactions (atomic operations)
- **HPP calculation**: Update after every invoice
- **Recipe stock**: Recalculate on material stock change

---

## 🎨 UI/UX MANDATORY REQUIREMENTS

### Design System
- **Color scheme**: Modern, high-contrast, accessible
  - Primary: Black (#000000)
  - Secondary: Blue (#3B82F6)
  - Success: Green (#10B981)
  - Warning: Amber (#F59E0B)
  - Danger: Red (#EF4444)

- **Typography**: Inter or SF Pro
  - Headings: Bold (700)
  - Body: Regular (400), Medium (500)
  - Currency: Tabular figures

### Component Standards
1. **Buttons**:
   - Min height: 44px (touch-friendly)
   - Loading state: Spinner + disabled
   - Variants: Primary (solid), Secondary (outline), Ghost (text)

2. **Inputs**:
   - Floating labels OR top labels (consistent)
   - Error state: Red border + error message below
   - Disabled state: Gray background + cursor not-allowed

3. **Tables**:
   - Sticky header
   - Striped rows (alternating bg)
   - Hover state (highlight row)
   - Empty state (illustration + message)

4. **Modals**:
   - Centered, max-width 600px
   - Backdrop blur
   - Close button (top-right)
   - Footer with action buttons (right-aligned)

5. **Toast Notifications**:
   - Position: Top-right
   - Auto-dismiss: 3-5 seconds
   - Types: Success, Error, Warning, Info

### Responsive Breakpoints
- **< 768px**: Mobile layout (single column, modals fullscreen)
- **768px - 1024px**: Tablet (sidebar visible, 2-3 column grid)
- **> 1024px**: Desktop (full layout, 4-6 column grid)

### Loading States
- **Page load**: Full-screen spinner
- **Data fetch**: Skeleton loaders (shimmer effect)
- **Button action**: Spinner inside button + disabled

### Error States
- **Form validation**: Inline errors below input
- **API errors**: Toast notification
- **Critical errors**: Error boundary page with retry button

---

## 💼 BUSINESS LOGIC RULES (CRITICAL)

### 1. Product Management

#### Product Types
- **Finish Goods**: Physical products with direct stock tracking
- **Recipe Goods**: Products made from raw materials (auto-deduct on sale)
- **Raw Material**: Ingredients used in recipes

#### Stock Calculation
```javascript
// Finish Goods & Raw Material
currentStock = direct tracking (updated on invoice, opname, waste)

// Recipe Goods
calculatedStock = Math.floor(
  Math.min(...recipe.map(ingredient => 
    getMaterial(ingredient.id).currentStock / ingredient.qty
  ))
)

// Display on Product Card (top-left badge)
<Badge color={getStockColor(calculatedStock)}>
  {calculatedStock}
</Badge>

function getStockColor(stock) {
  if (stock > 10) return 'green';
  if (stock >= 5) return 'yellow';
  return 'red';
}
```

#### Stock Restriction (Settings)
```javascript
// Setting: stock_restriction_enabled (Boolean)
if (settings.stock_restriction_enabled) {
  // Block checkout if any product out of stock
  if (cart.some(item => getStock(item.productId) < item.qty)) {
    showError('Stock tidak mencukupi');
    return;
  }
} else {
  // Allow checkout with warning
  if (cart.some(item => getStock(item.productId) < item.qty)) {
    showWarning('Beberapa produk out of stock');
  }
  // Continue checkout
}
```

#### Recipe Editing Rules
- **CANNOT** edit recipe if there are active (unpaid/saved) transactions containing that product
- **Validation**: Check `transactions` table for `status IN ['saved', 'unpaid']` and `items` containing `productId`

### 2. Transaction Flow

#### Status States
- **saved**: Order saved to "Daftar Order" (not paid yet)
- **unpaid**: Checked out but payment pending (hutang)
- **paid**: Fully paid and completed

#### Saved Order Rules (Scenario A)
```javascript
// User adds products A, B, C → Click "Simpan" → Saved to Daftar Order
// Later, user clicks the saved order → Products A, B, C loaded to cart
// User adds product D
// Delete behavior:
// - Can delete product D (newly added, not saved yet)
// - CANNOT delete products A, B, C (already saved)

// Implementation:
savedOrder = {
  id: 'xxx',
  items: [
    { productId: 'A', qty: 1, locked: true },  // Locked = can't delete
    { productId: 'B', qty: 1, locked: true },
    { productId: 'C', qty: 1, locked: true }
  ]
}

// After loading to cart
cart = [
  { productId: 'A', qty: 1, locked: true },
  { productId: 'B', qty: 1, locked: true },
  { productId: 'C', qty: 1, locked: true },
  { productId: 'D', qty: 1, locked: false }  // Can delete
]
```

#### Checkout Calculation Order
```javascript
// Tax timing options (from settings):
// 1. 'before_discount': Tax applied before discount
// 2. 'after_discount': Tax applied after discount
// 3. 'included': Price already includes tax

function calculateTotal(cart, settings) {
  let subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  let tax = 0;
  let discount = 0;
  
  if (settings.tax_timing === 'before_discount') {
    tax = subtotal * (settings.tax_rate / 100);
    subtotal += tax;
    discount = calculateDiscount(subtotal, discountInput);
    return subtotal - discount;
  }
  
  if (settings.tax_timing === 'after_discount') {
    discount = calculateDiscount(subtotal, discountInput);
    subtotal -= discount;
    tax = subtotal * (settings.tax_rate / 100);
    return subtotal + tax;
  }
  
  if (settings.tax_timing === 'included') {
    // Price already includes tax, extract it for display
    tax = subtotal - (subtotal / (1 + settings.tax_rate / 100));
    discount = calculateDiscount(subtotal, discountInput);
    return subtotal - discount; // Tax already in price
  }
}
```

#### Stock Deduction (On Payment)
```javascript
async function processPayment(transaction) {
  // Start Dexie transaction (atomic)
  await db.transaction('rw', db.products, db.transactions, async () => {
    
    for (const item of transaction.items) {
      const product = await db.products.get(item.productId);
      
      if (product.type === 'finish_goods' || product.type === 'raw_material') {
        // Direct deduction
        await db.products.update(product.id, {
          currentStock: product.currentStock - item.qty
        });
      }
      
      if (product.type === 'recipe_goods') {
        // Deduct each ingredient
        for (const ingredient of product.recipe) {
          const material = await db.products.get(ingredient.materialId);
          await db.products.update(material.id, {
            currentStock: material.currentStock - (ingredient.qty * item.qty)
          });
        }
      }
    }
    
    // Save transaction
    await db.transactions.add({
      ...transaction,
      status: 'paid',
      paidAt: new Date()
    });
  });
}
```

### 3. Inventory Management

#### Faktur Pembelian Flow
```javascript
// User selects products + enters qty + unit price
// User chooses action:

// Option 1: BAYAR (Paid immediately)
- Status: 'paid'
- Stock updated immediately
- No debt recorded

// Option 2: BELI (Unpaid - Hutang)
- Status: 'unpaid'
- Stock updated immediately (goods received)
- Debt recorded (remainingDebt = total)

// Option 3: BATAL (Cancel)
- No changes to stock or invoices
```

#### Debt Payment (Bayar Hutang)
```javascript
// User selects unpaid invoice
// User enters payment amount
// Update invoice:
invoice.paidAmount += paymentAmount;
invoice.remainingDebt -= paymentAmount;
if (invoice.remainingDebt === 0) {
  invoice.status = 'paid';
}
```

#### HPP Calculation (Average Method)
```javascript
// After EVERY invoice (paid or unpaid), recalculate HPP
function updateAverageHPP(productId) {
  const invoices = db.invoices
    .where('items.productId').equals(productId)
    .toArray();
  
  let totalCost = 0;
  let totalQty = 0;
  
  for (const invoice of invoices) {
    const item = invoice.items.find(i => i.productId === productId);
    totalCost += item.total; // qty * unitPrice
    totalQty += item.qty;
  }
  
  const averageHPP = totalQty > 0 ? totalCost / totalQty : 0;
  
  db.products.update(productId, { cost: averageHPP });
}
```

### 4. Cashier Shift Management

#### Open Shift
```javascript
// User clicks "Buka Kasir"
// Input: Opening balance (modal cash in drawer)
await db.cashier_shifts.add({
  id: generateUUID(),
  openedBy: currentUser.id,
  openingBalance: inputAmount,
  openedAt: new Date(),
  status: 'open'
});
```

#### Close Shift (Tutup Kasir)
```javascript
// MANDATORY before closing app
// Validation checks:
1. Check unpaid transactions → Show warning
2. Check saved orders → Show warning
3. Require actual cash count input

// Calculate expected closing balance
const transactions = await db.transactions
  .where('createdAt').between(shift.openedAt, new Date())
  .and(t => t.status === 'paid')
  .toArray();

const totalCash = transactions
  .filter(t => t.payments.some(p => p.method === 'cash'))
  .reduce((sum, t) => {
    const cashPayment = t.payments.find(p => p.method === 'cash');
    return sum + cashPayment.amount;
  }, 0);

const expectedClosing = shift.openingBalance + totalCash;
const actualCash = inputActualCash; // User input
const variance = actualCash - expectedClosing;

// Update shift
await db.cashier_shifts.update(shift.id, {
  closedBy: currentUser.id,
  closingBalance: expectedClosing,
  actualCash: actualCash,
  variance: variance,
  totalTransactions: transactions.length,
  totalSales: transactions.reduce((sum, t) => sum + t.total, 0),
  totalCash: totalCash,
  totalNonCash: totalSales - totalCash,
  closedAt: new Date(),
  status: 'closed'
});
```

#### Shift Validation on App Start
```javascript
// On app open, check for open shift
const openShift = await db.cashier_shifts
  .where('status').equals('open')
  .first();

if (openShift) {
  // Show warning modal
  showAlert({
    title: 'Shift Belum Ditutup',
    message: `Anda memiliki shift yang masih berjalan sejak ${formatDate(openShift.openedAt)}. Harap tutup shift sebelum melanjutkan.`,
    actions: [
      { label: 'Tutup Shift Sekarang', onClick: () => navigateTo('/close-shift') },
      { label: 'Lanjutkan', onClick: () => { /* Allow but show persistent banner */ } }
    ]
  });
}
```

### 5. Notifications System

#### Trigger Rules
```javascript
// 1. Low Stock Alert
// Trigger: When product.currentStock <= product.minStock
// Check: After every stock update (invoice, opname, waste, transaction)
function checkLowStock(productId) {
  const product = await db.products.get(productId);
  if (product.monitorStock && product.currentStock <= product.minStock) {
    createNotification({
      type: 'low_stock',
      title: 'Stok Rendah',
      message: `${product.name}: ${product.currentStock}${product.uom.base} tersisa`,
      data: { productId }
    });
  }
}

// 2. Unpaid Transaction Alert
// Trigger: Real-time count of transactions with status = 'unpaid'
// Display: Badge with count on notification bell
function getUnpaidCount() {
  return db.transactions.where('status').equals('unpaid').count();
}

// 3. Saved Order Reminder
// Trigger: Orders saved > 6 hours ago
// Check: On app open, every 1 hour (setInterval)
function checkSavedOrders() {
  const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
  const oldOrders = await db.transactions
    .where('status').equals('saved')
    .and(t => t.savedAt < sixHoursAgo)
    .toArray();
  
  if (oldOrders.length > 0) {
    createNotification({
      type: 'saved_order',
      title: 'Order Menunggu',
      message: `${oldOrders.length} order belum diselesaikan`,
      data: { orderIds: oldOrders.map(o => o.id) }
    });
  }
}
```

#### Notification Display
```javascript
// Badge on bell icon
const unreadCount = await db.notifications.where('read').equals(false).count();
<NotificationBell badge={unreadCount} />

// Dropdown panel (click bell)
const notifications = await db.notifications
  .orderBy('createdAt')
  .reverse()
  .limit(10)
  .toArray();

// Mark as read on panel open
await db.notifications.where('read').equals(false).modify({ read: true });
```

---

## 🔐 AUTHENTICATION & SESSION MANAGEMENT

### Initial Login Flow
```javascript
// 1. User enters email + password
// 2. Call Supabase Auth (REQUIRES INTERNET)
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password
});

if (error) {
  showError('Login gagal. Periksa koneksi internet Anda.');
  return;
}

// 3. Store session in IndexedDB
await db.users.add({
  id: generateUUID(),
  supabaseId: data.user.id,
  email: data.user.email,
  name: data.user.user_metadata.name,
  role: data.user.user_metadata.role, // 'owner' | 'kasir'
  pin: await hashPIN(userInputPIN), // bcrypt hash
  createdAt: new Date(),
  updatedAt: new Date()
});

// 4. Store session with expiry
localStorage.setItem('session', JSON.stringify({
  token: data.session.access_token,
  expiresAt: Date.now() + (3 * 24 * 60 * 60 * 1000) // 3 days
}));

// 5. Navigate to Cashier page
navigateTo('/cashier');
```

### Offline Session Check
```javascript
// On app start
function checkSession() {
  const session = JSON.parse(localStorage.getItem('session'));
  
  if (!session) {
    navigateTo('/login');
    return;
  }
  
  const now = Date.now();
  const daysLeft = Math.ceil((session.expiresAt - now) / (24 * 60 * 60 * 1000));
  
  if (daysLeft <= 0) {
    showError('Sesi Anda telah berakhir. Silakan login kembali.');
    localStorage.removeItem('session');
    navigateTo('/login');
    return;
  }
  
  if (daysLeft <= 1) {
    showWarning(`Sesi Anda akan berakhir dalam ${daysLeft} hari. Hubungkan ke internet untuk memperpanjang.`);
  }
  
  // Session valid, proceed
  return true;
}
```

### Lock Screen Flow
```javascript
// User clicks lock icon
function lockScreen() {
  useUIStore.setState({ isLocked: true });
  // Cart data preserved, just overlay PIN input
}

// User enters PIN to unlock
async function unlockScreen(inputPIN) {
  const user = await db.users.where('id').equals(currentUserId).first();
  const isValid = await bcrypt.compare(inputPIN, user.pin);
  
  if (isValid) {
    useUIStore.setState({ isLocked: false });
  } else {
    showError('PIN salah');
  }
}
```

### Role-Based Access Control
```javascript
// HOC for protected routes
function PrivateRoute({ children, requiredRole }) {
  const user = useAuthStore(state => state.user);
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (requiredRole && user.role !== requiredRole) {
    return <div>Akses ditolak</div>;
  }
  
  return children;
}

// Usage
<Route path="/settings" element={
  <PrivateRoute requiredRole="owner">
    <SettingsPage />
  </PrivateRoute>
} />
```

---

## 🖨️ PRINTING IMPLEMENTATION

### Receipt Template Engine
```javascript
// settings.receipt_transaction_settings example
{
  header: {
    showLogo: true,
    showBusinessName: true,
    showAddress: true,
    showPhone: true,
    showCashier: true,
    showDateTime: true
  },
  body: {
    showItemList: true,
    showSubtotal: true,
    showDiscount: true,
    showTax: true,
    showTotal: true,
    showPaymentMethod: true,
    showCashReceived: true,
    showChange: true
  },
  footer: {
    showMessage: true,
    customMessage: 'Terima kasih atas kunjungan Anda!',
    showWebsite: false,
    website: '',
    showBarcode: false
  }
}

// Generate receipt content
function generateReceipt(transaction, settings) {
  const business = settings.business_info;
  const receiptSettings = settings.receipt_transaction_settings;
  
  let receipt = '';
  
  // Header
  if (receiptSettings.header.showBusinessName) {
    receipt += centerText(business.name, 32) + '\n';
  }
  if (receiptSettings.header.showAddress) {
    receipt += centerText(business.address, 32) + '\n';
  }
  // ... build full receipt string
  
  return receipt;
}
```

### USB Printer Integration
```javascript
import { EscposBuffer } from 'escpos-buffer';

async function printReceipt(receiptContent) {
  try {
    // Request USB device (browser API)
    const device = await navigator.usb.requestDevice({
      filters: [{ classCode: 7 }] // Printer class
    });
    
    await device.open();
    await device.selectConfiguration(1);
    await device.claimInterface(0);
    
    // Build ESC/POS commands
    const buffer = new EscposBuffer();
    buffer.init();
    buffer.text(receiptContent);
    buffer.cut();
    
    // Send to printer
    await device.transferOut(1, buffer.buffer);
    
    await device.close();
    
    showSuccess('Struk berhasil dicetak');
  } catch (error) {
    showError('Gagal mencetak struk: ' + error.message);
  }
}
```

### Print Settings
```javascript
// settings.print_behavior
{
  autoPrint: false, // If true, auto-print after payment
  printerType: 'usb', // 'usb' | 'bluetooth' | 'network'
  receiptWidth: 32, // Characters per line
  fontSize: 'normal' // 'normal' | 'large'
}
```

---

## 📊 EXPORT FUNCTIONALITY

### Excel Export
```javascript
import * as XLSX from 'xlsx';

function exportToExcel(data, filename) {
  // data = array of objects
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  
  // Auto-adjust column widths
  const maxWidth = data.reduce((acc, row) => {
    Object.keys(row).forEach((key, i) => {
      const length = String(row[key]).length;
      acc[i] = Math.max(acc[i] || 0, length);
    });
    return acc;
  }, []);
  
  worksheet['!cols'] = maxWidth.map(w => ({ width: w + 2 }));
  
  // Export
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

// Usage
const transactions = await db.transactions
  .where('createdAt').between(startDate, endDate)
  .toArray();

const exportData = transactions.map(t => ({
  'No Transaksi': t.transactionNumber,
  'Tanggal': formatDate(t.createdAt),
  'Pelanggan': t.customerName || '-',
  'Total': formatCurrency(t.total),
  'Status': t.status
}));

exportToExcel(exportData, `Transaksi_${formatDate(new Date())}`);
```

### PDF Export
```javascript
import jsPDF from 'jspdf';
import 'jspdf-autotable';

function exportToPDF(data, title, columns, filename) {
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(16);
  doc.text(title, 14, 20);
  
  // Date range
  doc.setFontSize(10);
  doc.text(`Periode: ${formatDate(startDate)} - ${formatDate(endDate)}`, 14, 28);
  
  // Table
  doc.autoTable({
    startY: 35,
    head: [columns],
    body: data,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [0, 0, 0] }
  });
  
  doc.save(`${filename}.pdf`);
}

// Usage
exportToPDF(
  exportData,
  'Laporan Transaksi',
  ['No Transaksi', 'Tanggal', 'Pelanggan', 'Total', 'Status'],
  `Laporan_Transaksi_${formatDate(new Date())}`
);
```

---

## 🧪 TESTING REQUIREMENTS

### Unit Tests (Required)
```javascript
// Test critical business logic
describe('calculateTotal', () => {
  it('should calculate tax before discount', () => {
    const cart = [{ price: 100000, qty: 1 }];
    const settings = {
      tax_rate: 10,
      tax_timing: 'before_discount'
    };
    const discount = { type: 'percent', value: 10 };
    
    const total = calculateTotal(cart, settings, discount);
    expect(total).toBe(99000); // (100000 + 10000) - 11000
  });
});

describe('calculateRecipeStock', () => {
  it('should return minimum possible portions', () => {
    const product = {
      type: 'recipe_goods',
      recipe: [
        { materialId: 'mat1', qty: 200 }, // 200gr per porsi
        { materialId: 'mat2', qty: 50 }   // 50gr per porsi
      ]
    };
    
    const materials = [
      { id: 'mat1', currentStock: 1000 }, // 5 porsi possible
      { id: 'mat2', currentStock: 100 }   // 2 porsi possible
    ];
    
    const stock = calculateRecipeStock(product, materials);
    expect(stock).toBe(2); // Limited by mat2
  });
});
```

### Integration Tests (Recommended)
```javascript
// Test full flows
describe('Checkout Flow', () => {
  it('should deduct stock and create transaction', async () => {
    const initialStock = 10;
    await db.products.add({ id: 'prod1', currentStock: initialStock });
    
    const transaction = {
      items: [{ productId: 'prod1', qty: 2 }],
      total: 50000,
      status: 'paid'
    };
    
    await processPayment(transaction);
    
    const product = await db.products.get('prod1');
    expect(product.currentStock).toBe(8);
    
    const savedTransaction = await db.transactions.where('id').equals(transaction.id).first();
    expect(savedTransaction.status).toBe('paid');
  });
});
```

### Manual Testing Checklist
- [ ] Login/Logout (online & offline)
- [ ] Add product with recipe
- [ ] Create transaction with recipe goods (check stock deduction)
- [ ] Save order → Load order → Complete payment
- [ ] Void transaction (with PIN)
- [ ] Create invoice → Check HPP update
- [ ] Stok opname → Check stock adjustment
- [ ] Close cashier → Check variance calculation
- [ ] Export Excel & PDF
- [ ] Print receipt (USB)
- [ ] Lock screen → Unlock with PIN
- [ ] Notifications (low stock, unpaid, saved orders)
- [ ] Offline mode (disconnect network, check functionality)
- [ ] Session expiry (manipulate time to 3+ days)

---

## 🚨 ERROR HANDLING PATTERNS

### Global Error Boundary
```javascript
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Log to external service (future)
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="error-page">
          <h1>Terjadi kesalahan</h1>
          <p>{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()}>
            Muat Ulang
          </button>
        </div>
      );
    }
    
    return this.props.children;
  }
}
```

### Service-Level Error Handling
```javascript
// Wrap all service functions with try-catch
async function productService.create(data) {
  try {
    // Validate input
    const validated = productSchema.parse(data);
    
    // Business logic validation
    if (validated.type === 'recipe_goods' && !validated.recipe) {
      throw new Error('Recipe is required for recipe goods');
    }
    
    // Save to DB
    const id = await db.products.add({
      ...validated,
      id: generateUUID(),
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    showSuccess('Produk berhasil ditambahkan');
    return id;
    
  } catch (error) {
    if (error instanceof ZodError) {
      showError('Data tidak valid: ' + error.errors[0].message);
    } else {
      showError('Gagal menambahkan produk: ' + error.message);
    }
    throw error;
  }
}
```

### Network Error Handling
```javascript
// Detect online/offline status
window.addEventListener('online', () => {
  useAuthStore.setState({ isOnline: true });
  showSuccess('Koneksi internet tersambung');
});

window.addEventListener('offline', () => {
  useAuthStore.setState({ isOnline: false });
  showWarning('Anda sedang offline');
});
```

---

## 🎯 DEVELOPMENT WORKFLOW

### Phase 1.0 Implementation Order

#### Sprint 1: Foundation (Week 1-2)
1. **Setup project**
   - Create React App
   - Install dependencies
   - Configure Tailwind + shadcn/ui
   - Setup folder structure (per Architecture doc)

2. **Database layer**
   - Initialize Dexie.js
   - Create all schemas (users, products, transactions, etc.)
   - Create migration file
   - Test CRUD operations

3. **Authentication**
   - Supabase client setup
   - Login page UI
   - Session management
   - Offline session check
   - Lock screen component

#### Sprint 2: Product Management (Week 3-4)
1. **Product CRUD**
   - Product list page
   - Product form (add/edit)
   - Category manager
   - UOM setup

2. **Recipe builder**
   - Recipe form UI
   - Recipe stock calculation logic
   - Test auto-deduction

#### Sprint 3: Cashier Core (Week 5-6)
1. **Main POS UI**
   - Header (Notif, Menu, Lock)
   - Product grid view
   - Product card with stock badge
   - Search functionality

2. **Cart & Summary**
   - Summary order sidebar
   - Add/remove/update cart items
   - Customer selector modal
   - Calculate total (with tax/discount)

3. **Saved Orders**
   - Save order function
   - Daftar Order list
   - Load saved order (with lock logic)

#### Sprint 4: Checkout & Payment (Week 7-8)
1. **Checkout modal**
   - Payment calculator
   - Payment method selector (Cash, E-Wallet, QRIS)
   - Kembalian calculation

2. **Transaction processing**
   - Stock deduction logic
   - Transaction save
   - Receipt generation

3. **Printing**
   - USB printer integration
   - Receipt template engine
   - Print settings

#### Sprint 5: Inventory (Week 9-10)
1. **Faktur Pembelian**
   - Invoice form
   - Product selector
   - Supplier management
   - Bayar/Beli/Batal flow

2. **Stock operations**
   - Stok opname
   - Stok terbuang
   - HPP calculation
   - Debt payment

#### Sprint 6: Reports & Settings (Week 11-12)
1. **Reports**
   - Transaction report
   - Sales report
   - Close cashier flow
   - Export (Excel/PDF)

2. **Settings**
   - Receipt settings
   - Tax settings
   - Account settings
   - Business settings
   - Data Health

3. **Notifications**
   - Notification system
   - Low stock alerts
   - Unpaid transaction count
   - Saved order reminders

#### Sprint 7: Polish & Testing (Week 13-14)
1. **UI/UX refinement**
   - Responsive layouts
   - Loading states
   - Error states
   - Empty states

2. **Testing**
   - Unit tests (critical functions)
   - Integration tests (key flows)
   - Manual testing (full checklist)
   - Bug fixes

3. **PWA setup**
   - Service worker
   - Manifest
   - Offline caching
   - Install prompt

### Code Review Checklist
- [ ] Follows Architecture document structure
- [ ] Uses correct Zustand store
- [ ] Proper error handling
- [ ] Input validation (Zod)
- [ ] Audit trail logged
- [ ] Soft delete implemented
- [ ] Loading/error states
- [ ] Responsive design
- [ ] Accessible (ARIA labels, keyboard nav)
- [ ] Performance optimized (no unnecessary re-renders)

---

## 📝 NAMING CONVENTIONS

### Files
- **Components**: PascalCase (`ProductCard.jsx`)
- **Hooks**: camelCase with `use` prefix (`useProducts.js`)
- **Services**: camelCase with `Service` suffix (`productService.js`)
- **Stores**: camelCase with `Store` suffix (`cashierStore.js`)
- **Utils**: camelCase (`formatters.js`)

### Variables & Functions
```javascript
// Use descriptive, unambiguous names
const currentUser = useAuthStore(state => state.user); // ✅
const user = useAuthStore(state => state.user); // ❌ Too generic

// Boolean variables: use is/has/can prefix
const isOnline = useAuthStore(state => state.isOnline); // ✅
const online = useAuthStore(state => state.isOnline); // ❌

// Functions: verb + noun
function calculateTotal() {} // ✅
function total() {} // ❌

// Event handlers: handle + Event
function handleSubmit() {} // ✅
function onSubmit() {} // ⚠️ Acceptable but less clear
```

### Database Fields
```javascript
// Use camelCase for consistency with JavaScript
{
  id: '...',
  productName: '...', // ✅
  product_name: '...' // ❌ (snake_case for SQL, not IndexedDB)
}
```

---

## 🔒 SECURITY BEST PRACTICES

### Input Sanitization
```javascript
// Always validate and sanitize user input
import { z } from 'zod';

const productSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  price: z.number().positive(),
  categoryId: z.string().uuid()
});

// Sanitize before render (prevent XSS)
function sanitize(html) {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
}
```

### PIN Security
```javascript
// NEVER store plain-text PINs
import bcrypt from 'bcryptjs';

// Hash before storing
const hashedPIN = await bcrypt.hash(userPIN, 10);

// Verify
const isValid = await bcrypt.compare(inputPIN, storedHashedPIN);
```

### Session Security
```javascript
// Rotate session token on sensitive actions
async function changePassword(newPassword) {
  // Update password in Supabase
  await supabase.auth.updateUser({ password: newPassword });
  
  // Force re-login
  localStorage.removeItem('session');
  navigateTo('/login');
}
```

---

## 🚀 PERFORMANCE OPTIMIZATION

### IndexedDB Query Optimization
```javascript
// ✅ Use indexes for WHERE clauses
db.products.where('categoryId').equals('cat1');

// ❌ Avoid full table scans
db.products.toArray().then(all => all.filter(p => p.categoryId === 'cat1'));

// ✅ Use compound indexes for complex queries
db.products.where('[deletedAt+name]').equals([null, 'Bakso']);
```

### React Performance
```javascript
// ✅ Memoize expensive calculations
const calculatedStock = useMemo(() => {
  return calculateRecipeStock(product, materials);
}, [product, materials]);

// ✅ Use React.memo for pure components
const ProductCard = React.memo(({ product, onClick }) => {
  return <div onClick={onClick}>{product.name}</div>;
});

// ✅ Debounce search inputs
const debouncedSearch = useDebounce(searchTerm, 300);
```

### Image Optimization
```javascript
// Compress on upload
import imageCompression from 'browser-image-compression';

async function handleImageUpload(file) {
  const options = {
    maxSizeMB: 0.2,
    maxWidthOrHeight: 800,
    useWebWorker: true
  };
  
  const compressedFile = await imageCompression(file, options);
  
  // Convert to WebP
  const webpDataURL = await convertToWebP(compressedFile);
  
  return webpDataURL;
}
```

---

## ✅ DEFINITION OF DONE (DoD)

A feature is considered DONE when:
1. **Code complete**: All functionality implemented per requirements
2. **Tests pass**: Unit tests + manual testing checklist complete
3. **Code reviewed**: Follows Architecture & coding standards
4. **Error handling**: All edge cases handled gracefully
5. **UI polished**: Loading/error/empty states implemented
6. **Responsive**: Works on tablet (768px+) and desktop
7. **Accessible**: Keyboard navigation + ARIA labels
8. **Documented**: JSDoc comments for complex functions
9. **Performance**: No console errors, no memory leaks
10. **Audit logged**: Critical actions tracked (who, when, what)

---

## 🎓 ADDITIONAL GUIDELINES

### Code Comments
```javascript
// ✅ Explain WHY, not WHAT
// Calculate average HPP across all invoices to smooth price fluctuations
const avgHPP = totalCost / totalQty;

// ❌ Redundant comment
// Set average HPP
const avgHPP = totalCost / totalQty;
```

### Magic Numbers
```javascript
// ❌ Magic numbers
if (stock < 5) { showWarning(); }

// ✅ Named constants
const LOW_STOCK_THRESHOLD = 5;
if (stock < LOW_STOCK_THRESHOLD) { showWarning(); }
```

### Component Structure
```javascript
// Recommended component order:
function ProductCard({ product, onClick }) {
  // 1. Hooks
  const [isHovered, setIsHovered] = useState(false);
  const user = useAuthStore(state => state.user);
  
  // 2. Derived state
  const stockColor = getStockColor(product.calculatedStock);
  
  // 3. Event handlers
  const handleClick = () => {
    onClick(product);
  };
  
  // 4. Effects
  useEffect(() => {
    // side effects
  }, []);
  
  // 5. Render
  return (
    <div onClick={handleClick}>
      {/* JSX */}
    </div>
  );
}
```

---

## 🎯 SUCCESS CRITERIA

Phase 1.0 is considered successful when:
1. ✅ All MUST HAVE features functional (per Architecture checklist)
2. ✅ Cashier can complete full transaction flow offline
3. ✅ Stock tracking accurate (no discrepancies)
4. ✅ HPP calculation correct (verified against manual calculation)
5. ✅ Receipt printing works (USB)
6. ✅ Reports accurate (transaction data matches database)
7. ✅ No critical bugs (crashes, data loss)
8. ✅ Performance acceptable (< 3s page load, < 200ms interactions)
9. ✅ User feedback positive (usability testing)
10. ✅ Ready for production deployment

---

## 📚 REFERENCE LINKS

### Documentation
- React: https://react.dev
- Zustand: https://docs.pmnd.rs/zustand
- Dexie.js: https://dexie.org
- Tailwind CSS: https://tailwindcss.com
- shadcn/ui: https://ui.shadcn.com
- Supabase: https://supabase.com/docs

### Tools
- Date manipulation: https://date-fns.org
- Form validation: https://zod.dev
- UUID generation: https://www.npmjs.com/package/uuid
- Image compression: https://www.npmjs.com/package/browser-image-compression

---

## 🔥 FINAL REMINDERS

### DO
- ✅ Follow Architecture document religiously
- ✅ Validate all inputs (Zod schemas)
- ✅ Handle errors gracefully
- ✅ Log audit trails
- ✅ Use soft delete for master data
- ✅ Test critical flows manually
- ✅ Keep components under 300 lines
- ✅ Optimize IndexedDB queries
- ✅ Use meaningful variable names
- ✅ Comment complex business logic

### DON'T
- ❌ Store sensitive data in localStorage (only session token)
- ❌ Use auto-increment IDs (use UUID v7)
- ❌ Hard delete master data (always soft delete)
- ❌ Skip input validation
- ❌ Ignore error states
- ❌ Use magic numbers
- ❌ Create god components (> 500 lines)
- ❌ Query database in render (use hooks)
- ❌ Forget loading states
- ❌ Skip accessibility (ARIA labels)

---

**END OF MASTER PROMPT**

Version: 1.0.0  
Last Updated: October 25, 2025  
Status: READY FOR AGENT EXECUTION

---

## 📋 QUICK START FOR AI AGENT

To begin development:
1. Read this prompt completely
2. Review the Architecture document
3. Setup project (Sprint 1, Task 1)
4. Confirm understanding of all business rules
5. Start implementing in sprint order
6. Test each feature against DoD before moving to next
7. Report any ambiguities or blockers immediately

Good luck! 🚀