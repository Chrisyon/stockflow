import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShoppingCart, Bell, Store, Menu } from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

interface HeaderProps {
  activePage: string;
  setActivePage: (page: string) => void;
  lowStockCount: number;
  onToggleMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activePage,
  setActivePage,
  lowStockCount,
  onToggleMobileMenu,
}) => {
  const { user } = useAuth();

  const getPageTitle = (page: string) => {
    switch (page) {
      case 'dashboard':
        return 'Dashboard Overview';
      case 'pos':
        return 'POS / Kasir';
      case 'products':
        return 'Manajemen Produk';
      case 'inventory':
        return 'Stok & Movement';
      case 'sales':
        return 'Riwayat Transaksi';
      case 'suppliers':
        return 'Manajemen Supplier';
      case 'reports':
        return 'Laporan Keuntungan';
      case 'users':
        return 'Kelola User';
      case 'settings':
        return 'Pengaturan Toko';
      default:
        return 'StockFlow System';
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-3 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Menu Trigger */}
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            title="Menu Navigasi"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        <div>
          <h2 className="text-sm sm:text-lg font-bold text-slate-900 tracking-tight truncate max-w-[150px] sm:max-w-none">
            {getPageTitle(activePage)}
          </h2>
          <p className="text-[10px] sm:text-xs text-slate-500 hidden sm:flex items-center gap-1.5 mt-0.5">
            <Store className="h-3 w-3 text-slate-400" />
            <span>Toko StockFlow Berkah Jaya</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {/* Quick Action to POS for Admin/Cashier */}
        {activePage !== 'pos' && (user?.role === 'ADMIN' || user?.role === 'CASHIER') && (
          <Button
            variant="primary"
            size="sm"
            className="text-xs py-1.5 px-2.5 sm:px-3"
            icon={<ShoppingCart className="h-4 w-4" />}
            onClick={() => setActivePage('pos')}
          >
            <span className="hidden sm:inline">Mulai Kasir POS</span>
            <span className="sm:hidden">POS</span>
          </Button>
        )}

        {/* Low Stock Warning Bell */}
        <button
          onClick={() => setActivePage('products')}
          className="relative p-1.5 sm:p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          title={`${lowStockCount} Produk Stok Menipis`}
        >
          <Bell className="h-5 w-5" />
          {lowStockCount > 0 && (
            <span className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white"></span>
          )}
        </button>

        {/* Current User Badge */}
        <div className="pl-2 sm:pl-3 border-l border-slate-200 flex items-center gap-2">
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
