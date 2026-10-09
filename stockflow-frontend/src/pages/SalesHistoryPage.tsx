import React, { useState } from 'react';
import { Transaction } from '../types';
import { Table, Column } from '../components/common/Table';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Receipt, Eye, Printer, Search } from 'lucide-react';

interface SalesHistoryPageProps {
  transactions: Transaction[];
}

export const SalesHistoryPage: React.FC<SalesHistoryPageProps> = ({ transactions }) => {
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const columns: Column<Transaction>[] = [
    {
      header: 'No. Invoice',
      accessor: item => (
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-slate-100 text-slate-600">
            <Receipt className="h-4 w-4" />
          </div>
          <div>
            <h5 className="font-extrabold text-slate-900">{item.invoiceNumber}</h5>
            <span className="text-[10px] text-slate-400">Kasir: {item.cashierName}</span>
          </div>
        </div>
      ),
      sortable: true,
      sortKey: 'invoiceNumber',
    },
    {
      header: 'Tanggal & Waktu',
      accessor: item => <span className="text-slate-600 font-medium">{formatDate(item.createdAt)}</span>,
      sortable: true,
      sortKey: 'createdAt',
    },
    {
      header: 'Metode Bayar',
      accessor: item => {
        const variants: Record<string, 'brand' | 'success' | 'info' | 'neutral'> = {
          CASH: 'neutral',
          QRIS: 'brand',
          DEBIT: 'info',
          TRANSFER: 'success',
        };
        return <Badge variant={variants[item.paymentMethod] || 'neutral'} size="sm">{item.paymentMethod}</Badge>;
      },
    },
    {
      header: 'Total Pembayaran',
      accessor: item => <span className="font-extrabold text-slate-900 text-sm">{formatCurrency(item.totalAmount)}</span>,
      sortable: true,
      sortKey: 'totalAmount',
    },
    {
      header: 'Jumlah Item',
      accessor: item => {
        const qty = item.items.reduce((s, i) => s + i.quantity, 0);
        return <span className="text-slate-600 font-bold">{qty} Item</span>;
      },
    },
    {
      header: 'Aksi',
      accessor: (item: Transaction) => (
        <Button
          variant="outline"
          size="sm"
          icon={<Eye className="h-3.5 w-3.5" />}
          onClick={e => {
            e.stopPropagation();
            setSelectedTx(item);
          }}
        >
          Detail Struk
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Table
        columns={columns}
        data={transactions}
        searchable={true}
        searchPlaceholder="Cari berdasarkan invoice number atau kasir..."
        searchFields={['invoiceNumber', 'cashierName', 'paymentMethod']}
        emptyTitle="Belum Ada Transaksi"
        emptyDescription="Riwayat transaksi penjualan toko masih kosong."
      />

      {/* Detail Invoice Modal */}
      {selectedTx && (
        <Modal
          isOpen={!!selectedTx}
          onClose={() => setSelectedTx(null)}
          title={`Detail Transaksi ${selectedTx.invoiceNumber}`}
          subtitle={`Diproses oleh ${selectedTx.cashierName} pada ${formatDate(selectedTx.createdAt)}`}
          maxWidth="lg"
        >
          <div className="space-y-4">
            {/* Items Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 font-bold uppercase">
                  <tr>
                    <th className="px-3 py-2">Produk</th>
                    <th className="px-3 py-2 text-center">Harga Snapshot</th>
                    <th className="px-3 py-2 text-center">Qty</th>
                    <th className="px-3 py-2 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedTx.items.map((it, idx) => (
                    <tr key={idx}>
                      <td className="px-3 py-2.5 font-bold text-slate-800">{it.productName}</td>
                      <td className="px-3 py-2.5 text-center text-slate-500">{formatCurrency(it.sellingPrice)}</td>
                      <td className="px-3 py-2.5 text-center font-bold">{it.quantity}</td>
                      <td className="px-3 py-2.5 text-right font-extrabold text-slate-900">
                        {formatCurrency(it.subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs text-slate-700">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-semibold">{formatCurrency(selectedTx.subtotal)}</span>
              </div>
              {selectedTx.discountAmount > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>Diskon:</span>
                  <span>-{formatCurrency(selectedTx.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-black text-slate-900 pt-1 border-t border-slate-200">
                <span>Total Penjualan:</span>
                <span className="text-brand-700">{formatCurrency(selectedTx.totalAmount)}</span>
              </div>
              <div className="flex justify-between pt-1 text-slate-500">
                <span>Pembayaran ({selectedTx.paymentMethod}):</span>
                <span>{formatCurrency(selectedTx.paidAmount)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Kembalian:</span>
                <span>{formatCurrency(selectedTx.changeAmount)}</span>
              </div>
            </div>

            <div className="flex justify-between gap-3 pt-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedTx(null)}>
                Tutup
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={<Printer className="h-4 w-4" />}
                onClick={() => window.print()}
              >
                Cetak Ulang Struk
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
