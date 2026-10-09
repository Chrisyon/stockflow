import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { Store, ShieldCheck, Lock, User as UserIcon, ArrowRight } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { ErrorAlert } from '../components/common/ErrorAlert';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const { loginWithCredentials, loginDemoRole, isLoading, error } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setLocalError('Username dan password harus diisi');
      return;
    }
    setLocalError(null);

    try {
      await loginWithCredentials({ username, password });
      onLoginSuccess();
    } catch (err: unknown) {
      // Fallback for offline/demo: if credentials match demo default, log in as admin
      if (username === 'admin' && password === 'password123') {
        loginDemoRole('ADMIN');
        onLoginSuccess();
      } else {
        setLocalError(err instanceof Error ? err.message : 'Gagal terhubung ke API backend');
      }
    }
  };

  const handleQuickDemo = (role: UserRole) => {
    loginDemoRole(role);
    onLoginSuccess();
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic Background Glow Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 z-10">
        {/* Header */}
        <div className="p-8 bg-slate-900 text-white text-center border-b border-slate-800 relative">
          <div className="inline-flex p-3 rounded-2xl bg-brand-600 shadow-lg shadow-brand-500/30 mb-3">
            <Store className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">StockFlow</h1>
          <p className="text-xs text-slate-400 font-medium mt-1">
            Inventory & Sales Management System
          </p>
        </div>

        {/* Body */}
        <div className="p-8">
          {(error || localError) && (
            <ErrorAlert message={localError || error || ''} onDismiss={() => setLocalError(null)} />
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Username"
              type="text"
              placeholder="admin / kasir1 / owner"
              value={username}
              onChange={e => setUsername(e.target.value)}
              icon={<UserIcon className="h-4 w-4" />}
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              icon={<Lock className="h-4 w-4" />}
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full py-2.5 mt-2 font-bold"
              isLoading={isLoading}
              icon={<ArrowRight className="h-4 w-4" />}
            >
              Masuk ke Aplikasi
            </Button>
          </form>

          {/* Quick Demo Role Switcher for Portfolio Reviewers */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-semibold mb-3">
              <ShieldCheck className="h-3.5 w-3.5 text-brand-600" />
              Demo Mode Login Cepat
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Pilih role di bawah untuk mencoba aplikasi langsung:
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('ADMIN')}
                className="py-2 px-3 text-xs font-bold rounded-lg border border-brand-200 bg-brand-50 text-brand-700 hover:bg-brand-100 transition-colors"
              >
                ADMIN
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('CASHIER')}
                className="py-2 px-3 text-xs font-bold rounded-lg border border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100 transition-colors"
              >
                KASIR
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('OWNER')}
                className="py-2 px-3 text-xs font-bold rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
              >
                OWNER
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-3 bg-slate-50 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-400 font-medium">
            StockFlow v1.0 • Portfolio Project for Full-stack / Backend Developer
          </p>
        </div>
      </div>
    </div>
  );
};
