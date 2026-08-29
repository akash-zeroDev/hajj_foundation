import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    // User not logged in, redirect to login page
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // User logged in but doesn't have the right role
    return <Navigate to="/unauthorized" replace />;
  }

  // User logged in and has permission, render the child routes
  return <Outlet />;
};

export default ProtectedRoute;
