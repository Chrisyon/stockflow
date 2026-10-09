import React, { useState } from 'react';
import { Product, Category, Transaction, PaymentMethod } from '../types';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Printer,
  CheckCircle,
  QrCode,
  Banknote,
  Percent,
} from 'lucide-react';

interface PosPageProps {
  products: Product[];
  categories: Category[];
  onCompleteTransaction: (newTx: Omit<Transaction, 'id' | 'createdAt'>) => void;
}

export const PosPage: React.FC<PosPageProps> = ({
  products,
  categories,
  onCompleteTransaction,
}) => {
  const { user } = useAuth();
  const {
    items,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    discountAmount,
    setDiscountAmount,
    subtotal,
    totalAmount,
    totalItemCount,
  } = useCart();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | 'ALL'>('ALL');

  // Payment Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [paidAmount, setPaidAmount] = useState<string>('');

  // Receipt Modal State
  const [completedTx, setCompletedTx] = useState<Transaction | null>(null);

  // Filter Catalog Products
  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategoryId === 'ALL' || p.categoryId === selectedCategoryId;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleOpenPayment = () => {
    if (items.length === 0) return;
    setPaidAmount(totalAmount.toString());
    setIsPaymentModalOpen(true);
  };

  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const numericPaid = Number(paidAmount);
    if (numericPaid < totalAmount) return;

    const invoiceNumber = `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(
      1000 + Math.random() * 9000
    )}`;

    const newTx: Transaction = {
      id: Date.now(),
      invoiceNumber,
      cashierId: user?.id || 2,
      cashierName: user?.fullName || 'Kasir Toko',
      subtotal,
      discountAmount,
      totalAmount,
      paidAmount: numericPaid,
      changeAmount: numericPaid - totalAmount,
      paymentMethod,
      createdAt: new Date().toISOString(),
      items: items.map((item, idx) => ({
        id: idx + 1,
        productId: item.product.id,
        productName: item.product.name,
        productSku: item.product.sku,
        costPrice: item.product.costPrice,
        sellingPrice: item.product.sellingPrice,
        quantity: item.quantity,
        subtotal: item.subtotal,
      })),
    };

    onCompleteTransaction(newTx);
    setCompletedTx(newTx);
    clearCart();
    setIsPaymentModalOpen(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-6rem)]">
      {/* Product Catalog Grid (8 Cols) */}
      <div className="lg:col-span-7 xl:col-span-8 flex flex-col h-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Search & Filter Header */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 space-y-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari produk cepat berdasarkan nama atau scan SKU..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all shadow-2xs"
            />
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setSelectedCategoryId('ALL')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition-all ${
                selectedCategoryId === 'ALL'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-200/70 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Semua Kategori
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryId(cat.id)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition-all ${
                  selectedCategoryId === cat.id
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="flex-1 p-4 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
          {filteredProducts.map(product => {
            const isOutOfStock = product.currentStock <= 0;
            return (
              <div
                key={product.id}
                onClick={() => !isOutOfStock && addToCart(product)}
                className={`p-3 rounded-xl border transition-all flex flex-col justify-between select-none ${
                  isOutOfStock
                    ? 'bg-slate-50 border-slate-200 opacity-50 cursor-not-allowed'
                    : 'bg-white border-slate-200 hover:border-brand-500 hover:shadow-md cursor-pointer active:scale-98'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <span className="text-[10px] font-mono font-bold text-slate-400">{product.sku}</span>
                    <Badge variant={isOutOfStock ? 'danger' : product.currentStock <= product.minStock ? 'warning' : 'neutral'} size="sm">
                      {isOutOfStock ? 'Habis' : `Stok: ${product.currentStock}`}
                    </Badge>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug">{product.name}</h4>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-extrabold text-brand-700">{formatCurrency(product.sellingPrice)}</span>
                  <div className="p-1 rounded-md bg-brand-50 text-brand-600 hover:bg-brand-600 hover:text-white transition-colors">
                    <Plus className="h-3.5 w-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cart & Checkout Sidebar (4-5 Cols) */}
      <div className="lg:col-span-5 xl:col-span-4 flex flex-col h-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Cart Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-brand-400" />
            <h3 className="text-sm font-bold">Keranjang POS</h3>
          </div>
          {items.length > 0 && (
            <button
              onClick={clearCart}
              className="text-[11px] text-rose-300 hover:text-white transition-colors font-semibold"
            >
              Kosongkan
            </button>
          )}
        </div>

        {/* Cart Item List */}
        <div className="flex-1 p-4 overflow-y-auto divide-y divide-slate-100">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12 text-slate-400">
              <ShoppingCart className="h-12 w-12 stroke-1 mb-2 opacity-50" />
              <p className="text-xs font-bold">Keranjang Kosong</p>
              <p className="text-[11px] text-slate-400 max-w-[200px] mt-1">
                Klik produk di sebelah kiri untuk menambahkan ke pesanan
              </p>
            </div>
          ) : (
            items.map(item => (
              <div key={item.product.id} className="py-3 flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h5 className="text-xs font-bold text-slate-900 truncate">{item.product.name}</h5>
                  <p className="text-[11px] text-slate-500">
                    {formatCurrency(item.product.sellingPrice)} x {item.quantity}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="p-1 text-slate-600 hover:bg-slate-200 transition-colors"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="px-2 text-xs font-bold text-slate-900 min-w-[20px] text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="p-1 text-slate-600 hover:bg-slate-200 transition-colors"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <span className="text-xs font-extrabold text-slate-900 w-20 text-right">
                    {formatCurrency(item.subtotal)}
                  </span>
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Calculation Summary Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-3">
          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal ({totalItemCount} Item)</span>
              <span className="font-semibold">{formatCurrency(subtotal)}</span>
            </div>

            {/* Discount Row */}
            <div className="flex justify-between items-center text-slate-600 pt-1">
              <span className="flex items-center gap-1">
                <Percent className="h-3 w-3 text-amber-600" /> Diskon Trx
              </span>
              <input
                type="number"
                min="0"
                placeholder="Rp 0"
                value={discountAmount || ''}
                onChange={e => setDiscountAmount(Math.max(0, Number(e.target.value)))}
                className="w-24 px-2 py-0.5 text-right text-xs rounded border border-slate-300 bg-white font-semibold focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div className="flex justify-between text-slate-900 pt-2 border-t border-slate-200">
              <span className="text-sm font-bold">Total Pembayaran</span>
              <span className="text-lg font-black text-brand-700">{formatCurrency(totalAmount)}</span>
            </div>
          </div>

          <Button
            variant="primary"
            size="lg"
            className="w-full py-3 font-extrabold tracking-wide"
            disabled={items.length === 0}
            onClick={handleOpenPayment}
            icon={<CreditCard className="h-5 w-5" />}
          >
            Bayar Penjualan ({formatCurrency(totalAmount)})
          </Button>
        </div>
      </div>

      {/* Payment Processing Modal */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title="Pembayaran Transaksi Kasir"
        subtitle={`Total Tagihan: ${formatCurrency(totalAmount)}`}
      >
        <form onSubmit={handleProcessPayment} className="space-y-5">
          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Metode Pembayaran
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'CASH', label: 'Tunai (Cash)', icon: <Banknote className="h-4 w-4" /> },
                { id: 'QRIS', label: 'QRIS', icon: <QrCode className="h-4 w-4" /> },
                { id: 'DEBIT', label: 'Kartu Debit', icon: <CreditCard className="h-4 w-4" /> },
                { id: 'TRANSFER', label: 'Transfer Bank', icon: <CreditCard className="h-4 w-4" /> },
              ].map(m => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPaymentMethod(m.id as PaymentMethod)}
                  className={`p-3 rounded-xl border flex items-center gap-2 text-xs font-bold transition-all ${
                    paymentMethod === m.id
                      ? 'border-brand-600 bg-brand-50 text-brand-700 shadow-xs ring-2 ring-brand-200'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {m.icon}
                  <span>{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Amount Paid Input & Quick Buttons */}
          <div className="space-y-2">
            <Input
              label="Jumlah Uang Diterima (Rp)"
              type="number"
              required
              min={totalAmount}
              value={paidAmount}
              onChange={e => setPaidAmount(e.target.value)}
            />

            {/* Quick Money Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPaidAmount(totalAmount.toString())}
                className="px-2.5 py-1 text-[11px] font-bold rounded-lg border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700"
              >
                Uang Pas ({formatCurrency(totalAmount)})
              </button>
              <button
                type="button"
                onClick={() => setPaidAmount('50000')}
                className="px-2.5 py-1 text-[11px] font-bold rounded-lg border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700"
              >
                Rp 50.000
              </button>
              <button
                type="button"
                onClick={() => setPaidAmount('100000')}
                className="px-2.5 py-1 text-[11px] font-bold rounded-lg border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700"
              >
                Rp 100.000
              </button>
            </div>
          </div>

          {/* Change Display */}
          <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 flex justify-between items-center">
            <span className="text-xs font-bold text-slate-600">Kembalian:</span>
            <span className="text-base font-black text-emerald-600">
              {formatCurrency(Math.max(0, Number(paidAmount || 0) - totalAmount))}
            </span>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsPaymentModalOpen(false)}>
              Batal
            </Button>
            <Button variant="success" size="sm" type="submit" icon={<CheckCircle className="h-4 w-4" />}>
              Selesaikan Transaksi & Cetak
            </Button>
          </div>
        </form>
      </Modal>

      {/* Printable Receipt Modal */}
      {completedTx && (
        <Modal
          isOpen={!!completedTx}
          onClose={() => setCompletedTx(null)}
          title="Transaksi Penjualan Berhasil!"
          subtitle="Stok telah diperbarui secara otomatis di sistem"
          maxWidth="md"
        >
          <div className="space-y-4">
            {/* Visual Receipt View */}
            <div
              id="printable-receipt"
              className="p-6 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-slate-800 space-y-3"
            >
              <div className="text-center pb-3 border-b border-dashed border-slate-300">
                <h4 className="font-bold text-sm uppercase">Toko StockFlow Berkah</h4>
                <p className="text-[10px] text-slate-500">Jl. Merdeka No. 45, Jakarta Selatan</p>
                <p className="text-[10px] text-slate-500">No Invoice: {completedTx.invoiceNumber}</p>
                <p className="text-[10px] text-slate-500">{formatDate(completedTx.createdAt)}</p>
              </div>

              <div className="space-y-1.5">
                {completedTx.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between">
                    <div>
                      <span>{it.productName}</span>
                      <span className="block text-[10px] text-slate-500">
                        {it.quantity} x {formatCurrency(it.sellingPrice)}
                      </span>
                    </div>
                    <span className="font-bold">{formatCurrency(it.subtotal)}</span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-dashed border-slate-300 space-y-1">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(completedTx.subtotal)}</span>
                </div>
                {completedTx.discountAmount > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span>Diskon:</span>
                    <span>-{formatCurrency(completedTx.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-sm pt-1 border-t border-slate-300">
                  <span>TOTAL:</span>
                  <span>{formatCurrency(completedTx.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-[11px] pt-1">
                  <span>Bayar ({completedTx.paymentMethod}):</span>
                  <span>{formatCurrency(completedTx.paidAmount)}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span>Kembalian:</span>
                  <span>{formatCurrency(completedTx.changeAmount)}</span>
                </div>
              </div>

              <div className="text-center pt-3 border-t border-dashed border-slate-300 text-[10px] text-slate-500">
                Terima kasih atas kunjungan Anda!
              </div>
            </div>

            <div className="flex justify-between gap-3 pt-2">
              <Button variant="outline" size="sm" onClick={() => setCompletedTx(null)}>
                Tutup
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={<Printer className="h-4 w-4" />}
                onClick={() => window.print()}
              >
                Cetak Struk Transaksi
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
