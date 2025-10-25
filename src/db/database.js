import Dexie from 'dexie';

/**
 * IndexedDB Database for POS Offline System
 * Uses Dexie.js wrapper for better IndexedDB management
 */
class POSDatabase extends Dexie {
  constructor() {
    super('POSOfflineDB');
    
    // Define database schema
    // Version 1: Initial schema
    this.version(1).stores({
      // Users table - Local user data and session management
      users: 'id, supabaseId, email, role, [deletedAt+email]',
      
      // Products table - Product catalog with recipe support
      products: 'id, name, sku, categoryId, type, [deletedAt+name], [deletedAt+type]',
      
      // Categories table - Product categories
      categories: 'id, name, [deletedAt+name]',
      
      // UOM table - Unit of measurement
      uom: 'id, name, [deletedAt+name]',
      
      // Customers table - Customer data
      customers: 'id, name, phone, email, [deletedAt+name], [deletedAt+phone]',
      
      // Suppliers table - Supplier data
      suppliers: 'id, name, phone, email, [deletedAt+name], [deletedAt+phone]',
      
      // Transactions table - Sales transactions
      transactions: 'id, transactionNumber, customerId, status, createdAt, [status+createdAt]',
      
      // Invoices table - Purchase invoices
      invoices: 'id, invoiceNumber, supplierId, status, createdAt, [status+createdAt]',
      
      // Cashier Shifts table - Shift management
      cashier_shifts: 'id, openedBy, status, openedAt, closedAt, [status+openedAt]',
      
      // Notifications table - Notification system
      notifications: 'id, type, read, createdAt, [read+createdAt]',
      
      // Settings table - App settings (single row)
      settings: 'id',
      
      // Stock Adjustments table - Stock opname and waste tracking
      stock_adjustments: 'id, productId, type, createdAt, createdBy, [type+createdAt]'
    });
  }
}

// Create and export database instance
export const db = new POSDatabase();

/**
 * Initialize database with default data
 */
export async function initializeDatabase() {
  try {
    // Check if settings already exist
    const existingSettings = await db.settings.toArray();
    
    if (existingSettings.length === 0) {
      // Create default settings
      await db.settings.add({
        id: 'default',
        business_info: {
          name: 'Toko Saya',
          address: '',
          phone: '',
          logo: null
        },
        tax_settings: {
          enabled: false,
          rate: 10,
          timing: 'after_discount' // 'before_discount' | 'after_discount' | 'included'
        },
        stock_restriction_enabled: true,
        receipt_transaction_settings: {
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
        },
        print_behavior: {
          autoPrint: false,
          printerType: 'usb', // 'usb' | 'bluetooth' | 'network'
          receiptWidth: 32,
          fontSize: 'normal' // 'normal' | 'large'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log('✅ Default settings initialized');
    }
    
    console.log('✅ Database initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    return false;
  }
}

/**
 * Clear all data from database (for testing/reset)
 */
export async function clearDatabase() {
  try {
    await db.transaction('rw', [
      db.users,
      db.products,
      db.categories,
      db.uom,
      db.customers,
      db.suppliers,
      db.transactions,
      db.invoices,
      db.cashier_shifts,
      db.notifications,
      db.stock_adjustments
    ], async () => {
      await db.users.clear();
      await db.products.clear();
      await db.categories.clear();
      await db.uom.clear();
      await db.customers.clear();
      await db.suppliers.clear();
      await db.transactions.clear();
      await db.invoices.clear();
      await db.cashier_shifts.clear();
      await db.notifications.clear();
      await db.stock_adjustments.clear();
    });
    
    console.log('✅ Database cleared successfully');
    return true;
  } catch (error) {
    console.error('❌ Database clear failed:', error);
    return false;
  }
}
