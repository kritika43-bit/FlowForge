'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '../../contexts/auth-context';
import { PrivateRoute } from './private-route';

// Public routes that don't require authentication
const PUBLIC_ROUTES = ['/login', '/signup'];

export default function AuthGuard({ children }) {
  const pathname = usePathname();
  const { isLoading, isAuthenticated } = useAuth();

  // Check if current route is public
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  // If it's a public route, render children directly
  if (isPublicRoute) {
    return children;
  }

  // For protected routes, use PrivateRoute wrapper
  return (
    <PrivateRoute>
      {children}
    </PrivateRoute>
  );
}
