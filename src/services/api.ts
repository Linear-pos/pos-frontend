import axios, { AxiosError } from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../stores/auth.store';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/';

export const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor - Add auth token to requests (except public endpoints)
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const publicEndpoints = [
      '/terminals/verify-code',
      '/auth/login',
      '/auth/register',
      '/cashiers/auth',
      '/cashiers/auth/reset-pin'
    ];

    // Check if this is a public endpoint
    const isPublicEndpoint = publicEndpoints.some(endpoint =>
      config.url?.includes(endpoint)
    );

    // Only add token if not a public endpoint
    if (!isPublicEndpoint) {
      const token = useAuthStore.getState().token;

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle auth errors (but NOT for public endpoints)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // List of public endpoints - don't auto-redirect on errors for these
    const publicEndpoints = ['/terminals/verify-code', '/auth/login', '/auth/register', '/cashiers/auth'];
    const isPublicEndpoint = publicEndpoints.some(endpoint =>
      error.config?.url?.includes(endpoint)
    );

    // If unauthorized and NOT a public endpoint, clear auth and redirect to login
    if (error.response?.status === 401 && !isPublicEndpoint) {
      const authStore = useAuthStore.getState();
      authStore.logout();

      // Redirect to login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    // If forbidden and NOT a public endpoint, redirect to unauthorized page
    if (error.response?.status === 403 && !isPublicEndpoint) {
      window.location.href = '/unauthorized';
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
