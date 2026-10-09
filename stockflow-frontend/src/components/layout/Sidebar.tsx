import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import {
  LayoutDashboard,
  Package,
  ArrowDownUp,
  ShoppingCart,
  Receipt,
  Truck,
  BarChart3,
  Users,
  Settings,
  ShieldAlert,
  LogOut,
  Store,
  X,
} from 'lucide-react';

interface SidebarProps {
  activePage: string;
  setActivePage: (page: string) => void;
  lowStockCount: number;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  roles: UserRole[];
  badge?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  setActivePage,
  lowStockCount,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const { user, switchRole, logout } = useAuth();
  const currentRole = user?.role || 'ADMIN';

  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="h-4 w-4" />,
      roles: ['ADMIN', 'OWNER'],
    },
    {
      id: 'pos',
      label: 'POS / Kasir',
      icon: <ShoppingCart className="h-4 w-4" />,
      roles: ['ADMIN', 'CASHIER'],
    },
    {
      id: 'products',
      label: 'Produk & Kategori',
      icon: <Package className="h-4 w-4" />,
      roles: ['ADMIN', 'CASHIER', 'OWNER'],
      badge: lowStockCount > 0 ? lowStockCount : undefined,
    },
    {
      id: 'inventory',
      label: 'Stok & Movement',
      icon: <ArrowDownUp className="h-4 w-4" />,
      roles: ['ADMIN', 'OWNER'],
    },
    {
      id: 'sales',
      label: 'Riwayat Transaksi',
      icon: <Receipt className="h-4 w-4" />,
      roles: ['ADMIN', 'CASHIER', 'OWNER'],
    },
    {
      id: 'suppliers',
      label: 'Supplier',
      icon: <Truck className="h-4 w-4" />,
      roles: ['ADMIN', 'OWNER'],
    },
    {
      id: 'reports',
      label: 'Laporan & Analytics',
      icon: <BarChart3 className="h-4 w-4" />,
      roles: ['ADMIN', 'OWNER'],
    },
    {
      id: 'users',
      label: 'Kelola User',
      icon: <Users className="h-4 w-4" />,
      roles: ['ADMIN', 'OWNER'],
    },
    {
      id: 'settings',
      label: 'Pengaturan Toko',
      icon: <Settings className="h-4 w-4" />,
      roles: ['ADMIN', 'OWNER'],
    },
  ];

  const visibleMenuItems = menuItems.filter(item => item.roles.includes(currentRole));

  return (
    <aside
      className={`w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 min-h-screen border-r border-slate-800 transition-all duration-300 z-50 ${
        isMobileOpen
          ? 'fixed inset-y-0 left-0 shadow-2xl translate-x-0'
          : 'hidden md:flex md:static'
      }`}
    >
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-brand-600 text-white shadow-md">
            <Store className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-wide">StockFlow</h1>
            <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">Inventory & Sales</p>
          </div>
        </div>
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Quick Role Switcher (Portfolio Reviewer Helper) */}
      <div className="mx-4 my-3 p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 flex items-center gap-1">
            <ShieldAlert className="h-3 w-3 text-brand-400" /> Switch Role Demo
          </span>
        </div>
        <div className="grid grid-cols-3 gap-1">
          {(['ADMIN', 'CASHIER', 'OWNER'] as UserRole[]).map(role => (
            <button
              key={role}
              onClick={() => {
                switchRole(role);
                if (role === 'CASHIER') setActivePage('pos');
                else if (activePage === 'pos' && (role as string) !== 'CASHIER') setActivePage('dashboard');
              }}
              className={`py-1 text-[10px] font-bold rounded transition-all ${
                currentRole === role
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-slate-700/60 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Nav */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Menu Utama
        </div>
        {visibleMenuItems.map(item => {
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-brand-600 text-white shadow-sm font-bold'
                  : 'text-slate-400 hover:bg-slate-800/90 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                {item.icon}
                <span>{item.label}</span>
              </div>
              {item.badge && item.badge > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] font-extrabold rounded-full bg-rose-500 text-white animate-pulse">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer User Info */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="h-8 w-8 rounded-full bg-slate-700 text-brand-400 flex items-center justify-center font-bold text-xs shrink-0">
            {user?.fullName.charAt(0) || 'U'}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-slate-200 truncate">{user?.fullName}</p>
            <span className="text-[10px] text-slate-400 tracking-wider font-semibold uppercase">{user?.role}</span>
          </div>
        </div>
        <button
          onClick={logout}
          title="Logout"
          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
};
