import { useAuthStore } from '../stores/auth.store';

export const useAuth = () => {
  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    setAuth,
    setUser,
    setToken,
    setLoading,
    setError,
    logout,
    clearError,
    hasRole,
    hasPermission,
  } = useAuthStore();

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    setAuth,
    setUser,
    setToken,
    setLoading,
    setError,
    logout,
    clearError,
    hasRole,
    hasPermission,
  };
};
