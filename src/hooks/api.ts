import { Platform } from 'react-native';

let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

const getBaseUrl = () => {
  // Android Emulator maps localhost to 10.0.2.2
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000/api';
  }
  // Web or iOS Simulator
  return 'http://localhost:5000/api';
};

const request = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${getBaseUrl()}${endpoint}`;
  
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (authToken) {
    headers.set('Authorization', `Bearer ${authToken}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Request failed with status ${response.status}`);
  }

  return response.json();
};

export const api = {
  // Sync user with local database
  syncUser: async (userData: {
    firebaseUid: string;
    email: string;
    name: string;
    role: 'CUSTOMER' | 'TENANT' | 'SUPER_ADMIN';
    tenantId?: string;
  }) => {
    return request('/auth/sync', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // Get all tenants
  getTenants: async () => {
    return request('/tenants');
  },

  // Create a new tenant (mitra catering)
  createTenant: async (tenantData: {
    name: string;
    description?: string;
    address?: string;
  }) => {
    return request('/tenants', {
      method: 'POST',
      body: JSON.stringify(tenantData),
    });
  },

  // Get menus for a specific tenant on a date
  getTenantMenus: async (tenantId: string, date: string) => {
    return request(`/tenants/${tenantId}/menus?date=${date}`);
  },

  // Create an order
  createOrder: async (orderData: {
    tenantId: string;
    items: Array<{
      menuId: string;
      quantity: number;
      targetDate: string;
    }>;
  }) => {
    return request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  // Get customer orders history
  getOrders: async () => {
    return request('/orders');
  },

  // Pay order (Simulate)
  payOrder: async (orderId: string, status: 'PAID' | 'FAILED') => {
    return request(`/orders/${orderId}/pay`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  // Tenant: Get menus created by this tenant
  getTenantMenusOnly: async () => {
    return request('/tenant/menus');
  },

  // Tenant: Create daily menu
  createTenantMenu: async (menuData: {
    name: string;
    description?: string;
    price: number;
    maxQuota: number;
    availableAt: string;
  }) => {
    return request('/tenant/menus', {
      method: 'POST',
      body: JSON.stringify(menuData),
    });
  },

  // Tenant: Get kitchen rekap
  getKitchenRekap: async (date: string) => {
    return request(`/tenant/kitchen-rekap?date=${date}`);
  },

  // Tenant: Get dashboard stats (menuCount, orderCount, totalRevenue)
  getTenantStats: async () => {
    return request('/tenant/stats');
  },

  // Tenant: Get orders placed with this tenant
  getTenantOrders: async () => {
    return request('/tenant/orders');
  },

  // Tenant: Update order process status
  updateOrderStatus: async (orderId: string, status: 'PAID' | 'PREPARING' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED') => {
    return request(`/tenant/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },
};
