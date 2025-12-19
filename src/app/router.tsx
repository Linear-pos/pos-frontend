import { createBrowserRouter } from 'react-router-dom';
import { PosPage } from '../features/pos/PosPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <PosPage />,
  },
  {
    path: '/pos',
    element: <PosPage />,
  },
]);