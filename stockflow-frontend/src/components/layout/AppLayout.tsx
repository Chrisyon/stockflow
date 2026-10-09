import React, { useState } from 'react';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800 relative overflow-x-hidden">
      {/* Mobile Drawer Overlay Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 md:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar (Responsive Desktop & Mobile Drawer) */}
      <Sidebar
        activePage={activePage}
        setActivePage={(page) => {
          setActivePage(page);
          setIsMobileMenuOpen(false);
        }}
        lowStockCount={lowStockCount}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <Header
          activePage={activePage}
          setActivePage={setActivePage}
          lowStockCount={lowStockCount}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />
        <main className="flex-1 p-3 sm:p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};

