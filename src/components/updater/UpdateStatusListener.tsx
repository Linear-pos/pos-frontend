
import { useEffect } from 'react';
import { toast } from 'sonner';

type UpdateStatusData = {
  status: 'update-available' | 'downloaded' | 'error';
  error?: Error;
};

export const UpdateStatusListener = () => {
  useEffect(() => {
    if (!window.electron) {
      console.warn('Electron API is not available');
      return;
    }

    // Check if onUpdateStatus exists and is a function
    if (typeof window.electron.onUpdateStatus !== 'function') {
      console.warn('onUpdateStatus is not available on electron API');
      return;
    }

    const cleanup = window.electron.onUpdateStatus((_event, data: UpdateStatusData) => {
      console.log('Update Status:', data);

      switch (data.status) {
        case 'update-available':
          toast.info('A new update is available. Downloading in background...');
          break;
          
        case 'downloaded':
          toast.success('Update downloaded. It will be installed on next restart.', {
            action: {
              label: 'Restart Now',
              onClick: () => {
                if (!window.electron) {
                  console.warn('Electron API is not available');
                  return;
                }
                window.electron.installUpdate().catch(console.error);
              },
            },
          });
          break;
          
        case 'error':
          console.error('Update error:', data.error);
          break;
      }
    });

    return () => {
      if (typeof cleanup === 'function') {
        cleanup();
      }
    };
  }, []);

  return null;
};
