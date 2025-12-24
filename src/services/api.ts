import axios, { AxiosError } from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../stores/auth.store';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor - Add auth token to requests
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().token;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle auth errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // If unauthorized, clear auth and redirect to login
    if (error.response?.status === 401) {
      const authStore = useAuthStore.getState();
      authStore.logout();
      
      // Redirect to login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    // If forbidden, redirect to unauthorized page
    if (error.response?.status === 403) {
      window.location.href = '/unauthorized';
    }
    
    return Promise.reject(error);
  }
);




export default axiosInstance;
