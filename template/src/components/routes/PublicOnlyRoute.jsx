import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PublicOnlyRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 font-medium text-sm">Loading...</p>
      </div>
    );
  }

  // If already authenticated, redirect to their role dashboard or the previous page they wanted
  if (isAuthenticated && user) {
    const from = location.state?.from?.pathname;
    if (from) {
      return <Navigate to={from} replace />;
    }
    const dashboardRoute = user.role === 'recruiter' ? '/recruiter/dashboard' : '/candidate/dashboard';
    return <Navigate to={dashboardRoute} replace />;
  }

  return children;
};

export default PublicOnlyRoute;
