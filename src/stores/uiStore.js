import { create } from 'zustand';

/**
 * UI Store
 * Manages global UI state (modals, notifications, loading states)
 */
export const useUIStore = create((set) => ({
  // Loading states
  isLoading: false,
  loadingMessage: '',
  
  // Notification badge counts
  unreadNotifications: 0,
  unpaidTransactionCount: 0,
  
  // Online/Offline status
  isOnline: typeof window !== 'undefined' ? navigator.onLine : true,
  
  // Lock screen
  isLocked: false,
  
  // Actions
  setLoading: (isLoading, message = '') => set({ isLoading, loadingMessage: message }),
  
  setUnreadNotifications: (count) => set({ unreadNotifications: count }),
  
  setUnpaidTransactionCount: (count) => set({ unpaidTransactionCount: count }),
  
  setOnline: (status) => set({ isOnline: status }),
  
  lockScreen: () => set({ isLocked: true }),
  
  unlockScreen: () => set({ isLocked: false }),
  
  /**
   * Update notification counts
   */
  updateNotificationCounts: async () => {
    try {
      const { db } = await import('../db/database');
      
      // Count unread notifications
      const unreadCount = await db.notifications.where('read').equals(false).count();
      
      // Count unpaid transactions
      const unpaidCount = await db.transactions.where('status').equals('unpaid').count();
      
      set({
        unreadNotifications: unreadCount,
        unpaidTransactionCount: unpaidCount
      });
    } catch (error) {
      console.error('Failed to update notification counts:', error);
    }
  }
}));

// Listen to online/offline events
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    useUIStore.getState().setOnline(true);
  });
  
  window.addEventListener('offline', () => {
    useUIStore.getState().setOnline(false);
  });
}
