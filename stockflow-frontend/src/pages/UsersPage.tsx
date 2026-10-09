import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { Table, Column } from '../components/common/Table';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { useAuth } from '../context/AuthContext';
import { formatDateOnly } from '../utils/formatters';
import { Users, Plus, ShieldCheck, UserCheck, UserX } from 'lucide-react';

interface UsersPageProps {
  users: User[];
  onAddUser: (user: Omit<User, 'id' | 'createdAt'>) => void;
  onToggleUserStatus: (userId: number) => void;
}

export const UsersPage: React.FC<UsersPageProps> = ({ users, onAddUser, onToggleUserStatus }) => {
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'ADMIN';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    fullName: '',
    role: 'CASHIER' as UserRole,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddUser({
      username: formData.username,
      email: formData.email,
      fullName: formData.fullName,
      role: formData.role,
      isActive: true,
    });
    setIsModalOpen(false);
    setFormData({ username: '', email: '', fullName: '', role: 'CASHIER' });
  };

  const columns: Column<User>[] = [
    {
      header: 'Nama Pengguna & Username',
      accessor: item => (
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs border border-slate-200">
            {item.fullName.charAt(0)}
          </div>
          <div>
            <h5 className="font-bold text-slate-900">{item.fullName}</h5>
            <span className="text-[10px] text-slate-400 font-mono">@{item.username}</span>
          </div>
        </div>
      ),
      sortable: true,
      sortKey: 'fullName',
    },
    {
      header: 'Email',
      accessor: item => <span className="text-slate-600 text-xs font-medium">{item.email}</span>,
    },
    {
      header: 'Role Akses',
      accessor: item => {
        const variants: Record<UserRole, 'brand' | 'success' | 'info'> = {
          ADMIN: 'brand',
          OWNER: 'success',
          CASHIER: 'info',
        };
        return <Badge variant={variants[item.role]} size="sm">{item.role}</Badge>;
      },
    },
    {
      header: 'Status Akun',
      accessor: item => (
        <Badge variant={item.isActive ? 'success' : 'danger'} size="sm">
          {item.isActive ? 'Aktif' : 'Non-Aktif'}
        </Badge>
      ),
    },
    {
      header: 'Tanggal Dibuat',
      accessor: item => <span className="text-slate-500 font-medium">{formatDateOnly(item.createdAt)}</span>,
    },
    ...(isAdmin
      ? [
          {
            header: 'Aksi',
            accessor: (item: User) => (
              <Button
                variant={item.isActive ? 'outline' : 'success'}
                size="sm"
                icon={item.isActive ? <UserX className="h-3.5 w-3.5" /> : <UserCheck className="h-3.5 w-3.5" />}
                onClick={() => onToggleUserStatus(item.id)}
              >
                {item.isActive ? 'Nonaktifkan' : 'Aktifkan'}
              </Button>
            ),
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-6">
      <Table
        columns={columns}
        data={users}
        searchable={true}
        searchPlaceholder="Cari pengguna berdasarkan nama atau username..."
        searchFields={['fullName', 'username', 'email', 'role']}
        emptyTitle="Tidak Ada Pengguna"
        emptyDescription="Daftar pengguna aplikasi belum tersedia."
        actionButton={
          isAdmin ? (
            <Button
              variant="primary"
              size="sm"
              icon={<Plus className="h-4 w-4" />}
              onClick={() => setIsModalOpen(true)}
            >
              Tambah User Baru
            </Button>
          ) : undefined
        }
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Tambah Pengguna Aplikasi Baru"
        subtitle="Berikan hak akses sesuai dengan peran staf toko"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nama Lengkap Staf"
            type="text"
            required
            placeholder="e.g. Andi Wijaya"
            value={formData.fullName}
            onChange={e => setFormData({ ...formData, fullName: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Username"
              type="text"
              required
              placeholder="e.g. andi_kasir"
              value={formData.username}
              onChange={e => setFormData({ ...formData, username: e.target.value })}
            />
            <Input
              label="Alamat Email"
              type="email"
              required
              placeholder="andi@stockflow.id"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <Select
            label="Role Access Permission"
            value={formData.role}
            onChange={e => setFormData({ ...formData, role: e.target.value as UserRole })}
            options={[
              { value: 'CASHIER', label: 'CASHIER — Akses Kasir POS & Riwayat Transaksi' },
              { value: 'ADMIN', label: 'ADMIN — Akses Penuh Kelola Produk, Stok & User' },
              { value: 'OWNER', label: 'OWNER — Akses Laporan Keuangan & Analytics Executive' },
            ]}
          />

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Tambah Pengguna
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
