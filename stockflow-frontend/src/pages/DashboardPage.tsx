import React from 'react';
import { Product, Transaction } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Package,
  AlertTriangle,
  ArrowRight,
  Receipt,
  Layers,
} from 'lucide-react';

interface DashboardPageProps {
  products: Product[];
  transactions: Transaction[];
  onNavigate: (page: string) => void;
  onRestockClick: (product: Product) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  products,
  transactions,
  onNavigate,
  onRestockClick,
}) => {
  // Statistics Calculations
  const todayTransactions = transactions.filter(t => t.createdAt.startsWith('2026-10-09'));
  const totalOmsetToday = todayTransactions.reduce((sum, t) => sum + t.totalAmount, 0);

  const totalInventoryValue = products.reduce(
    (sum, p) => sum + p.costPrice * p.currentStock,
    0
  );

  // Calculate estimated gross profit across all transactions
  const totalGrossProfit = transactions.reduce((sum, t) => {
    const txCost = t.items.reduce((cSum, item) => cSum + item.costPrice * item.quantity, 0);
    return sum + (t.totalAmount - txCost);
  }, 0);

  const lowStockProducts = products.filter(p => p.currentStock <= p.minStock);

  // Sales Chart Data (Dummy 7 days trend)
  const salesTrend = [
    { day: 'Senin', sales: 450000, count: 6 },
    { day: 'Selasa', sales: 620000, count: 9 },
    { day: 'Rabu', sales: 510000, count: 7 },
    { day: 'Kamis', sales: 780000, count: 12 },
    { day: 'Jumat', sales: 890000, count: 15 },
    { day: 'Sabtu', sales: 1120000, count: 18 },
    { day: 'Minggu', sales: 950000, count: 14 },
  ];

  const maxSale = Math.max(...salesTrend.map(s => s.sales));

  return (
    <div className="space-y-6">
      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Omset Hari Ini */}
        <Card className="hover:border-brand-300 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Omset Hari Ini</p>
              <h3 className="text-xl font-black text-slate-900 mt-1">{formatCurrency(totalOmsetToday)}</h3>
              <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3" />
                <span>{todayTransactions.length} Transaksi Selesai</span>
              </p>
            </div>
            <div className="p-3 rounded-xl bg-brand-50 text-brand-600">
              <DollarSign className="h-6 w-6" />
            </div>
          </div>
        </Card>

        {/* Card 2: Estimasi Keuntungan Kotor */}
        <Card className="hover:border-emerald-300 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Gross Profit (Total)</p>
              <h3 className="text-xl font-black text-emerald-600 mt-1">{formatCurrency(totalGrossProfit)}</h3>
              <p className="text-[11px] text-slate-500 mt-1">Estimasi Margin Penjualan</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="h-6 w-6" />
            </div>
          </div>
        </Card>

        {/* Card 3: Total Produk */}
        <Card className="hover:border-sky-300 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Katalog Produk</p>
              <h3 className="text-xl font-black text-slate-900 mt-1">{products.length} SKU</h3>
              <p className="text-[11px] text-slate-500 mt-1">
                Nilai Stok: <strong className="text-slate-700 font-bold">{formatCurrency(totalInventoryValue)}</strong>
              </p>
            </div>
            <div className="p-3 rounded-xl bg-sky-50 text-sky-600">
              <Package className="h-6 w-6" />
            </div>
          </div>
        </Card>

        {/* Card 4: Low Stock Alert Warning */}
        <Card className={`transition-colors ${lowStockProducts.length > 0 ? 'border-amber-300 bg-amber-50/20' : ''}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-amber-700">Stok Menipis</p>
              <h3 className="text-xl font-black text-amber-600 mt-1">{lowStockProducts.length} Produk</h3>
              <p className="text-[11px] text-amber-700 mt-1 font-semibold">Perlu Segera Restock</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-100 text-amber-600">
              <AlertTriangle className="h-6 w-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Grid: Chart & Low Stock Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart (2 Cols) */}
        <Card
          className="lg:col-span-2"
          title="Tren Penjualan (7 Hari Terakhir)"
          subtitle="Statistik volume transaksi dan omset toko"
          action={
            <Button variant="outline" size="sm" onClick={() => onNavigate('reports')}>
              Laporan Lengkap
            </Button>
          }
        >
          <div className="pt-2">
            <div className="h-56 flex items-end justify-between gap-2 px-2 pb-2 border-b border-slate-100">
              {salesTrend.map((item, idx) => {
                const heightPercent = Math.round((item.sales / maxSale) * 100);
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                    {/* Tooltip Hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] py-1 px-2 rounded font-bold shadow-md pointer-events-none whitespace-nowrap">
                      {formatCurrency(item.sales)} ({item.count} Tx)
                    </div>
                    {/* Bar Visual */}
                    <div className="w-full max-w-[36px] bg-slate-100 rounded-t-lg overflow-hidden flex items-end h-40">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className="w-full bg-brand-600 group-hover:bg-brand-700 transition-all rounded-t-lg"
                      ></div>
                    </div>
                    <span className="text-[11px] font-bold text-slate-600">{item.day}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 pt-3 px-2">
              <span>Rata-rata Harian: <strong>Rp 745.000</strong></span>
              <span>Total Minggu Ini: <strong>Rp 5.210.000</strong></span>
            </div>
          </div>
        </Card>

        {/* Low Stock Alert Table Widget (1 Col) */}
        <Card
          title={
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <span>Stok Menipis (Restock Alert)</span>
            </div>
          }
          subtitle="Produk dengan stok <= batas minimum"
        >
          {lowStockProducts.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              Semua produk stoknya aman!
            </div>
          ) : (
            <div className="space-y-3">
              {lowStockProducts.map(p => (
                <div
                  key={p.id}
                  className="p-3 rounded-xl border border-amber-200 bg-amber-50/50 flex items-center justify-between"
                >
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">{p.name}</h5>
                    <p className="text-[10px] text-slate-500">
                      Stok: <strong className="text-rose-600 font-extrabold">{p.currentStock} {p.unit}</strong> (Min: {p.minStock})
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    className="text-[10px] px-2 py-1"
                    onClick={() => onRestockClick(p)}
                  >
                    Restock
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Recent Transactions Section */}
      <Card
        title="Transaksi Terbaru"
        subtitle="Daftar 5 aktivitas kasir terakhir"
        action={
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate('sales')}
            icon={<ArrowRight className="h-4 w-4" />}
          >
            Lihat Semua
          </Button>
        }
      >
        <div className="divide-y divide-slate-100">
          {transactions.slice(0, 5).map(tx => (
            <div key={tx.id} className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-100 text-slate-600">
                  <Receipt className="h-4 w-4" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-900">{tx.invoiceNumber}</h5>
                  <p className="text-[10px] text-slate-500">
                    {tx.cashierName} • {formatDate(tx.createdAt)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-extrabold text-slate-900">{formatCurrency(tx.totalAmount)}</p>
                <Badge variant={tx.paymentMethod === 'QRIS' ? 'brand' : 'neutral'} size="sm">
                  {tx.paymentMethod}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
