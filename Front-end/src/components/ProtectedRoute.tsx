import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  requireOwnership?: boolean;
  jokeId?: string;
}

export const ProtectedRoute = ({ children, requireOwnership, jokeId }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    // Save the attempted path for redirect after login
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (requireOwnership && jokeId) {
    // This will be handled by the backend, but we can add a frontend check too
    // You would typically fetch the joke details here to verify ownership
    // For now, we'll let the backend handle the authorization
    return <>{children}</>;
  }

  return <>{children}</>;
};
