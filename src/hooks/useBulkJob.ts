import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface JobProgress {
  processed: number;
  created: number;
  failed: number;
  status: 'idle' | 'running' | 'completed';
}

interface RowError {
  sku: string;
  error: string;
}

export const useBulkJob = (jobId?: string) => {
  const socketRef = useRef<Socket | null>(null);

  const [progress, setProgress] = useState({
    processed: 0,
    created: 0,
    failed: 0,
    status: 'idle' as 'idle' | 'running' | 'completed'
  });

  const [rowErrors, setRowErrors] = useState<any[]>([]);

  useEffect(() => {
    if (!jobId) return;

    const socket = io(import.meta.env.VITE_API_URL);
    socketRef.current = socket;

    socket.emit('subscribe', jobId);

    socket.on('progress', (data: Partial<JobProgress>) => {
      setProgress((p) => ({
        ...p,
        ...data,
        status: 'running'
      }));
    });

    socket.on('row_error', (data: RowError) => {
      setRowErrors((prev) => [...prev, data]);
    });

    socket.on('completed', (data: JobProgress) => {
      setProgress({
        ...data,
        status: 'completed'
      });
      socket.disconnect();
    });

    return () => {
      socket.disconnect();
    };
  }, [jobId]);

  return { progress, rowErrors };
};
