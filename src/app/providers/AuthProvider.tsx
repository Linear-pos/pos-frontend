import React, { useEffect } from "react";
import type { ReactNode } from "react";
import { useAuth } from "../../hooks/useAuth";
import { authAPI } from "../../components/auth/auth.api";

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { isAuthenticated, token, setUser, setLoading, setError } = useAuth();

  useEffect(() => {
    const verifyAuth = async () => {
      // Only verify if we have a token but user is not authenticated yet
      if (token && !isAuthenticated) {
        try {
          setLoading(true);
          const user = await authAPI.verifyToken();
          setUser(user);
        } catch (error) {
          console.error("Token verification failed:", error);
          setError("Session expired. Please login again.");
        } finally {
          setLoading(false);
        }
      }
    };

    verifyAuth();
  }, [token, isAuthenticated, setUser, setLoading, setError]);

  return <>{children}</>;
};
