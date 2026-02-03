declare global {
  interface Window {
    electron?: {
      platform: string;
      products: {
        import: (data: unknown) => Promise<unknown>;
        validate: (data: unknown) => Promise<unknown>;
      };
      onUpdateStatus: (callback: (event: any, data: UpdateStatusData) => void) => () => void;
      installUpdate: () => Promise<void>;
    };
  }
}

type UpdateStatusData = {
  status: 'update-available' | 'downloaded' | 'error';
  error?: Error;
};

export {};// This file needs to be a module
