const getApiBase = () => {
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
  return base.endsWith('/api') ? base : `${base}/api`;
};

const API_BASE = getApiBase();

interface FetchOptions extends RequestInit {
  token?: string;
}

async function fetchApi(endpoint: string, options: FetchOptions = {}) {
  const { token, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  const contentType = response.headers.get('content-type');
  if (contentType?.includes('application/pdf')) {
    return response.blob();
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

// Auth
export const authApi = {
  register: (data: { email: string; password: string; fullName: string }) =>
    fetchApi('/auth/register', { method: 'POST', body: JSON.stringify(data) }),

  login: (data: { email: string; password: string }) =>
    fetchApi('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
};

// Products
export const productApi = {
  getAll: (page = 0, size = 20, sortBy = 'id', sortDir = 'asc') =>
    fetchApi(`/products?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`),

  getById: (id: number) => fetchApi(`/products/${id}`),

  getByCategory: (categoryId: number, page = 0, size = 20) =>
    fetchApi(`/products/category/${categoryId}?page=${page}&size=${size}`),

  search: (keyword: string, page = 0, size = 20) =>
    fetchApi(`/products/search?keyword=${keyword}&page=${page}&size=${size}`),
};

// Categories
export const categoryApi = {
  getAll: () => fetchApi('/categories'),
  getById: (id: number) => fetchApi(`/categories/${id}`),
};

// Bundle
export const bundleApi = {
  generate: (problem: string, maxBudget?: number) =>
    fetchApi('/bundle/generate', {
      method: 'POST',
      body: JSON.stringify({ problem, maxBudget }),
    }),
};

// Cart
export const cartApi = {
  get: (token: string) => fetchApi('/cart', { token }),

  addItem: (token: string, productId: number, quantity = 1) =>
    fetchApi('/cart/add', {
      method: 'POST',
      token,
      body: JSON.stringify({ productId, quantity }),
    }),

  addBundle: (token: string, productIds: number[]) =>
    fetchApi('/cart/add-bundle', {
      method: 'POST',
      token,
      body: JSON.stringify({ productIds }),
    }),

  updateItem: (token: string, productId: number, quantity: number) =>
    fetchApi('/cart/update', {
      method: 'PUT',
      token,
      body: JSON.stringify({ productId, quantity }),
    }),

  removeItem: (token: string, productId: number) =>
    fetchApi(`/cart/remove/${productId}`, { method: 'DELETE', token }),

  clear: (token: string) =>
    fetchApi('/cart/clear', { method: 'DELETE', token }),
};

// Orders
export const orderApi = {
  place: (token: string, shippingAddress?: string) =>
    fetchApi('/orders/place', {
      method: 'POST',
      token,
      body: JSON.stringify({ shippingAddress }),
    }),

  confirmPayment: (token: string, orderId: number) =>
    fetchApi(`/orders/${orderId}/confirm-payment`, {
      method: 'POST',
      token,
    }),

  getMyOrders: (token: string, page = 0, size = 10) => fetchApi(`/orders?page=${page}&size=${size}`, { token }),

  getById: (token: string, orderId: number) =>
    fetchApi(`/orders/${orderId}`, { token }),

  downloadInvoice: (token: string, orderId: number) =>
    fetchApi(`/orders/${orderId}/invoice`, { token }),
};

// Admin
export const adminApi = {
  createProduct: (token: string, data: any) =>
    fetchApi('/admin/products', { method: 'POST', token, body: JSON.stringify(data) }),

  updateProduct: (token: string, id: number, data: any) =>
    fetchApi(`/admin/products/${id}`, { method: 'PUT', token, body: JSON.stringify(data) }),

  deleteProduct: (token: string, id: number) =>
    fetchApi(`/admin/products/${id}`, { method: 'DELETE', token }),

  createCategory: (token: string, data: any) =>
    fetchApi('/admin/categories', { method: 'POST', token, body: JSON.stringify(data) }),

  updateCategory: (token: string, id: number, data: any) =>
    fetchApi(`/admin/categories/${id}`, { method: 'PUT', token, body: JSON.stringify(data) }),

  deleteCategory: (token: string, id: number) =>
    fetchApi(`/admin/categories/${id}`, { method: 'DELETE', token }),

  getAllOrders: (token: string, page = 0, size = 20) =>
    fetchApi(`/admin/orders?page=${page}&size=${size}`, { token }),

  updateOrderStatus: (token: string, orderId: number, status: string) =>
    fetchApi(`/admin/orders/${orderId}/status`, {
      method: 'PUT',
      token,
      body: JSON.stringify({ status }),
    }),
};
