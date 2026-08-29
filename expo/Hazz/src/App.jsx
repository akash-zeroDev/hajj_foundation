import { Routes, Route, Navigate } from 'react-router-dom';
import { Show, RedirectToSignIn } from '@clerk/react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import { EmployeeDashboard, AdminDashboard, SuperAdminDashboard, Unauthorized } from './pages/Dashboards';
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
          {/* We can add nested routes for /superadmin/organisations later */}

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
