export type UserRole = 'SYSTEM_ADMIN' | 'BRANCH_MANAGER' | 'CASHIER';

export interface Role {
  id: string;
  name: UserRole;
  description?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role?: Role | UserRole; // Can be role object or string
  role_id?: string;
  tenant_id?: string;
  tenant_name?: string;
  branch_id?: string | null;
  branch_name?: string;
  is_active?: boolean;
  avatar?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
  token?: string;
  expiresAt?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}
