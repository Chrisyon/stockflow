import { ApiResponse, LoginRequest, JwtAuthenticationResponse, UserProfileResponse, Category, Product, ProductRequest, Supplier, SupplierRequest, RestockRequest, StockAdjustmentRequest, StockMovement, CheckoutRequest, Transaction, DashboardSummaryResponse, SalesReportResponse, TopSellingProductResponse, AuditLog, PagedResponse, MovementType, PaymentMethod } from '../types';

const API_BASE_URL = 'http://localhost:8081/api/v1';

// Helper for HTTP requests with JWT Authorization
async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const token = localStorage.getItem('stockflow_token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data: ApiResponse<T> = await response.json();

    if (response.status === 401) {
      // Clear token on expired session
      localStorage.removeItem('stockflow_token');
    }

    if (!response.ok) {
      const errorMessage = data.message || (data.errors ? data.errors.join(', ') : 'Terjadi kesalahan pada server');
      throw new Error(errorMessage);
    }

    return data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Gagal terhubung ke server backend');
  }
}

// 1. Auth Service
export const authApi = {
  login: async (request: LoginRequest): Promise<JwtAuthenticationResponse> => {
    const res = await fetchApi<JwtAuthenticationResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(request),
    });
    return res.data;
  },

  getCurrentUser: async (): Promise<UserProfileResponse> => {
    const res = await fetchApi<UserProfileResponse>('/auth/me');
    return res.data;
  },
};

// 2. Category Service
export const categoryApi = {
  getAll: async (): Promise<Category[]> => {
    const res = await fetchApi<Category[]>('/categories');
    return res.data;
  },

  create: async (category: { name: string; description?: string }): Promise<Category> => {
    const res = await fetchApi<Category>('/categories', {
      method: 'POST',
      body: JSON.stringify(category),
    });
    return res.data;
  },
};

// 3. Product Service
export const productApi = {
  getAll: async (params?: { keyword?: string; categoryId?: number; page?: number; size?: number }): Promise<PagedResponse<Product>> => {
    const query = new URLSearchParams();
    if (params?.keyword) query.append('keyword', params.keyword);
    if (params?.categoryId) query.append('categoryId', params.categoryId.toString());
    if (params?.page !== undefined) query.append('page', params.page.toString());
    if (params?.size !== undefined) query.append('size', params.size.toString());

    const res = await fetchApi<PagedResponse<Product>>(`/products?${query.toString()}`);
    return res.data;
  },

  getById: async (id: number): Promise<Product> => {
    const res = await fetchApi<Product>(`/products/${id}`);
    return res.data;
  },

  getBySku: async (sku: string): Promise<Product> => {
    const res = await fetchApi<Product>(`/products/sku/${sku}`);
    return res.data;
  },

  getLowStock: async (): Promise<Product[]> => {
    const res = await fetchApi<Product[]>('/products/low-stock');
    return res.data;
  },

  create: async (request: ProductRequest): Promise<Product> => {
    const res = await fetchApi<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(request),
    });
    return res.data;
  },

  update: async (id: number, request: ProductRequest): Promise<Product> => {
    const res = await fetchApi<Product>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(request),
    });
    return res.data;
  },

  delete: async (id: number): Promise<void> => {
    await fetchApi<void>(`/products/${id}`, {
      method: 'DELETE',
    });
  },
};

// 4. Supplier & Inventory Service
export const supplierApi = {
  getAll: async (): Promise<Supplier[]> => {
    const res = await fetchApi<Supplier[]>('/suppliers');
    return res.data;
  },

  create: async (supplier: { name: string; contactPerson?: string; phone?: string; email?: string; address?: string }): Promise<Supplier> => {
    const res = await fetchApi<Supplier>('/suppliers', {
      method: 'POST',
      body: JSON.stringify(supplier),
    });
    return res.data;
  },
};

