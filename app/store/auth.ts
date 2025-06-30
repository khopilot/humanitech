import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { authApi } from '~/lib/api';
import { secureStorage } from '~/lib/secureStorage';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (data: { email: string; password: string; name: string }) => Promise<void>;
  refreshToken: () => Promise<void>;
  clearError: () => void;
  setToken: (token: string | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await authApi.login({ email, password });
          const { user, token, csrfToken } = response.data;
          
          // Store CSRF token in meta tag
          if (csrfToken) {
            const meta = document.querySelector('meta[name="csrf-token"]') || document.createElement('meta');
            meta.setAttribute('name', 'csrf-token');
            meta.setAttribute('content', csrfToken);
            if (!document.querySelector('meta[name="csrf-token"]')) {
              document.head.appendChild(meta);
            }
          }
          
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Login failed',
            isLoading: false,
          });
          throw error;
        }
      },

      logout: () => {
        // Clear token from memory
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
        
        // Clear CSRF token
        const csrfMeta = document.querySelector('meta[name="csrf-token"]');
        if (csrfMeta) {
          csrfMeta.remove();
        }
        
        // Clear session storage
        sessionStorage.clear();
      },

      register: async (data) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await authApi.register(data);
          const { user, token, csrfToken } = response.data;
          
          // Store CSRF token
          if (csrfToken) {
            const meta = document.querySelector('meta[name="csrf-token"]') || document.createElement('meta');
            meta.setAttribute('name', 'csrf-token');
            meta.setAttribute('content', csrfToken);
            if (!document.querySelector('meta[name="csrf-token"]')) {
              document.head.appendChild(meta);
            }
          }
          
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Registration failed',
            isLoading: false,
          });
          throw error;
        }
      },

      refreshToken: async () => {
        try {
          const response = await authApi.refresh();
          const { token } = response.data;
          
          set({ token });
        } catch (error) {
          get().logout();
        }
      },

      clearError: () => set({ error: null }),
      
      setToken: (token: string | null) => set({ token }),
    }),
    {
      name: 'auth-store',
      storage: createJSONStorage(() => secureStorage),
      partialize: (state) => ({
        // Only persist user info and auth state, NOT the token
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);