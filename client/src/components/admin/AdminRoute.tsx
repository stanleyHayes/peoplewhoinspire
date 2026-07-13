import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Skeleton, SkeletonText } from '../ui/Skeleton';

interface AdminRouteProps {
  children: React.ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-sm rounded-lg border border-navy-950/10 bg-white p-6 shadow-sm">
          <Skeleton className="mx-auto mb-5 h-14 w-14 rounded-full" />
          <Skeleton className="mx-auto mb-4 h-5 w-36" />
          <SkeletonText lines={3} />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}
