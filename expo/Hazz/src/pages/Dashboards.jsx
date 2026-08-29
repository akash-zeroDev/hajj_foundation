import { useState } from 'react';
import { useUser } from '@clerk/react';
import api from '../api/axios';
import SidebarLayout from '../layouts/SidebarLayout';
import { superAdminNavigation } from '../config/navigation';

// Old Layout kept temporarily for Employee/Admin until they are migrated
const OldLayout = ({ title, children, description }) => {
  const { user } = useUser();
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50">
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 leading-tight">{title}</h1>
              {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};

export const EmployeeDashboard = () => (
  <OldLayout title="Employee Portal" description="Manage your contributions, view balances, and download statements.">
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
      <h3 className="text-lg font-medium text-slate-900">No Contributions Yet</h3>
    </div>
  </OldLayout>
);

export const AdminDashboard = () => (
  <OldLayout title="Organisation Administrator" description="Manage your employees, view signed agreements, and pay annual fees.">
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
      <h3 className="text-lg font-medium text-slate-900">Your Team</h3>
    </div>
  </OldLayout>
);

export const SuperAdminDashboard = () => {
  return (
    <SidebarLayout navigation={superAdminNavigation} title="Dashboard Overview">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 flex flex-col items-center justify-center text-center min-h-[400px]">
         <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
         </div>
         <h3 className="text-xl font-bold text-slate-900 mb-2">No Organisations Yet</h3>
         <p className="text-slate-500 max-w-md mx-auto mb-6">
            You haven't onboarded any organisations yet. Get started by setting up the first participating organisation.
         </p>
         {/* We will wire this button up to an onboarding flow shortly */}
         <button className="flex items-center justify-center py-2.5 px-6 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition">
            + Onboard Organisation
         </button>
      </div>
    </SidebarLayout>
  );
};

export const Unauthorized = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
    <div className="max-w-md w-full text-center">
      <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Access Denied</h1>
      <p className="text-slate-600 mb-8">You do not have the required permissions to view this dashboard.</p>
      <button 
        onClick={() => window.history.back()} 
        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 transition"
      >
        Go Back
      </button>
    </div>
  </div>
);
