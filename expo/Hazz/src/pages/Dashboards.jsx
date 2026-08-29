import { useState } from 'react';
import { useUser, useAuth } from '@clerk/react';
import SidebarLayout from '../layouts/SidebarLayout';
import { superAdminNavigation } from '../config/navigation';

// ... (OldLayout and Employee/Admin Dashboards unchanged for now)

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
  const { getToken } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    orgName: '', companyNumber: '', address: '',
    adminFirstName: '', adminLastName: '', adminEmail: '', adminPhone: '',
    annualFee: ''
  });
  const [file, setFile] = useState(null);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const token = await getToken();
      
      const submitData = new FormData();
      Object.keys(formData).forEach(key => submitData.append(key, formData[key]));
      if (file) submitData.append('agreementFile', file);

      const response = await fetch('http://localhost:5000/api/organisations/onboard', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: submitData
      });

      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message || 'Failed to onboard organisation');

      alert("Success! " + data.message);
      setIsCreating(false);
      setFormData({
        orgName: '', companyNumber: '', address: '',
        adminFirstName: '', adminLastName: '', adminEmail: '', adminPhone: '',
        annualFee: ''
      });
      setFile(null);
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isCreating) {
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
           <button 
             onClick={() => setIsCreating(true)}
             className="flex items-center justify-center py-2.5 px-6 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition"
           >
              + Onboard Organisation
           </button>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout navigation={superAdminNavigation} title="Onboard New Organisation">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-200 bg-slate-50/50">
          <h2 className="text-xl font-bold text-slate-800">Organisation Onboarding Form</h2>
          <p className="text-sm text-slate-500 mt-1">Fill out the details below to create a new tenant organisation and invite their administrator.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Section 1 */}
          <div>
            <h3 className="text-lg font-bold text-emerald-800 border-b border-slate-200 pb-2 mb-5 flex items-center gap-2">
              <span className="bg-emerald-100 text-emerald-800 w-6 h-6 rounded-full flex items-center justify-center text-sm">1</span>
              Company Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Organisation Name</label>
                <input required type="text" name="orgName" value={formData.orgName} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Company / Charity Number</label>
                <input required type="text" name="companyNumber" value={formData.companyNumber} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Registered Address</label>
                <textarea required name="address" value={formData.address} onChange={handleChange} rows="3" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none resize-none"></textarea>
              </div>
            </div>
          </div>

          {/* Section 2 */}
          <div>
            <h3 className="text-lg font-bold text-emerald-800 border-b border-slate-200 pb-2 mb-5 flex items-center gap-2">
              <span className="bg-emerald-100 text-emerald-800 w-6 h-6 rounded-full flex items-center justify-center text-sm">2</span>
              Administrator Profile
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                <input required type="text" name="adminFirstName" value={formData.adminFirstName} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                <input required type="text" name="adminLastName" value={formData.adminLastName} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Admin Email</label>
                <input required type="email" name="adminEmail" value={formData.adminEmail} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                <input required type="tel" name="adminPhone" value={formData.adminPhone} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
            </div>
          </div>

          {/* Section 3 */}
          <div>
            <h3 className="text-lg font-bold text-emerald-800 border-b border-slate-200 pb-2 mb-5 flex items-center gap-2">
              <span className="bg-emerald-100 text-emerald-800 w-6 h-6 rounded-full flex items-center justify-center text-sm">3</span>
              Financials & Agreements
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Agreed Annual Fee</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-slate-500 sm:text-sm">£</span>
                  </div>
                  <input required type="number" name="annualFee" value={formData.annualFee} onChange={handleChange} className="w-full pl-8 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="0.00" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Initial Signed Agreement (PDF)</label>
                <input type="file" accept=".pdf" onChange={handleFileChange} className="w-full px-4 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100" />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-6 border-t border-slate-200 flex justify-end gap-4">
            <button 
              type="button" 
              onClick={() => setIsCreating(false)}
              className="px-6 py-2.5 border border-slate-300 rounded-lg shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isLoading}
              className="px-6 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition disabled:opacity-50"
            >
              {isLoading ? 'Processing...' : 'Complete Onboarding'}
            </button>
          </div>
        </form>
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
