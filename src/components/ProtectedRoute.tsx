import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

export function ProtectedRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // If authenticated but no nickname, redirect to signup
  // ONLY if they are not already on the signup page
  if (isAuthenticated && user && !user.nickname && location.pathname !== '/signup') {
    return <Navigate to="/signup" replace />;
  }

  // If they have a nickname and try to access signup, send them to main
  if (isAuthenticated && user?.nickname && location.pathname === '/signup') {
    return <Navigate to="/main" replace />;
  }

  return <Outlet />;
}
