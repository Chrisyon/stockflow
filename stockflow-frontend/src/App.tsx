import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProductsPage } from './pages/ProductsPage';
import { InventoryPage } from './pages/InventoryPage';
import { PosPage } from './pages/PosPage';
import { SalesHistoryPage } from './pages/SalesHistoryPage';
import { SuppliersPage } from './pages/SuppliersPage';
import { ReportsPage } from './pages/ReportsPage';
import { UsersPage } from './pages/UsersPage';
import { SettingsPage } from './pages/SettingsPage';

import {
  initialUsers,
  initialCategories,
  initialProducts,
  initialSuppliers,
  initialStockMovements,
  initialTransactions,
  initialSettings,
} from './data/dummyData';

import { Product, Category, Supplier, StockMovement, Transaction, User, StoreSettings } from './types';

const MainAppContent: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [activePage, setActivePage] = useState<string>('dashboard');

  // Application Master Data States
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>(initialStockMovements);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [settings, setSettings] = useState<StoreSettings>(initialSettings);

  // Inter-page Restock trigger state
  const [selectedRestockProduct, setSelectedRestockProduct] = useState<Product | null>(null);

  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={() => setActivePage(user?.role === 'CASHIER' ? 'pos' : 'dashboard')} />;
  }

  // Calculate low stock count
  const lowStockCount = products.filter(p => p.currentStock <= p.minStock).length;

  // Handler: Add Product
  const handleAddProduct = (newProd: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const product: Product = {
      ...newProd,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProducts(prev => [product, ...prev]);

    // Record Stock Movement IN for initial stock
    if (product.currentStock > 0) {
      setStockMovements(prev => [
        {
          id: Date.now(),
          productId: product.id,
          productName: product.name,
          productSku: product.sku,
          movementType: 'IN',
          type: 'IN',
          quantity: product.currentStock,
          referenceNumber: 'INIT-STOCK',
          notes: 'Stok awal pendaftaran produk',
          createdBy: user?.fullName || 'Admin',
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
    }
  };

  // Handler: Update Product
  const handleUpdateProduct = (updatedProd: Product) => {
    setProducts(prev => prev.map(p => (p.id === updatedProd.id ? updatedProd : p)));
  };

  // Handler: Delete Product
  const handleDeleteProduct = (productId: number) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
  };

  // Handler: Add Stock Movement / Restock
  const handleAddStockMovement = (movement: Omit<StockMovement, 'id' | 'createdAt'>) => {
    const newMovement: StockMovement = {
      ...movement,
      id: Date.now(),
      createdAt: new Date().toISOString(),
    };
    setStockMovements(prev => [newMovement, ...prev]);

    // Update Product stock count
    setProducts(prev =>
      prev.map(p => {
        if (p.id === movement.productId) {
          return {
            ...p,
            currentStock: Math.max(0, p.currentStock + movement.quantity),
            updatedAt: new Date().toISOString(),
          };
        }
        return p;
      })
    );
  };

  // Handler: Complete POS Transaction
  const handleCompleteTransaction = (newTx: Omit<Transaction, 'id' | 'createdAt'>) => {
    const transaction: Transaction = {
      ...newTx,
      id: Date.now(),
      createdAt: new Date().toISOString(),
    };

    setTransactions(prev => [transaction, ...prev]);

    // Update Products & Stock Movements for each item sold
    transaction.items.forEach(item => {
      setProducts(prev =>
        prev.map(p => {
          if (p.id === item.productId) {
            return {
              ...p,
              currentStock: Math.max(0, p.currentStock - item.quantity),
              updatedAt: new Date().toISOString(),
            };
          }
          return p;
        })
      );

      setStockMovements(prev => [
        {
          id: Date.now() + Math.random(),
          productId: item.productId,
          productName: item.productName,
          productSku: item.productSku,
          movementType: 'SALE',
          type: 'SALE',
          quantity: -item.quantity,
          referenceNumber: transaction.invoiceNumber,
          notes: 'Penjualan POS Kasir',
          createdBy: user?.fullName || 'Kasir',
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
    });
  };

  // Handler: Add Supplier
  const handleAddSupplier = (newSup: Omit<Supplier, 'id' | 'createdAt' | 'restockCount'>) => {
    setSuppliers(prev => [
      {
        ...newSup,
        id: Date.now(),
        restockCount: 0,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  // Handler: Add User
  const handleAddUser = (newUser: Omit<User, 'id' | 'createdAt'>) => {
    setUsers(prev => [
      {
        ...newUser,
        id: Date.now(),
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  // Handler: Toggle User Status
  const handleToggleUserStatus = (userId: number) => {
    setUsers(prev =>
      prev.map(u => (u.id === userId ? { ...u, isActive: !u.isActive } : u))
    );
  };

  const renderCurrentPage = () => {
    switch (activePage) {
      case 'dashboard':
        return (
          <DashboardPage
            products={products}
            transactions={transactions}
            onNavigate={setActivePage}
            onRestockClick={product => {
              setSelectedRestockProduct(product);
              setActivePage('inventory');
            }}
          />
        );
      case 'pos':
        return (
          <PosPage
            products={products}
            categories={categories}
            onCompleteTransaction={handleCompleteTransaction}
          />
        );
      case 'products':
        return (
          <ProductsPage
            products={products}
            categories={categories}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
          />
        );
      case 'inventory':
        return (
          <InventoryPage
            products={products}
            suppliers={suppliers}
            stockMovements={stockMovements}
            onAddStockMovement={handleAddStockMovement}
            selectedRestockProduct={selectedRestockProduct}
            onClearRestockProduct={() => setSelectedRestockProduct(null)}
          />
        );
      case 'sales':
        return <SalesHistoryPage transactions={transactions} />;
      case 'suppliers':
        return <SuppliersPage suppliers={suppliers} onAddSupplier={handleAddSupplier} />;
      case 'reports':
        return <ReportsPage transactions={transactions} products={products} />;
      case 'users':
        return (
          <UsersPage
            users={users}
            onAddUser={handleAddUser}
            onToggleUserStatus={handleToggleUserStatus}
          />
        );
      case 'settings':
        return <SettingsPage settings={settings} onSaveSettings={setSettings} />;
      default:
        return (
          <DashboardPage
            products={products}
            transactions={transactions}
            onNavigate={setActivePage}
            onRestockClick={product => {
              setSelectedRestockProduct(product);
              setActivePage('inventory');
            }}
          />
        );
    }
  };

  return (
    <AppLayout activePage={activePage} setActivePage={setActivePage} lowStockCount={lowStockCount}>
      {renderCurrentPage()}
    </AppLayout>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <MainAppContent />
      </CartProvider>
    </AuthProvider>
  );
};
