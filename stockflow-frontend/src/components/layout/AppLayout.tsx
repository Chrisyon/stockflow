import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface AppLayoutProps {
  children: React.ReactNode;
  activePage: string;
  setActivePage: (page: string) => void;
  lowStockCount: number;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  activePage,
  setActivePage,
  lowStockCount,
}) => {
  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800">
      <Sidebar activePage={activePage} setActivePage={setActivePage} lowStockCount={lowStockCount} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header activePage={activePage} setActivePage={setActivePage} lowStockCount={lowStockCount} />
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};
