with open('src/App.jsx', 'r') as f:
    code = f.read()

old_router = """const DashboardRouter = () => {
  const { user, isLoaded: userLoaded } = useUser();
  const { isLoaded: orgLoaded, membership } = useOrganization();
  
  if (!userLoaded || !orgLoaded) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  
  if (user?.publicMetadata?.role === 'superadmin') return <Navigate to="/superadmin" replace />;
  if (membership?.role === 'org:admin') return <Navigate to="/admin" replace />;
  
  return <EmployeeDashboard />;
};"""

new_router = """const DashboardRouter = () => {
  const { user, isLoaded: userLoaded } = useUser();
  const { isLoaded: orgLoaded, membership } = useOrganization();
  
  if (!userLoaded || !orgLoaded) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  
  if (user?.publicMetadata?.role === 'superadmin') return <Navigate to="/superadmin" replace />;
  if (membership?.role === 'org:admin') return <Navigate to="/admin" replace />;
  
  return (
    <RequireRole role="org:member">
      <EmployeeDashboard />
    </RequireRole>
  );
};"""

code = code.replace(old_router, new_router)
with open('src/App.jsx', 'w') as f:
    f.write(code)

