import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { useAuth, useOrganization } from '@clerk/react';
import SidebarLayout from '../../layouts/SidebarLayout';
import { orgAdminNavigation } from '../../config/navigation';

export const Settings = () => {
  const { showToast } = useToast();
  const { getToken } = useAuth();
  const { organization } = useOrganization();
  const [orgData, setOrgData] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    registeredAddress: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchOrgData = async () => {
      if (!organization?.id) return;
      try {
        const token = await getToken();
        const res = await fetch(`http://localhost:5000/api/organisations/clerk/${organization.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const json = await res.json();
          setOrgData(json.data);
          setFormData({
            name: json.data.name || '',
            registeredAddress: json.data.registeredAddress || ''
          });
        }
      } catch (err) {
        console.error('Error fetching org data:', err);
      }
    };
    fetchOrgData();
  }, [organization, getToken]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage('');
    try {
      const token = await getToken();
      const res = await fetch(`http://localhost:5000/api/organisations/clerk/${organization.id}`, {
        method: 'PUT',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        const json = await res.json();
        setOrgData(json.data);
        setSuccessMessage('Settings updated successfully.');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      showToast('Failed to update settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (!orgData) return <SidebarLayout title="Settings" navigation={orgAdminNavigation}><div className="max-w-3xl animate-pulse"><div className="h-7 bg-slate-200 rounded w-1/3 mb-2" /><div className="h-3 bg-slate-200 rounded w-1/2 mb-8" /><div className="bg-white border border-slate-200 rounded-xl p-6"><div className="h-4 bg-slate-200 rounded w-1/4 mb-4" /><div className="h-10 bg-slate-200 rounded w-full mb-4" /><div className="h-10 bg-slate-200 rounded w-full" /></div></div></SidebarLayout>;

  return (
    <SidebarLayout title="Company Settings" navigation={orgAdminNavigation}>
      <div className="max-w-3xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Company Settings</h1>
          <p className="text-slate-500 mt-1">Manage your organisation profile. Some fields are locked for financial compliance.</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Organisation Profile</h2>
            {successMessage && <span className="text-emerald-600 text-sm font-medium flex items-center gap-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg> {successMessage}</span>}
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            
            {/* Editable Fields */}
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Registered Address</label>
                <textarea 
                  name="registeredAddress"
                  value={formData.registeredAddress}
                  onChange={handleChange}
                  required
                  rows="3"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                ></textarea>
              </div>
            </div>

            <hr className="border-slate-200" />
            
            {/* Locked Fields */}
            <div>
              <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                Locked Compliance Data
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Company Registration Number</label>
                  <input type="text" disabled value={orgData.companyNumber} className="w-full px-3 py-2 bg-slate-100 border border-slate-200 text-slate-500 rounded-md cursor-not-allowed text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Annual Platform Fee</label>
                  <input type="text" disabled value={`£${orgData.annualFee.toLocaleString()}`} className="w-full px-3 py-2 bg-slate-100 border border-slate-200 text-slate-500 rounded-md cursor-not-allowed text-sm font-mono" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Fee Payment Status</label>
                  <div className="px-3 py-2 bg-slate-100 border border-slate-200 rounded-md flex items-center">
                    <span className={`text-xs font-bold uppercase ${orgData.annualFeeStatus === 'paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {orgData.annualFeeStatus}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">System Organization ID</label>
                  <input type="text" disabled value={orgData.clerkOrganizationId} className="w-full px-3 py-2 bg-slate-100 border border-slate-200 text-slate-500 rounded-md cursor-not-allowed text-sm font-mono" />
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-3">
                Locked fields are bound by your service contract. If you need to update your registration number or fee structure, please contact Hajj Savings support.
              </p>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </SidebarLayout>
  );
};
