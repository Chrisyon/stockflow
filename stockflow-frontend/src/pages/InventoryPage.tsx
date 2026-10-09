import React, { useState } from 'react';
import { Product, StockMovement, Supplier, MovementType } from '../types';
import { Table, Column } from '../components/common/Table';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { formatDate } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';
import { Sliders, Truck } from 'lucide-react';

interface InventoryPageProps {
  products: Product[];
  suppliers: Supplier[];
  stockMovements: StockMovement[];
  onAddStockMovement: (movement: Omit<StockMovement, 'id' | 'createdAt'>) => void;
  selectedRestockProduct?: Product | null;
  onClearRestockProduct?: () => void;
}

export const InventoryPage: React.FC<InventoryPageProps> = ({
  products,
  suppliers,
  stockMovements,
  onAddStockMovement,
  selectedRestockProduct,
  onClearRestockProduct,
}) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [activeTab, setActiveTab] = useState<'ALL' | MovementType>('ALL');
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(!!selectedRestockProduct);

  // Adjustment Form State
  const [adjProductId, setAdjProductId] = useState<number>(products[0]?.id || 1);
  const [adjType, setAdjType] = useState<'IN' | 'OUT' | 'ADJUSTMENT'>('ADJUSTMENT');
  const [adjQty, setAdjQty] = useState<string>('1');
  const [adjNotes, setAdjNotes] = useState<string>('');

  // Restock Form State
  const [restockProductId, setRestockProductId] = useState<number>(
    selectedRestockProduct?.id || products[0]?.id || 1
  );
  const [restockSupplierId, setRestockSupplierId] = useState<number>(suppliers[0]?.id || 1);
  const [restockQty, setRestockQty] = useState<string>('20');
  const [restockNotes, setRestockNotes] = useState<string>('');

  const filteredMovements = stockMovements.filter(m => {
    const type = m.movementType || m.type;
    if (activeTab === 'ALL') return true;
    return type === activeTab;
  });

  const handleAdjustmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const product = products.find(p => p.id === Number(adjProductId));
    if (!product) return;

    const qty = Number(adjQty);
    const finalQty = adjType === 'OUT' ? -Math.abs(qty) : Math.abs(qty);

    onAddStockMovement({
      productId: product.id,
      productName: product.name,
      productSku: product.sku,
      movementType: adjType,
      type: adjType,
      quantity: finalQty,
      referenceNumber: `ADJ-${Date.now().toString().slice(-6)}`,
      notes: adjNotes || 'Penyesuaian stok manual',
      createdBy: user?.fullName || 'Admin',
    });

    setIsAdjustmentModalOpen(false);
    setAdjNotes('');
  };

  const handleRestockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const product = products.find(p => p.id === Number(restockProductId));
    const supplier = suppliers.find(s => s.id === Number(restockSupplierId));
    if (!product) return;

    onAddStockMovement({
      productId: product.id,
      productName: product.name,
      productSku: product.sku,
      movementType: 'IN',
      type: 'IN',
      quantity: Math.abs(Number(restockQty)),
      referenceNumber: `RESTOCK-${Date.now().toString().slice(-6)}`,
      notes: `Restock dari supplier ${supplier?.name || ''}. ${restockNotes}`,
      createdBy: user?.fullName || 'Admin',
    });

    setIsRestockModalOpen(false);
    if (onClearRestockProduct) onClearRestockProduct();
    setRestockNotes('');
  };

  const columns: Column<StockMovement>[] = [
    {
      header: 'Waktu Perubahan',
      accessor: item => <span className="text-slate-500 font-medium">{formatDate(item.createdAt)}</span>,
      sortable: true,
      sortKey: 'createdAt',
    },
    {
      header: 'Produk & SKU',
      accessor: item => (
        <div>
          <h5 className="font-bold text-slate-900">{item.productName}</h5>
          <span className="text-[10px] font-mono text-slate-400 font-semibold">{item.productSku}</span>
        </div>
      ),
    },
    {
      header: 'Jenis Movement',
      accessor: item => {
        const type = item.movementType || item.type || 'IN';
        const badgeVariants: Record<MovementType, 'success' | 'danger' | 'warning' | 'brand'> = {
          IN: 'success',
          OUT: 'danger',
          ADJUSTMENT: 'warning',
          SALE: 'brand',
        };
        return <Badge variant={badgeVariants[type]} size="sm">{type}</Badge>;
      },
    },
    {
      header: 'Jumlah Qty',
      accessor: item => {
        const isPositive = item.quantity > 0;
        return (
          <span className={`font-black text-sm ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
            {isPositive ? `+${item.quantity}` : item.quantity}
          </span>
        );
      },
      sortable: true,
      sortKey: 'quantity',
    },
    {
      header: 'Referensi / Invoice',
      accessor: item => (
        <span className="font-mono text-xs text-slate-600 font-semibold">
          {item.referenceNumber || '-'}
        </span>
      ),
    },
    {
      header: 'Catatan & Petugas',
      accessor: item => (
        <div>
          <p className="text-slate-700 text-xs">{item.notes}</p>
          <span className="text-[10px] text-slate-400">Oleh: {item.createdBy || item.createdByName}</span>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Actions & Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        {/* Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
          {(['ALL', 'IN', 'OUT', 'ADJUSTMENT', 'SALE'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                activeTab === tab
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab === 'ALL' ? 'Semua Movement' : tab}
            </button>
          ))}
        </div>

        {/* Action Buttons (Admin Only) */}
        {isAdmin && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              icon={<Sliders className="h-4 w-4 text-amber-600" />}
              onClick={() => setIsAdjustmentModalOpen(true)}
            >
              Stock Adjustment
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<Truck className="h-4 w-4" />}
              onClick={() => setIsRestockModalOpen(true)}
            >
              Catat Restock Stok
            </Button>
          </div>
        )}
      </div>

      {/* Movements Table */}
      <Table
        columns={columns}
        data={filteredMovements}
        searchable={true}
        searchPlaceholder="Cari riwayat stok berdasarkan nama produk atau invoice..."
        searchFields={['productName', 'productSku', 'referenceNumber', 'notes']}
        emptyTitle="Tidak Ada Riwayat Stok"
        emptyDescription="Belum ada catatan aktivitas perubahan stok untuk filter ini."
      />

      {/* Stock Adjustment Modal */}
      <Modal
        isOpen={isAdjustmentModalOpen}
        onClose={() => setIsAdjustmentModalOpen(false)}
        title="Stock Adjustment Manual"
        subtitle="Penyesuaian stok fisik akibat kerusakan, barang hilang, atau opname"
      >
        <form onSubmit={handleAdjustmentSubmit} className="space-y-4">
          <Select
            label="Pilih Produk"
            value={adjProductId}
            onChange={e => setAdjProductId(Number(e.target.value))}
            options={products.map(p => ({
              value: p.id,
              label: `${p.name} (Stok Saat Ini: ${p.currentStock} ${p.unit})`,
            }))}
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Tipe Penyesuaian"
              value={adjType}
              onChange={e => setAdjType(e.target.value as 'IN' | 'OUT' | 'ADJUSTMENT')}
              options={[
                { value: 'ADJUSTMENT', label: 'Penyesuaian Opname (+/-)' },
                { value: 'OUT', label: 'Stok Keluar / Rusak (-)' },
                { value: 'IN', label: 'Stok Masuk (+)' },
              ]}
            />
            <Input
              label="Jumlah Qty"
              type="number"
              required
              min="1"
              value={adjQty}
              onChange={e => setAdjQty(e.target.value)}
            />
          </div>

          <Input
            label="Catatan / Alasan Adjustment"
            type="text"
            required
            placeholder="e.g. Barang kedaluwarsa, kemasan rusak"
            value={adjNotes}
            onChange={e => setAdjNotes(e.target.value)}
          />

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsAdjustmentModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Simpan Adjustment
            </Button>
          </div>
        </form>
      </Modal>

      {/* Restock Modal */}
      <Modal
        isOpen={isRestockModalOpen}
        onClose={() => {
          setIsRestockModalOpen(false);
          if (onClearRestockProduct) onClearRestockProduct();
        }}
        title="Catat Stok Masuk (Restock Supplier)"
        subtitle="Mencatat penerimaan barang dari distributor/supplier"
      >
        <form onSubmit={handleRestockSubmit} className="space-y-4">
          <Select
            label="Pilih Produk"
            value={restockProductId}
            onChange={e => setRestockProductId(Number(e.target.value))}
            options={products.map(p => ({
              value: p.id,
              label: `${p.name} (Stok: ${p.currentStock} ${p.unit})`,
            }))}
          />

          <Select
            label="Pilih Supplier Distributor"
            value={restockSupplierId}
            onChange={e => setRestockSupplierId(Number(e.target.value))}
            options={suppliers.map(s => ({
              value: s.id,
              label: `${s.name} (${s.contactPerson})`,
            }))}
          />

          <Input
            label="Jumlah Barang Diterima (Qty)"
            type="number"
            required
            min="1"
            value={restockQty}
            onChange={e => setRestockQty(e.target.value)}
          />

          <Input
            label="Catatan Tambahan"
            type="text"
            placeholder="e.g. Surat Jalan No. SJ-882"
            value={restockNotes}
            onChange={e => setRestockNotes(e.target.value)}
          />

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => {
                setIsRestockModalOpen(false);
                if (onClearRestockProduct) onClearRestockProduct();
              }}
            >
              Batal
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Simpan Restock
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
