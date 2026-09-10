import { QueryClientProvider, type QueryClient } from '@tanstack/react-query';
import { Navigate, Route, Routes, useParams } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';
import QueryDevtools from './components/QueryDevtools';
import ItemDetailPage from './pages/ItemDetailPage';
import ItemEditPage from './pages/ItemEditPage';
import LoginPage from './pages/LoginPage';
import WatchlistPage from './pages/WatchlistPage';
import { queryClient } from './queries/queryClient';

function EditItemRoute() {
  const { itemId } = useParams();

  return (
    <ProtectedRoute>
      <ItemEditPage key={itemId} />
    </ProtectedRoute>
  );
}

/**
 * Only server state needs a provider now. The Zustand stores are module
 * singletons that components import directly, so there is no UI-state provider
 * to wrap the tree in.
 */
export interface AppProps {
  queryClient?: QueryClient;
}

export default function App({ queryClient: client = queryClient }: AppProps = {}) {
  return (
    <QueryClientProvider client={client}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/watchlist" replace />} />
          <Route path="watchlist" element={<WatchlistPage />} />
          <Route path="items/:itemId" element={<ItemDetailPage />} />
          <Route path="items/:itemId/edit" element={<EditItemRoute />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/watchlist" replace />} />
        </Route>
      </Routes>
      <QueryDevtools />
    </QueryClientProvider>
  );
}
