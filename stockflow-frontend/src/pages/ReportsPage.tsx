import React, { useState } from 'react';
import { Transaction, Product } from '../types';
import { formatCurrency } from '../utils/formatters';
import { exportToCsv } from '../utils/exportCsv';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Table, Column } from '../components/common/Table';
import { Download, TrendingUp, DollarSign, Award, Calendar } from 'lucide-react';

interface ReportsPageProps {
  transactions: Transaction[];
  products: Product[];
}

export const ReportsPage: React.FC<ReportsPageProps> = ({ transactions, products }) => {
  const [dateRange, setDateRange] = useState<'TODAY' | 'WEEK' | 'MONTH'>('MONTH');

  // Executive Metrics
  const totalOmset = transactions.reduce((sum, t) => sum + t.totalAmount, 0);

  const totalCost = transactions.reduce((sum, t) => {
    return sum + t.items.reduce((cSum, item) => cSum + item.costPrice * item.quantity, 0);
  }, 0);

  const totalGrossProfit = totalOmset - totalCost;
  const avgBasketSize = transactions.length > 0 ? totalOmset / transactions.length : 0;

  // Best Selling Products Aggregation
  const productSalesMap: Record<string, { name: string; sku: string; qty: number; totalRev: number }> = {};

  transactions.forEach(tx => {
    tx.items.forEach(it => {
      if (!productSalesMap[it.productSku]) {
        productSalesMap[it.productSku] = {
          name: it.productName,
          sku: it.productSku,
          qty: 0,
          totalRev: 0,
        };
      }
      productSalesMap[it.productSku].qty += it.quantity;
      productSalesMap[it.productSku].totalRev += it.subtotal;
    });
  });

  const topSellingList = Object.values(productSalesMap)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  const handleExportCsv = () => {
    const exportRows = transactions.map(t => ({
      InvoiceNumber: t.invoiceNumber,
      Tanggal: t.createdAt,
      Kasir: t.cashierName,
      MetodePembayaran: t.paymentMethod,
      Subtotal: t.subtotal,
      Diskon: t.discountAmount,
      TotalAmount: t.totalAmount,
      PaidAmount: t.paidAmount,
      ChangeAmount: t.changeAmount,
    }));
    exportToCsv('Laporan_Penjualan_StockFlow', exportRows);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
          {(['TODAY', 'WEEK', 'MONTH'] as const).map(range => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                dateRange === range
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {range === 'TODAY' ? 'Hari Ini' : range === 'WEEK' ? '7 Hari Terakhir' : 'Bulan Ini'}
            </button>
          ))}
        </div>

        <Button
          variant="success"
          size="sm"
          icon={<Download className="h-4 w-4" />}
          onClick={handleExportCsv}
        >
          Ekspor Laporan Penjualan (CSV)
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Omset Penjualan</p>
          <h3 className="text-2xl font-black text-slate-900 mt-1">{formatCurrency(totalOmset)}</h3>
          <p className="text-[11px] text-slate-400 mt-1">{transactions.length} Transaksi Terproses</p>
        </Card>

        <Card>
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Estimasi Gross Profit</p>
          <h3 className="text-2xl font-black text-emerald-600 mt-1">{formatCurrency(totalGrossProfit)}</h3>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">Margin Keuntungan Kotor</p>
        </Card>

        <Card>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Rata-rata Basket Trx</p>
          <h3 className="text-2xl font-black text-slate-900 mt-1">{formatCurrency(avgBasketSize)}</h3>
          <p className="text-[11px] text-slate-400 mt-1">Nilai Rata-rata per Konsumen</p>
        </Card>

        <Card>
          <p className="text-xs font-bold uppercase tracking-wider text-brand-700">Item Terjual</p>
          <h3 className="text-2xl font-black text-brand-600 mt-1">
            {transactions.reduce((sum, t) => sum + t.items.reduce((s, i) => s + i.quantity, 0), 0)} Unit
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">Total Unit Keluar POS</p>
        </Card>
      </div>

      {/* Top 5 Selling Products */}
      <Card
        title={
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-500" />
            <span>Top 5 Produk Terlaris (Best Sellers)</span>
          </div>
        }
        subtitle="Berdasarkan kuantitas unit yang terjual di kasir"
      >
        <div className="space-y-4">
          {topSellingList.map((item, idx) => {
            const maxQty = topSellingList[0]?.qty || 1;
            const percentage = Math.round((item.qty / maxQty) * 100);

            return (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-900">
                    {idx + 1}. {item.name} <span className="text-slate-400 font-mono text-[10px]">({item.sku})</span>
                  </span>
                  <span className="text-brand-700">{item.qty} Terjual ({formatCurrency(item.totalRev)})</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${percentage}%` }}
                    className="bg-brand-600 h-full rounded-full transition-all duration-500"
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};
