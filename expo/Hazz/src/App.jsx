import { Routes, Route, Navigate } from 'react-router-dom';
import { Show, RedirectToSignIn } from '@clerk/react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import { EmployeeDashboard, AdminDashboard, SuperAdminDashboard, Unauthorized } from './pages/Dashboards';
import { OrganisationsList } from './pages/superadmin/OrganisationsList';
import { OrganisationDetails } from './pages/superadmin/OrganisationDetails';
import { UsersList } from './pages/superadmin/UsersList';
import { AdminEmployees } from './pages/admin/AdminEmployees';
import { RequireRole } from './components/RequireRole';

const ProtectedRoute = ({ children }) => (
  <>
    <Show when="signed-in">{children}</Show>
    <Show when="signed-out"><RedirectToSignIn /></Show>
  </>
);

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      {/* 
        We only show the global Navbar if the user is NOT on the superadmin route.
        The SuperAdmin layout has its own sidebar and top header. 
      */}
      <Routes>
        <Route path="/superadmin/*" element={null} />
        <Route path="*" element={<Navbar />} />
      </Routes>

      <main className="flex-grow">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Super Admin Routes (Using SidebarLayout which fills the screen) */}
          <Route 
            path="/superadmin" 
            element={
              <RequireRole role="superadmin">
                <SuperAdminDashboard />
              </RequireRole>
            } 
          />
          <Route 
            path="/superadmin/organisations" 
            element={
              <RequireRole role="superadmin">
                <OrganisationsList />
              </RequireRole>
            } 
          />
          <Route 
            path="/superadmin/organisations/:id" 
            element={
              <RequireRole role="superadmin">
                <OrganisationDetails />
              </RequireRole>
            } 
          />
          <Route 
            path="/superadmin/users" 
            element={
              <RequireRole role="superadmin">
                <UsersList />
              </RequireRole>
            } 
          />

          {/* Org Admin Routes */}
          <Route 
            path="/admin" 
            element={
              <RequireRole role="org:admin">
                <AdminDashboard />
              </RequireRole>
            } 
          />
          <Route 
            path="/admin/employees" 
            element={
              <RequireRole role="org:admin">
                <AdminEmployees />
              </RequireRole>
            } 
          />

          {/* Other Protected Routes (Legacy layout) */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              {/* Temporary routing logic until Organization roles are fully set up */}
              <EmployeeDashboard />
            </ProtectedRoute>
          } />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
