import { axiosInstance } from '../../services/api';
import type { AuthResponse, LoginPayload, User } from '../../types/user';

export const authAPI = {
  /**
   * Login with email and password
   * Backend returns { access_token, user }
   */
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const response = await axiosInstance.post<any>('/login', payload);
    const data = response.data;
    
    // Normalize response to match AuthResponse interface
    return {
      user: data.user,
      access_token: data.access_token || data.token,
      token: data.access_token || data.token, // Keep both for compatibility
    } as AuthResponse;
  },

  /**
   * Logout - notify backend and clear session
   */
  logout: async (): Promise<void> => {
    try {
      await axiosInstance.post('/logout');
    } catch (error) {
      // Even if logout fails, we'll clear local auth state
      console.error('Logout error:', error);
    }
  },

  /**
   * Verify if the current token is valid
   */
  verifyToken: async (): Promise<User> => {
    const response = await axiosInstance.get<User>('/me');
    return response.data;
  },

  /**
   * Refresh the auth token
   */
  refreshToken: async (): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>('/refresh');
    return response.data;
  },

  /**
   * Register a new user (if needed)
   */
  register: async (payload: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
  }): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>('/register', payload);
    return response.data;
  },
};

export default authAPI;
