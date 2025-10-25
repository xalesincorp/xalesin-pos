import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Store, Loader2, Wifi, WifiOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { db } from '@/db/database';
import { generateUUID } from '@/utils/uuid';
import { useAuthStore } from '@/stores/authStore';
import bcrypt from 'bcryptjs';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { isOnline, login, user } = useAuthStore();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/cashier', { replace: true });
    }
  }, [user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Email dan password harus diisi');
      return;
    }

    if (!isOnline) {
      toast.error('Login memerlukan koneksi internet. Silakan sambungkan ke internet terlebih dahulu.');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Authenticate with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw error;
      }

      if (!data.user) {
        throw new Error('Login gagal');
      }

      // 2. Check if user exists in local DB
      let localUser = await db.users
        .where('supabaseId')
        .equals(data.user.id)
        .first();

      // 3. If not exists, create local user record
      if (!localUser) {
        const userId = generateUUID();
        
        // Generate default PIN (hash of "1234")
        const defaultPIN = await bcrypt.hash('1234', 10);
        
        await db.users.add({
          id: userId,
          supabaseId: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User',
          role: data.user.user_metadata?.role || 'kasir', // Default to 'kasir'
          pin: defaultPIN,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null
        });

        localUser = await db.users.get(userId);
      }

      // 4. Store session with 3-day expiry
      login(localUser, data.session.access_token);

      toast.success('Login berhasil!');
      navigate('/cashier');
      
    } catch (error) {
      console.error('Login error:', error);
      
      if (error.message === 'Invalid login credentials') {
        toast.error('Email atau password salah');
      } else if (error.message.includes('Email not confirmed')) {
        toast.error('Email belum diverifikasi. Silakan cek email Anda.');
      } else {
        toast.error('Login gagal. Periksa koneksi internet Anda.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center p-4">
      {/* Online Status Indicator */}
      <div className="fixed top-4 right-4 z-50">
        <div className={`flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium ${
          isOnline 
            ? 'bg-success/10 text-success' 
            : 'bg-destructive/10 text-destructive'
        }`}>
          {isOnline ? (
            <>
              <Wifi className="w-3 h-3" />
              <span>Online</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3 h-3" />
              <span>Offline</span>
            </>
          )}
        </div>
      </div>

      <Card className="w-full max-w-md shadow-2xl border-0">
        <CardHeader className="space-y-4 text-center pb-8">
          <div className="mx-auto w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
            <Store className="w-8 h-8 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-3xl font-bold">POS Offline</CardTitle>
            <CardDescription className="text-base mt-2">
              Sistem kasir untuk UMKM Indonesia
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nama@bisnis.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="h-12"
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="h-12"
                autoComplete="current-password"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-12 text-base font-medium"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                'Masuk'
              )}
            </Button>
          </form>
          <div className="mt-6 space-y-3">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {isOnline 
                  ? 'Memerlukan koneksi internet untuk login pertama kali' 
                  : 'Tidak ada koneksi internet. Hubungkan untuk login.'}
              </p>
            </div>
            <div className="text-center text-xs text-muted-foreground">
              <p>Default PIN: 1234 (ubah setelah login)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
