import { create } from 'zustand';
import { api, setAuthToken } from '@/hooks/api';

interface User {
  id: string;
  firebaseUid: string;
  email: string;
  name: string;
  role: 'CUSTOMER' | 'TENANT' | 'SUPER_ADMIN';
  tenantId?: string | null;
  tenant?: {
    id: string;
    name: string;
  } | null;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  loginMock: (email: string, name: string, role: 'CUSTOMER' | 'TENANT', tenantId?: string) => Promise<User | null>;
  logout: () => void;
  setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  loginMock: async (email, name, role, tenantId) => {
    set({ isLoading: true, error: null });
    try {
      // Create a deterministic mock firebaseUid based on the role and email
      const prefix = role === 'TENANT' ? 'mock_tenant_' : 'mock_customer_';
      const cleanEmail = email.replace(/[^a-zA-Z0-9]/g, '');
      const firebaseUid = `${prefix}${cleanEmail}`;

      console.log(`Logging in with mock token: ${firebaseUid}`);

      // Set auth token before calling the sync API
      setAuthToken(firebaseUid);

      // Sync the user with our local Express backend database
      const user = await api.syncUser({
        firebaseUid,
        email,
        name,
        role,
        tenantId: role === 'TENANT' ? tenantId : undefined,
      });

      set({
        user,
        token: firebaseUid,
        isAuthenticated: true,
        isLoading: false,
      });

      return user;
    } catch (err: any) {
      // Clear token if sync fails
      setAuthToken(null);
      const errMsg = err.message || 'Login gagal. Silakan coba lagi.';
      set({ error: errMsg, isLoading: false });
      return null;
    }
  },

  logout: () => {
    setAuthToken(null);
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
  },

  setError: (error) => set({ error }),
}));
