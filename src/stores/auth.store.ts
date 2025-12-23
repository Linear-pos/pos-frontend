import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, AuthResponse } from '../types/user';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  setAuth: (payload: AuthResponse) => void;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
  clearError: () => void;
  hasRole: (roles: string | string[]) => boolean;
  hasPermission: (permission: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      setAuth: (payload: AuthResponse) => {
        // Handle both 'token' and 'access_token' field names from backend
        const token = payload.token || (payload as any).access_token;
        
        set({
          user: payload.user,
          token,
          isAuthenticated: true,
          error: null,
        });
      },

      setUser: (user: User | null) => {
        set({ user, isAuthenticated: user !== null });
      },

      setToken: (token: string | null) => {
        set({ token });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
      },

      clearError: () => {
        set({ error: null });
      },

      hasRole: (roles: string | string[]) => {
        const { user } = get();
        if (!user) return false;
        
        const roleArray = Array.isArray(roles) ? roles : [roles];
        
        // Handle case where role is an object with a name property
        const userRole = typeof user.role === 'string' 
          ? user.role 
          : user.role?.name;
        
        if (!userRole) return false;
        return roleArray.includes(userRole);
      },

      hasPermission: (permission: string) => {
        const { user } = get();
        if (!user) return false;
        
        // Get user role name
        const userRole = typeof user.role === 'string' 
          ? user.role 
          : user.role?.name;
        
        // Map roles to permissions
        const rolePermissions: Record<string, string[]> = {
          SYSTEM_OWNER: ['read', 'create', 'update', 'delete', 'manage_users'],
          BRANCH_MANAGER: ['read', 'create', 'update', 'delete'],
          CASHIER: ['read', 'create'],
        };
        
        const permissions = rolePermissions[userRole!] || [];
        return permissions.includes(permission);
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
