import { useUser, useOrganization, RedirectToSignIn } from '@clerk/react';
import { Navigate } from 'react-router-dom';

export const RequireRole = ({ role, children }) => {
  const { isLoaded: userLoaded, isSignedIn, user } = useUser();
  const { isLoaded: orgLoaded, membership } = useOrganization();

  if (!userLoaded || (isSignedIn && !orgLoaded)) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-700"></div>
      </div>
    );
  }

  if (!isSignedIn) {
    return <RedirectToSignIn />;
  }

  // Handle Superadmin (Global Role)
  if (role === 'superadmin') {
    if (user.publicMetadata?.role !== 'superadmin') {
      return <Navigate to="/unauthorized" replace />;
    }
  } 
  // Handle Org Admin (Clerk B2B Role)
  else if (role === 'org:admin') {
    if (!membership || membership.role !== 'org:admin') {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
};