export const inventoryApi = {
  restock: async (request: RestockRequest): Promise<StockMovement> => {
    const res = await fetchApi<StockMovement>('/inventory/restock', {
      method: 'POST',
      body: JSON.stringify(request),
    });
    return res.data;
  },

  stockAdjustment: async (request: StockAdjustmentRequest): Promise<StockMovement> => {
    const res = await fetchApi<StockMovement>('/inventory/adjustment', {
      method: 'POST',
      body: JSON.stringify(request),
    });
    return res.data;
  },

  getMovements: async (params?: { movementType?: MovementType; productId?: number; page?: number; size?: number }): Promise<PagedResponse<StockMovement>> => {
    const query = new URLSearchParams();
    if (params?.movementType) query.append('movementType', params.movementType);
    if (params?.productId) query.append('productId', params.productId.toString());
    if (params?.page !== undefined) query.append('page', params.page.toString());
    if (params?.size !== undefined) query.append('size', params.size.toString());

    const res = await fetchApi<PagedResponse<StockMovement>>(`/inventory/movements?${query.toString()}`);
    return res.data;
  },
};

// 5. Transaction POS Service
export const transactionApi = {
  checkout: async (request: CheckoutRequest): Promise<Transaction> => {
    const res = await fetchApi<Transaction>('/transactions', {
      method: 'POST',
      body: JSON.stringify(request),
    });
    return res.data;
  },

  getById: async (id: number): Promise<Transaction> => {
    const res = await fetchApi<Transaction>(`/transactions/${id}`);
    return res.data;
  },

  getByInvoice: async (invoiceNumber: string): Promise<Transaction> => {
    const res = await fetchApi<Transaction>(`/transactions/invoice/${invoiceNumber}`);
    return res.data;
  },

  search: async (params?: { invoiceNumber?: string; paymentMethod?: PaymentMethod; startDate?: string; endDate?: string; page?: number; size?: number }): Promise<PagedResponse<Transaction>> => {
    const query = new URLSearchParams();
    if (params?.invoiceNumber) query.append('invoiceNumber', params.invoiceNumber);
    if (params?.paymentMethod) query.append('paymentMethod', params.paymentMethod);
    if (params?.startDate) query.append('startDate', params.startDate);
    if (params?.endDate) query.append('endDate', params.endDate);
    if (params?.page !== undefined) query.append('page', params.page.toString());
    if (params?.size !== undefined) query.append('size', params.size.toString());

    const res = await fetchApi<PagedResponse<Transaction>>(`/transactions?${query.toString()}`);
    return res.data;
  },
};

// 6. Reports & Audit Service
export const reportApi = {
  getDashboardSummary: async (): Promise<DashboardSummaryResponse> => {
    const res = await fetchApi<DashboardSummaryResponse>('/reports/dashboard');
    return res.data;
  },

  getSalesReport: async (startDate?: string, endDate?: string): Promise<SalesReportResponse> => {
    const query = new URLSearchParams();
    if (startDate) query.append('startDate', startDate);
    if (endDate) query.append('endDate', endDate);

    const res = await fetchApi<SalesReportResponse>(`/reports/sales?${query.toString()}`);
    return res.data;
  },

  getTopSelling: async (limit: number = 5): Promise<TopSellingProductResponse[]> => {
    const res = await fetchApi<TopSellingProductResponse[]>(`/reports/top-selling?limit=${limit}`);
    return res.data;
  },
};

export const auditApi = {
  getLogs: async (params?: { entityName?: string; action?: string; userId?: number; page?: number; size?: number }): Promise<PagedResponse<AuditLog>> => {
    const query = new URLSearchParams();
    if (params?.entityName) query.append('entityName', params.entityName);
    if (params?.action) query.append('action', params.action);
    if (params?.userId) query.append('userId', params.userId.toString());
    if (params?.page !== undefined) query.append('page', params.page.toString());
    if (params?.size !== undefined) query.append('size', params.size.toString());

    const res = await fetchApi<PagedResponse<AuditLog>>(`/audit-logs?${query.toString()}`);
    return res.data;
  },
};
