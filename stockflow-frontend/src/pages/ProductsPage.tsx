import React, { useState } from 'react';
import { Product, Category } from '../types';
import { Table, Column } from '../components/common/Table';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { formatCurrency } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit, Trash2, AlertTriangle, ArrowUpDown } from 'lucide-react';

interface ProductsPageProps {
  products: Product[];
  categories: Category[];
  onAddProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (productId: number) => void;
}

export const ProductsPage: React.FC<ProductsPageProps> = ({
  products,
  categories,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
}) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    categoryId: categories[0]?.id || 1,
    costPrice: '',
    sellingPrice: '',
    currentStock: '',
    minStock: '5',
    unit: 'pcs',
  });

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      sku: `PRD-${Date.now().toString().slice(-6)}`,
      name: '',
      categoryId: categories[0]?.id || 1,
      costPrice: '',
      sellingPrice: '',
      currentStock: '10',
      minStock: '5',
      unit: 'pcs',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      sku: product.sku,
      name: product.name,
      categoryId: product.categoryId,
      costPrice: product.costPrice.toString(),
      sellingPrice: product.sellingPrice.toString(),
      currentStock: product.currentStock.toString(),
      minStock: product.minStock.toString(),
      unit: product.unit || 'pcs',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const categoryName = categories.find(c => c.id === Number(formData.categoryId))?.name || 'Umum';

    if (editingProduct) {
      onUpdateProduct({
        ...editingProduct,
        sku: formData.sku,
        name: formData.name,
        categoryId: Number(formData.categoryId),
        categoryName,
        costPrice: Number(formData.costPrice),
        sellingPrice: Number(formData.sellingPrice),
        currentStock: Number(formData.currentStock),
        minStock: Number(formData.minStock),
        unit: formData.unit,
        updatedAt: new Date().toISOString(),
      });
    } else {
      onAddProduct({
        sku: formData.sku,
        name: formData.name,
        categoryId: Number(formData.categoryId),
        categoryName,
        costPrice: Number(formData.costPrice),
        sellingPrice: Number(formData.sellingPrice),
        currentStock: Number(formData.currentStock),
        minStock: Number(formData.minStock),
        unit: formData.unit,
      });
    }
    setIsModalOpen(false);
  };

  const columns: Column<Product>[] = [
    {
      header: 'SKU & Nama Produk',
      accessor: item => (
        <div>
          <h5 className="font-bold text-slate-900">{item.name}</h5>
          <span className="text-[10px] font-mono text-slate-400 font-semibold">{item.sku}</span>
        </div>
      ),
      sortable: true,
      sortKey: 'name',
    },
    {
      header: 'Kategori',
      accessor: item => (
        <Badge variant="neutral" size="sm">
          {item.categoryName || 'General'}
        </Badge>
      ),
    },
    {
      header: 'Harga Modal (Cost)',
      accessor: item => <span className="text-slate-500 font-medium">{formatCurrency(item.costPrice)}</span>,
      sortable: true,
      sortKey: 'costPrice',
    },
    {
      header: 'Harga Jual (Selling)',
      accessor: item => <span className="font-bold text-slate-900">{formatCurrency(item.sellingPrice)}</span>,
      sortable: true,
      sortKey: 'sellingPrice',
    },
    {
      header: 'Margin / Profit',
      accessor: item => {
        const margin = item.sellingPrice - item.costPrice;
        return (
          <span className="text-xs font-bold text-emerald-600">
            +{formatCurrency(margin)}
          </span>
        );
      },
    },
    {
      header: 'Stok Saat Ini',
      accessor: item => {
        const isLow = item.currentStock <= item.minStock;
        return (
          <div className="flex items-center gap-1.5">
            <span className={`font-extrabold ${isLow ? 'text-rose-600' : 'text-slate-800'}`}>
              {item.currentStock} {item.unit}
            </span>
            {isLow && (
              <Badge variant="danger" size="sm">
                Min: {item.minStock}
              </Badge>
            )}
          </div>
        );
      },
      sortable: true,
      sortKey: 'currentStock',
    },
    ...(isAdmin
      ? [
          {
            header: 'Aksi',
            accessor: (item: Product) => (
              <div className="flex items-center gap-1">
                <button
                  onClick={e => {
                    e.stopPropagation();
                    handleOpenEditModal(item);
                  }}
                  className="p-1 text-slate-500 hover:text-brand-600 hover:bg-slate-100 rounded transition-colors"
                  title="Edit Produk"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    setDeleteTargetId(item.id);
                  }}
                  className="p-1 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                  title="Hapus Produk"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ),
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-6">
      <Table
        columns={columns}
        data={products}
        searchable={true}
        searchPlaceholder="Cari berdasarkan nama produk atau SKU..."
        searchFields={['name', 'sku']}
        emptyTitle="Tidak Ada Produk"
        emptyDescription="Katalog produk toko masih kosong. Tambahkan produk pertama Anda."
        actionButton={
          isAdmin ? (
            <Button
              variant="primary"
              size="sm"
              icon={<Plus className="h-4 w-4" />}
              onClick={handleOpenAddModal}
            >
              Tambah Produk Baru
            </Button>
          ) : undefined
        }
      />

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Edit Master Produk' : 'Tambah Produk Baru'}
        subtitle="Isi informasi lengkap produk untuk sistem inventori"
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="SKU Produk (Unik)"
              type="text"
              required
              value={formData.sku}
              onChange={e => setFormData({ ...formData, sku: e.target.value })}
            />
            <Input
              label="Nama Produk"
              type="text"
              required
              placeholder="e.g. Berkas Ramos 5kg"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Kategori Produk"
              value={formData.categoryId}
              onChange={e => setFormData({ ...formData, categoryId: Number(e.target.value) })}
              options={categories.map(c => ({ value: c.id, label: c.name }))}
            />
            <Input
              label="Satuan Unit"
              type="text"
              required
              placeholder="pcs, kg, botol, karung"
              value={formData.unit}
              onChange={e => setFormData({ ...formData, unit: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Harga Modal (Rp)"
              type="number"
              required
              min="0"
              placeholder="e.g. 50000"
              value={formData.costPrice}
              onChange={e => setFormData({ ...formData, costPrice: e.target.value })}
            />
            <Input
              label="Harga Jual (Rp)"
              type="number"
              required
              min="0"
              placeholder="e.g. 65000"
              value={formData.sellingPrice}
              onChange={e => setFormData({ ...formData, sellingPrice: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Stok Awal"
              type="number"
              required
              min="0"
              value={formData.currentStock}
              onChange={e => setFormData({ ...formData, currentStock: e.target.value })}
            />
            <Input
              label="Batas Minimum Stok (Alert)"
              type="number"
              required
              min="1"
              value={formData.minStock}
              onChange={e => setFormData({ ...formData, minStock: e.target.value })}
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" size="sm" type="submit">
              {editingProduct ? 'Simpan Perubahan' : 'Tambah Produk'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={() => {
          if (deleteTargetId) onDeleteProduct(deleteTargetId);
          setDeleteTargetId(null);
        }}
        title="Hapus Produk"
        message="Apakah Anda yakin ingin menghapus produk ini dari katalog? Data riwayat transaksi lama tidak akan hilang."
      />
    </div>
  );
};
