export type UserRole = 'ADMIN' | 'CASHIER' | 'OWNER';

export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  productCount?: number;
  createdAt: string;
}

export interface Product {
  id: number;
  sku: string;
  name: string;
  categoryId: number;
  categoryName?: string;
  costPrice: number;
  sellingPrice: number;
  currentStock: number;
  minStock: number;
  unit: string;
  createdAt: string;
  updatedAt: string;
}

export interface Supplier {
  id: number;
  name: string;
  contactPerson: string;
  phone: string;
  email?: string;
  address: string;
  restockCount?: number;
  createdAt: string;
}

export type MovementType = 'IN' | 'OUT' | 'ADJUSTMENT' | 'SALE';

export interface StockMovement {
  id: number;
  productId: number;
  productName: string;
  productSku: string;
  movementType: MovementType;
  type?: MovementType; // Alias for UI rendering compatibility
  quantity: number;
  referenceNumber?: string;
  notes: string;
  createdByUserId?: number;
  createdByName?: string;
  createdBy?: string;
  createdAt: string;
}

export type PaymentMethod = 'CASH' | 'QRIS' | 'DEBIT' | 'TRANSFER';

export interface CartItem {
  product: Product;
  quantity: number;
  subtotal: number;
}

export interface TransactionDetail {
  id: number;
  productId: number;
  productName: string;
  productSku: string;
  costPrice: number;
  sellingPrice: number;
  quantity: number;
  subtotal: number;
}

export interface Transaction {
  id: number;
  invoiceNumber: string;
  cashierId: number;
  cashierName: string;
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;
  changeAmount: number;
  paymentMethod: PaymentMethod;
  createdAt: string;
  items: TransactionDetail[];
}

export interface AuditLog {
  id: number;
  userId: number;
  userName: string;
  userRole: UserRole;
  action: string;
  entityName: string;
  entityId: string;
  details: string;
  createdAt: string;
}

export interface StoreSettings {
  storeName: string;
  storeAddress: string;
  storePhone: string;
  storeEmail: string;
  receiptFooter: string;
  taxPercentage: number;
  enableLowStockAlert: boolean;
}

// REST API Specific Wrappers & DTOs
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: string[];
  timestamp: string;
}

export interface PagedResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface JwtAuthenticationResponse {
  accessToken: string;
  tokenType: string;
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
}

export interface UserProfileResponse {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

export interface ProductRequest {
  sku: string;
  name: string;
  categoryId: number;
  costPrice: number;
  sellingPrice: number;
  currentStock: number;
  minStock: number;
  unit: string;
}

export interface SupplierRequest {
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface RestockRequest {
  productId: number;
  supplierId: number;
  quantity: number;
  referenceNumber?: string;
  notes?: string;
}

export interface StockAdjustmentRequest {
  productId: number;
  movementType: MovementType;
  quantity: number;
  notes?: string;
}

export interface TransactionItemRequest {
  productId: number;
  quantity: number;
}

export interface CheckoutRequest {
  items: TransactionItemRequest[];
  discountAmount: number;
  paidAmount: number;
  paymentMethod: PaymentMethod;
}

export interface DashboardSummaryResponse {
  totalRevenue: number;
  totalGrossProfit: number;
  totalTransactions: number;
  totalProducts: number;
  totalInventoryValue: number;
  lowStockCount: number;
}

export interface SalesReportResponse {
  totalRevenue: number;
  totalCost: number;
  totalGrossProfit: number;
  totalTransactions: number;
  averageBasketSize: number;
  totalItemsSold: number;
  topSellingProducts: TopSellingProductResponse[];
}

export interface TopSellingProductResponse {
  productId: number;
  productName: string;
  productSku: string;
  quantitySold: number;
  totalRevenue: number;
}
