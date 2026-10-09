import React, { useState } from 'react';
import { Supplier } from '../types';
import { Table, Column } from '../components/common/Table';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import { useAuth } from '../context/AuthContext';
import { Truck, Plus, Phone, Mail, MapPin } from 'lucide-react';

interface SuppliersPageProps {
  suppliers: Supplier[];
  onAddSupplier: (supplier: Omit<Supplier, 'id' | 'createdAt' | 'restockCount'>) => void;
}

export const SuppliersPage: React.FC<SuppliersPageProps> = ({ suppliers, onAddSupplier }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddSupplier(formData);
    setIsModalOpen(false);
    setFormData({ name: '', contactPerson: '', phone: '', email: '', address: '' });
  };

  const columns: Column<Supplier>[] = [
    {
      header: 'Nama Supplier / Distributor',
      accessor: item => (
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-sky-50 text-sky-600">
            <Truck className="h-4 w-4" />
          </div>
          <div>
            <h5 className="font-bold text-slate-900">{item.name}</h5>
            <span className="text-[10px] text-slate-400">Restock Record: {item.restockCount}x</span>
          </div>
        </div>
      ),
      sortable: true,
      sortKey: 'name',
    },
    {
      header: 'Contact Person',
      accessor: item => <span className="font-semibold text-slate-700">{item.contactPerson}</span>,
    },
    {
      header: 'Telepon & Email',
      accessor: item => (
        <div className="space-y-0.5">
          <p className="flex items-center gap-1 text-slate-700 font-medium">
            <Phone className="h-3 w-3 text-slate-400" /> {item.phone}
          </p>
          {item.email && (
            <p className="flex items-center gap-1 text-[10px] text-slate-400">
              <Mail className="h-3 w-3" /> {item.email}
            </p>
          )}
        </div>
      ),
    },
    {
      header: 'Alamat Gudang / Kantor',
      accessor: item => (
        <p className="flex items-start gap-1 text-slate-600 max-w-xs line-clamp-2">
          <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
          {item.address}
        </p>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Table
        columns={columns}
        data={suppliers}
        searchable={true}
        searchPlaceholder="Cari supplier atau kontak..."
        searchFields={['name', 'contactPerson', 'phone', 'address']}
        emptyTitle="Tidak Ada Supplier"
        emptyDescription="Belum ada data distributor/supplier yang terdaftar."
        actionButton={
          isAdmin ? (
            <Button
              variant="primary"
              size="sm"
              icon={<Plus className="h-4 w-4" />}
              onClick={() => setIsModalOpen(true)}
            >
              Tambah Supplier Baru
            </Button>
          ) : undefined
        }
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Tambah Distributor / Supplier"
        subtitle="Informasi distributor resmi untuk pencatatan restock barang"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nama Perusahaan / Distributor"
            type="text"
            required
            placeholder="e.g. PT Sembako Nusantara"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Contact Person (Sales)"
              type="text"
              required
              placeholder="e.g. Pak Hendro"
              value={formData.contactPerson}
              onChange={e => setFormData({ ...formData, contactPerson: e.target.value })}
            />
            <Input
              label="Nomor Telepon / WA"
              type="text"
              required
              placeholder="e.g. 0812-9988-7766"
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <Input
            label="Email (Opsional)"
            type="email"
            placeholder="orders@supplier.com"
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
          />

          <Input
            label="Alamat Gudang / Distributor"
            type="text"
            required
            placeholder="Jl. Raya Industri No. 12"
            value={formData.address}
            onChange={e => setFormData({ ...formData, address: e.target.value })}
          />

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Simpan Supplier
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
