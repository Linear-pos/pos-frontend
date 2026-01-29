
import { useEffect } from 'react';
import { toast } from 'sonner';

export const UpdateStatusListener = () => {
    useEffect(() => {
        // @ts-ignore - electronAPI exposed in preload
        if (!window.electron) return;

        // @ts-ignore
        const removeListener = window.electron.onUpdateStatus((event, data) => {
            console.log('Update Status:', data);

            if (data.status === 'update-available') {
                toast.info('A new update is available. Downloading in background...');
            }

            if (data.status === 'downloaded') {
                toast.success('Update downloaded. It will be installed on next restart.', {
                    action: {
                        label: 'Restart Now',
                        onClick: () => {
                            // @ts-ignore
                            window.electron.installUpdate();
                        }
                    }
                });
            }

            if (data.status === 'error') {
                console.error('Update error:', data.error);
            }
        });

        return () => {
            if (removeListener) removeListener();
        };
    }, []);

    return null;
};
