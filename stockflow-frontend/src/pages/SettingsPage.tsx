import React, { useState } from 'react';
import { StoreSettings } from '../types';
import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Store, Receipt, Bell, Save, CheckCircle } from 'lucide-react';

interface SettingsPageProps {
  settings: StoreSettings;
  onSaveSettings: (newSettings: StoreSettings) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ settings, onSaveSettings }) => {
  const [formData, setFormData] = useState<StoreSettings>({ ...settings });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-emerald-600" />
          Pengaturan toko berhasil diperbarui!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Store Profile Settings */}
        <Card
          title={
            <div className="flex items-center gap-2">
              <Store className="h-5 w-5 text-brand-600" />
              <span>Profil Toko & Informasi Umum</span>
            </div>
          }
          subtitle="Identitas toko yang akan tercetak di dokumen dan laporan"
        >
          <div className="space-y-4">
            <Input
              label="Nama Toko / Usaha"
              type="text"
              required
              value={formData.storeName}
              onChange={e => setFormData({ ...formData, storeName: e.target.value })}
            />

            <Input
              label="Alamat Toko Lengkap"
              type="text"
              required
              value={formData.storeAddress}
              onChange={e => setFormData({ ...formData, storeAddress: e.target.value })}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nomor Telepon Toko"
                type="text"
                required
                value={formData.storePhone}
                onChange={e => setFormData({ ...formData, storePhone: e.target.value })}
              />
              <Input
                label="Email Toko"
                type="email"
                required
                value={formData.storeEmail}
                onChange={e => setFormData({ ...formData, storeEmail: e.target.value })}
              />
            </div>
          </div>
        </Card>

        {/* Receipt & Alert Configuration */}
        <Card
          title={
            <div className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-brand-600" />
              <span>Konfigurasi Struk & Sistem Inventori</span>
            </div>
          }
          subtitle="Pengaturan cetak struk kasir dan pemberitahuan stok"
        >
          <div className="space-y-4">
            <Input
              label="Pesan Footer Struk Kasir"
              type="text"
              required
              placeholder="e.g. Terima kasih telah berbelanja di toko kami!"
              value={formData.receiptFooter}
              onChange={e => setFormData({ ...formData, receiptFooter: e.target.value })}
            />

            <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-amber-500" />
                <div>
                  <h5 className="text-xs font-bold text-slate-900">Peringatan Stok Menipis</h5>
                  <p className="text-[11px] text-slate-500">Tampilkan notifikasi otomatis saat produk mencukupi stok minimum</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={formData.enableLowStockAlert}
                onChange={e => setFormData({ ...formData, enableLowStockAlert: e.target.checked })}
                className="h-5 w-5 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
              />
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button variant="primary" size="md" type="submit" icon={<Save className="h-4 w-4" />}>
            Simpan Perubahan Pengaturan
          </Button>
        </div>
      </form>
    </div>
  );
};
