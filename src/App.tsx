import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { useAuthStore } from '@/stores/authStore';
import PrivateRoute from '@/components/PrivateRoute';
import Login from '@/pages/Login';
import Cashier from '@/pages/Cashier';
import NotFound from '@/pages/NotFound';

function App() {
  const { checkSession } = useAuthStore();

  // Check session on mount
  useEffect(() => {
    checkSession();
  }, [checkSession]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route
          path="/cashier"
          element={
            <PrivateRoute>
              <Cashier />
            </PrivateRoute>
          }
        />

        {/* Redirects */}
        <Route path="/" element={<Navigate to="/cashier" replace />} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* Toast Notifications */}
      <Toaster 
        position="top-right"
        expand={false}
        richColors
        closeButton
      />
    </BrowserRouter>
  );
}

export default App;