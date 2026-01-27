import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, AuthResponse, UserRole } from '../types/user';

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

      setAuth: (payload: AuthResponse | any) => {
        console.log('[AuthStore.setAuth] ENTRY - Raw payload:', JSON.stringify(payload, null, 2));

        let user: User;
        let token: string;

        // Check if this is wrapped in a success/data structure (cashier auth)
        if (payload.success && payload.data) {
          console.log('[AuthStore.setAuth] Detected wrapped auth response (cashier)');
          const authData = payload.data;

          // The user data is in payload.data.user
          const backendUser = authData.user;
          user = {
            id: backendUser.id,
            email: backendUser.email || '', // Cashiers might not have email
            name: backendUser.name,
            role: backendUser.role,
            role_id: backendUser.roleId,
            tenant_id: backendUser.tenantId,
            tenant_name: backendUser.tenantName,
            branch_id: backendUser.branchId,
            branch_name: backendUser.branchName,
            is_active: backendUser.isActive !== undefined ? backendUser.isActive : true,
            created_at: backendUser.createdAt,
            updated_at: backendUser.updatedAt,
          };
          token = authData.access_token || authData.token;
        } else {
          // Standard user auth response (direct structure)
          console.log('[AuthStore.setAuth] Detected user auth response');

          // Backend returns camelCase, normalize to snake_case for consistency
          const backendUser = payload.user;
          user = {
            id: backendUser.id,
            email: backendUser.email,
            name: backendUser.name,
            role: backendUser.role,
            role_id: backendUser.roleId,
            tenant_id: backendUser.tenantId,
            tenant_name: backendUser.tenantName,
            branch_id: backendUser.branchId, // Normalize branchId -> branch_id
            branch_name: backendUser.branchName,
            is_active: backendUser.isActive,
            created_at: backendUser.createdAt,
            updated_at: backendUser.updatedAt,
          };
          token = payload.token || payload.access_token;

          console.log('[AuthStore.setAuth] Before normalization - role:', user.role, 'type:', typeof user.role);

          // Normalize role name (Client Migration: SYSTEM_ADMIN -> SYSTEM_ADMIN)
          if (user.role === 'SYSTEM_ADMIN' as any) {
            console.log('[AuthStore.setAuth] Normalizing SYSTEM_ADMIN -> SYSTEM_ADMIN');
            user.role = 'SYSTEM_ADMIN';
          }

          console.log('[AuthStore.setAuth] After normalization - role:', user.role);
        }

        console.log('[AuthStore.setAuth] Full user object:', JSON.stringify(user, null, 2));

        set({
          user,
          token,
          isAuthenticated: true,
          error: null,
        });

        console.log('[AuthStore.setAuth] EXIT - State updated');
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
          SYSTEM_ADMIN: ['read', 'create', 'update', 'delete', 'manage_users'],
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
