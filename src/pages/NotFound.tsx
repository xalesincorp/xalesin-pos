import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Home, ArrowLeft, Search } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardContent className="flex flex-col items-center justify-center py-16 px-6 text-center">
          {/* 404 Illustration */}
          <div className="relative mb-8">
            <div className="text-9xl font-bold text-primary/10">404</div>
            <Search className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 text-muted-foreground" />
          </div>

          {/* Title & Description */}
          <h1 className="text-2xl font-bold mb-2">
            Halaman Tidak Ditemukan
          </h1>
          <p className="text-muted-foreground mb-8 max-w-sm">
            Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              className="flex-1 gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali
            </Button>
            <Button
              onClick={() => navigate('/cashier')}
              className="flex-1 gap-2"
            >
              <Home className="w-4 h-4" />
              Ke Beranda
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;