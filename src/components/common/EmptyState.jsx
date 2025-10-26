import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SearchX, Package, RefreshCw } from 'lucide-react';

const EmptyState = ({ 
  type = 'search',
  searchTerm = '',
  onReset,
  className = ""
}) => {
  const configs = {
    search: {
      icon: SearchX,
      title: 'Produk tidak ditemukan',
      description: searchTerm 
        ? `Tidak ada hasil untuk "${searchTerm}"`
        : 'Coba kata kunci lain',
      action: onReset ? {
        label: 'Reset Pencarian',
        icon: RefreshCw,
        onClick: onReset
      } : null
    },
    empty: {
      icon: Package,
      title: 'Belum ada produk',
      description: 'Tambahkan produk untuk memulai',
      action: null
    },
    error: {
      icon: SearchX,
      title: 'Terjadi kesalahan',
      description: 'Gagal memuat data produk',
      action: onReset ? {
        label: 'Coba Lagi',
        icon: RefreshCw,
        onClick: onReset
      } : null
    }
  };

  const config = configs[type] || configs.search;
  const Icon = config.icon;

  return (
    <Card className={`border-dashed ${className}`}>
      <CardContent className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="rounded-full bg-muted p-6 mb-4">
          <Icon className="w-12 h-12 text-muted-foreground" />
        </div>
        
        <h3 className="text-lg font-semibold mb-2">
          {config.title}
        </h3>
        
        <p className="text-muted-foreground text-sm max-w-sm mb-6">
          {config.description}
        </p>

        {config.action && (
          <Button 
            onClick={config.action.onClick}
            variant="outline"
            className="gap-2"
          >
            {config.action.icon && <config.action.icon className="w-4 h-4" />}
            {config.action.label}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default EmptyState;