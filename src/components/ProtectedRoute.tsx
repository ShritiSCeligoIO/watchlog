import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { selectIsAuthenticated } from '../features/auth/authSelectors';
import { useAppSelector } from '../store/hooks';

/** Send signed-out visitors to login without losing their destination. */
export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    const filterQuery =
      typeof location.state === 'object' &&
      location.state !== null &&
      'filterQuery' in location.state &&
      typeof location.state.filterQuery === 'string'
        ? location.state.filterQuery
        : '';

    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: `${location.pathname}${location.search}`,
          filterQuery,
        }}
      />
    );
  }

  return children;
}
