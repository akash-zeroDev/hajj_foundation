import { Routes, Route, Navigate } from 'react-router-dom';
import { Show, RedirectToSignIn } from '@clerk/react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import { EmployeeDashboard, AdminDashboard, SuperAdminDashboard, Unauthorized } from './pages/Dashboards';
import { EmployeeSettings } from './pages/employee/Settings';
import { OrganisationsList } from './pages/superadmin/OrganisationsList';
import { OrganisationDetails } from './pages/superadmin/OrganisationDetails';
import { UsersList } from './pages/superadmin/UsersList';
import { AdminEmployees } from './pages/admin/AdminEmployees';
import { PaymentsList } from './pages/superadmin/PaymentsList';
import { AwardsManagement } from './pages/superadmin/AwardsManagement';
import { BankAccounts } from './pages/superadmin/BankAccounts';
import { DocumentManagement } from './pages/superadmin/DocumentManagement';
import { Reports } from './pages/superadmin/Reports';
import { AuditLogs } from './pages/superadmin/AuditLogs';
import { AdminPayments } from './pages/admin/AdminPayments';
import { AgreementsTracking } from './pages/admin/AgreementsTracking';
import { Settings } from './pages/admin/Settings';
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
        <Route path="/" element={null} />
        <Route path="/superadmin/*" element={null} />
        <Route path="/admin/*" element={null} />
        <Route path="/dashboard" element={null} />
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
          <Route 
            path="/superadmin/payments" 
            element={
              <RequireRole role="superadmin">
                <PaymentsList />
              </RequireRole>
            } 
          />
          <Route 
            path="/superadmin/awards" 
            element={
              <RequireRole role="superadmin">
                <AwardsManagement />
              </RequireRole>
            } 
          />
          <Route 
            path="/superadmin/banks" 
            element={
              <RequireRole role="superadmin">
                <BankAccounts />
              </RequireRole>
            } 
          />
          <Route 
            path="/superadmin/documents" 
            element={
              <RequireRole role="superadmin">
                <DocumentManagement />
              </RequireRole>
            } 
          />
          <Route 
            path="/superadmin/reports" 
            element={
              <RequireRole role="superadmin">
                <Reports />
              </RequireRole>
            } 
          />
          <Route 
            path="/superadmin/audit" 
            element={
              <RequireRole role="superadmin">
                <AuditLogs />
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
          <Route 
            path="/admin/payments" 
            element={
              <RequireRole role="org:admin">
                <AdminPayments />
              </RequireRole>
            } 
          />
          <Route 
            path="/admin/agreements" 
            element={
              <RequireRole role="org:admin">
                <AgreementsTracking />
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

          {/* Dashboard Catch-alls to prevent landing page drops */}
          <Route path="/admin/*" element={<Navigate to="/unauthorized" replace />} />
          <Route path="/superadmin/*" element={<Navigate to="/unauthorized" replace />} />
          
          {/* Global Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
