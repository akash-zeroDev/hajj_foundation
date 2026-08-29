import { useUser, RedirectToSignIn } from '@clerk/react';
import { Navigate } from 'react-router-dom';

export const RequireRole = ({ role, children }) => {
  const { isLoaded, isSignedIn, user } = useUser();

  if (!isLoaded) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-700"></div>
      </div>
    );
  }

  if (!isSignedIn) {
    return <RedirectToSignIn />;
  }

  // Check if the user has the required global role in public metadata
  if (role && user.publicMetadata?.role !== role) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};
