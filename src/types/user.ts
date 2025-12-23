export type UserRole = 'SYSTEM_OWNER' | 'BRANCH_MANAGER' | 'CASHIER';

export interface Role {
  id: number;
  name: UserRole;
  description?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role?: Role | UserRole; // Can be role object or string
  role_id?: number;
  tenant_id?: string;
  branch_id?: string | null;
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
