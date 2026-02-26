import { axiosInstance } from '../../services/api';
import type { AuthResponse, LoginPayload, User } from '../../types/user';

// Define the standard backend response wrapper
interface BackendResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export const authAPI = {
  /**
   * Login with email and password
   * Backend returns { success: true, data: { token, user, ... } }
   */
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    // Determine if we need to wrap the payload? No, backend expects raw body.
    // Backend returns wrapped response.
    const response = await axiosInstance.post<BackendResponse<AuthResponse>>('/auth/login', payload);
    const { data } = response.data;

    // Check if backend returns 'token' or 'access_token'
    // Our backend auth.service.ts returns { token, user }
    // Frontend types expect { access_token, user }

    return {
      user: data.user,
      access_token: data.token || data.access_token,
      // expiredAt might need mapping if backend sends it
    } as AuthResponse;
  },

  /**
   * Logout - notify backend and clear session
   */
  logout: async (): Promise<void> => {
    try {
      await axiosInstance.post('/auth/logout');
    } catch (error) {
      // Even if logout fails, we'll clear local auth state
      console.error('Logout error:', error);
    }
  },

  /**
   * Verify if the current token is valid
   * Backend GET /auth/me returns { success: true, data: User }
   */
  verifyToken: async (): Promise<User> => {
    const response = await axiosInstance.get<BackendResponse<User>>('/auth/me');
    return response.data.data;
  },

  /**
   * Refresh the auth token
   * Backend POST /auth/refresh returns { success: true, data: { token, user } }
   */
  refreshToken: async (): Promise<AuthResponse> => {
    const response = await axiosInstance.post<BackendResponse<AuthResponse>>('/auth/refresh');
    const { data } = response.data;

    return {
      user: data.user,
      access_token: data.token || data.access_token,
    } as AuthResponse;
  },

  /**
   * Register a new user
   * Backend POST /auth/register returns { success: true, data: { token, user } }
   */
  register: async (payload: {
    name: string;
    email: string;
    password: string;
    roleId?: string; // Backend expects roleId, not password_confirmation strictly for MVP unless validation added
    // Backend registerSchema expects: name, email, password, roleId (opt), tenantId/branchId (opt)
  }): Promise<AuthResponse> => {
    const response = await axiosInstance.post<BackendResponse<AuthResponse>>('/auth/register', payload);
    const { data } = response.data;

    return {
      user: data.user,
      access_token: data.token || data.access_token,
    } as AuthResponse;
  },

  /**
   * Forgot password - send reset link to email (restricted to SYSTEM_ADMIN and BRANCH_MANAGER)
   * Backend POST /auth/forgot-password returns { success: true, message: string }
   */
  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const response = await axiosInstance.post<BackendResponse<{ message: string }>>('/auth/forgot-password', { email });
    return response.data.data;
  },

  /**
   * Reset password - update password using token
   * Backend POST /auth/reset-password returns { success: true, message: string }
   */
  resetPassword: async (token: string, newPassword: string): Promise<{ message: string }> => {
    const response = await axiosInstance.post<BackendResponse<{ message: string }>>('/auth/reset-password', {
      token,
      password: newPassword,
    });
    return response.data.data;
  },

  /**
   * Verify reset token - check if token is valid
   * Backend POST /auth/verify-reset-token returns { success: true, data: { valid: boolean, email?: string } }
   */
  verifyResetToken: async (token: string): Promise<{ valid: boolean; email?: string }> => {
    const response = await axiosInstance.post<BackendResponse<{ valid: boolean; email?: string }>>('/auth/verify-reset-token', { token });
    return response.data.data;
  },
};

export default authAPI;
