import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '@clerk/react';
import SidebarLayout from '../../layouts/SidebarLayout';
import { employeeNavigation } from '../../config/navigation';

export const EmployeeSettings = () => {
  const { showToast } = useToast();
  const { getToken, userId } = useAuth();
  const [employeeData, setEmployeeData] = useState(null);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchEmployeeData = async () => {
      if (!userId) return;
      try {
        const token = await getToken();
        // Just fetch the basic profile to populate settings
        const res = await fetch(`http://localhost:5000/api/employees/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const json = await res.json();
          setEmployeeData(json.data);
          setFormData({
            firstName: json.data.firstName || '',
            lastName: json.data.lastName || '',
            phone: json.data.phone || ''
          });
        }
      } catch (err) {
        console.error('Error fetching employee data:', err);
      }
    };
    fetchEmployeeData();
  }, [userId, getToken]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage('');
    try {
      const token = await getToken();
      const res = await fetch(`http://localhost:5000/api/employees/clerk/${userId}`, {
        method: 'PUT',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        const json = await res.json();
        setEmployeeData(json.data);
        setSuccessMessage('Profile updated successfully.');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showToast('Failed to update profile', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (!employeeData) return <SidebarLayout title="Settings" navigation={employeeNavigation}><div className="p-8">Loading profile...</div></SidebarLayout>;

  return (
    <SidebarLayout title="Personal Settings" navigation={employeeNavigation}>
      <div className="max-w-3xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Personal Profile</h1>
          <p className="text-slate-500 mt-1">Manage your personal contact details. Financial settings are locked.</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Contact Details</h2>
            {successMessage && <span className="text-emerald-600 text-sm font-medium flex items-center gap-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg> {successMessage}</span>}
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            
            {/* Editable Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                <input 
                  type="text" 
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                <input 
                  type="text" 
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                <input 
                  type="tel" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>

            <hr className="border-slate-200" />
            
            {/* Locked Fields */}
            <div>
              <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                Locked Financial Data
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Monthly Contribution</label>
                  <input type="text" disabled value={`£${employeeData.monthlyContribution?.toLocaleString() || 0}`} className="w-full px-3 py-2 bg-slate-100 border border-slate-200 text-slate-500 rounded-md cursor-not-allowed text-sm font-mono" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Total Savings Balance</label>
                  <input type="text" disabled value={`£${employeeData.balance?.toLocaleString() || 0}`} className="w-full px-3 py-2 bg-slate-100 border border-slate-200 text-slate-500 rounded-md cursor-not-allowed text-sm font-mono" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-500 mb-1">Legal Agreement Status</label>
                  <div className="px-3 py-2 bg-slate-100 border border-slate-200 rounded-md flex items-center">
                    <span className={`text-xs font-bold uppercase ${employeeData.agreementStatus === 'signed' ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {employeeData.agreementStatus}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-3">
                To update your monthly contribution amount, please navigate to the Contributions tab. To modify your legal status, contact your Employer.
              </p>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </SidebarLayout>
  );
};
