import { createBrowserRouter } from 'react-router-dom';
import { PosPage } from '../features/pos/PosPage';
import  Products  from '../features/products/pages/Products';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <PosPage />,
  },
  {
    path: '/pos',
    element: <PosPage />,
  },
  {
    path: '/products',
    element: <Products />,
  },
]);