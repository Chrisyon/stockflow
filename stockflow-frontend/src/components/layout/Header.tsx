import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShoppingCart, Bell, Store } from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

interface HeaderProps {
  activePage: string;
  setActivePage: (page: string) => void;
  lowStockCount: number;
}

export const Header: React.FC<HeaderProps> = ({ activePage, setActivePage, lowStockCount }) => {
  const { user } = useAuth();

  const getPageTitle = (page: string) => {
    switch (page) {
      case 'dashboard':
        return 'Dashboard Overview';
      case 'pos':
        return 'POS / Kasir Penjualan';
      case 'products':
        return 'Manajemen Produk & Kategori';
      case 'inventory':
        return 'Stok & Riwayat Perubahan';
      case 'sales':
        return 'Riwayat Transaksi';
      case 'suppliers':
        return 'Manajemen Supplier';
      case 'reports':
        return 'Laporan & Analytics Keuntungan';
      case 'users':
        return 'Kelola Pengguna Aplikasi';
      case 'settings':
        return 'Pengaturan Toko';
      default:
        return 'StockFlow System';
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
      <div>
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">{getPageTitle(activePage)}</h2>
        <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
          <Store className="h-3 w-3 text-slate-400" />
          <span>Toko StockFlow Berkah Jaya</span>
        </p>
      </div>

      <div className="flex items-center gap-4">
        {/* Quick Action to POS for Admin/Cashier */}
        {activePage !== 'pos' && (user?.role === 'ADMIN' || user?.role === 'CASHIER') && (
          <Button
            variant="primary"
            size="sm"
            icon={<ShoppingCart className="h-4 w-4" />}
            onClick={() => setActivePage('pos')}
          >
            Mulai Kasir POS
          </Button>
        )}

        {/* Low Stock Warning Bell */}
        <button
          onClick={() => setActivePage('products')}
          className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          title={`${lowStockCount} Produk Stok Menipis`}
        >
          <Bell className="h-5 w-5" />
          {lowStockCount > 0 && (
            <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white"></span>
          )}
        </button>

        {/* Current User Badge */}
        <div className="pl-3 border-l border-slate-200 flex items-center gap-2">
          <Badge
            variant={
              user?.role === 'ADMIN'
                ? 'brand'
                : user?.role === 'OWNER'
                ? 'success'
                : 'info'
            }
          >
            {user?.role}
          </Badge>
        </div>
      </div>
    </header>
  );
};
