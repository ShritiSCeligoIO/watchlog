import { Navigate, Route, Routes, useParams } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { WatchlistDataProvider } from './context/WatchlistDataContext';
import ItemDetailPage from './pages/ItemDetailPage';
import ItemEditPage from './pages/ItemEditPage';
import LoginPage from './pages/LoginPage';
import WatchlistPage from './pages/WatchlistPage';

// The route component supplies itemId so the key resets the form between items.
function EditItemRoute() {
  const { itemId } = useParams();

  return (
    <ProtectedRoute>
      <ItemEditPage key={itemId} />
    </ProtectedRoute>
  );
}

/** Keep the complete route table visible while learning React Router. */
export default function App() {
  return (
    <AuthProvider>
      <WatchlistDataProvider>
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
      </WatchlistDataProvider>
    </AuthProvider>
  );
}
