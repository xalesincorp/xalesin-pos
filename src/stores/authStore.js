import { create } from 'zustand';

/**
 * Authentication Store
 * Manages user session, authentication state, and online/offline status
 */
export const useAuthStore = create((set, get) => ({
  // State
  user: null, // Current logged-in user
  session: null, // Session data with expiry
  isOnline: navigator.onLine, // Online/offline status
  isLoading: true, // Initial loading state
  
  // Actions
  setUser: (user) => set({ user }),
  
  setSession: (session) => set({ session }),
  
  setIsOnline: (isOnline) => set({ isOnline }),
  
  setIsLoading: (isLoading) => set({ isLoading }),
  
  /**
   * Initialize auth state
   * Check for existing session in localStorage
   */
  initAuth: async () => {
    try {
      const sessionStr = localStorage.getItem('session');
      
      if (!sessionStr) {
        set({ user: null, session: null, isLoading: false });
        return false;
      }
      
      const session = JSON.parse(sessionStr);
      const now = Date.now();
      const daysLeft = Math.ceil((session.expiresAt - now) / (24 * 60 * 60 * 1000));
      
      if (daysLeft <= 0) {
        // Session expired
        localStorage.removeItem('session');
        set({ user: null, session: null, isLoading: false });
        return false;
      }
      
      // Session valid
      set({ 
        user: session.user, 
        session: session,
        isLoading: false 
      });
      
      return true;
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({ user: null, session: null, isLoading: false });
      return false;
    }
  },
  
  /**
   * Login user
   */
  login: (user, token) => {
    const session = {
      token,
      user,
      expiresAt: Date.now() + (3 * 24 * 60 * 60 * 1000) // 3 days
    };
    
    localStorage.setItem('session', JSON.stringify(session));
    set({ user, session });
  },
  
  /**
   * Logout user
   */
  logout: () => {
    localStorage.removeItem('session');
    set({ user: null, session: null });
  },
  
  /**
   * Check if session is about to expire
   */
  checkSessionExpiry: () => {
    const { session } = get();
    
    if (!session) return { expired: true, daysLeft: 0 };
    
    const now = Date.now();
    const daysLeft = Math.ceil((session.expiresAt - now) / (24 * 60 * 60 * 1000));
    
    return {
      expired: daysLeft <= 0,
      daysLeft,
      warning: daysLeft <= 1 && daysLeft > 0
    };
  }
}));

// Setup online/offline listeners
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    useAuthStore.setState({ isOnline: true });
  });
  
  window.addEventListener('offline', () => {
    useAuthStore.setState({ isOnline: false });
  });
}
