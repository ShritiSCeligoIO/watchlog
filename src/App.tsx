import { QueryClientProvider } from '@tanstack/react-query';
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

/** TanStack Query needs a provider; Zustand stores do not. */
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
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
