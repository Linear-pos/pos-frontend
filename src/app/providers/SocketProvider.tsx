import React, { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from '../../hooks/useAuth';

interface SocketContextType {
  isConnected: boolean;
  error: string | null;
}

export const SocketContext = React.createContext<SocketContextType | undefined>(
  undefined
);

interface SocketProviderProps {
  children: ReactNode;
  url?: string;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({
  children,
  url = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000',
}) => {
  const { token, isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      setIsConnected(false);
      return;
    }

    // Socket.IO connection would go here
    // For now, this is a placeholder for future WebSocket integration
    try {
      // Initialize socket connection when authenticated
      setIsConnected(true);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Socket connection failed';
      setError(message);
      setIsConnected(false);
    }

    return () => {
      // Cleanup socket on unmount or when auth changes
      setIsConnected(false);
    };
  }, [isAuthenticated, token, url]);

  return (
    <SocketContext.Provider value={{ isConnected, error }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = React.useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
