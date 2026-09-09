import React, { useState, useEffect } from 'react';
import { useAuth, UserProfile } from '@clerk/react';
import { useToast } from '../../context/ToastContext';

export const EmployeeSettings = () => {
  const { getToken, userId } = useAuth();
  const [employeeData, setEmployeeData] = useState(null);

  useEffect(() => {
    const fetchEmployeeData = async () => {
      if (!userId) return;
      try {
        const token = await getToken();
        // Fallback to fetching by clerkId since /me doesn't exist
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/employees/clerk/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const json = await res.json();
          setEmployeeData(json.data);
        }
      } catch (err) {
        console.error('Error fetching employee data:', err);
      }
    };
    fetchEmployeeData();
  }, [userId, getToken]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Locked Financial Data */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            Locked Financial Data
          </h3>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Monthly Contribution</label>
              <input type="text" disabled value={`£${employeeData?.monthlyContribution?.toLocaleString() || 0}`} className="w-full px-3 py-2 bg-slate-100 border border-slate-200 text-slate-500 rounded-md cursor-not-allowed text-sm font-mono" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Total Savings Balance</label>
              <input type="text" disabled value={`£${employeeData?.balance?.toLocaleString() || 0}`} className="w-full px-3 py-2 bg-slate-100 border border-slate-200 text-slate-500 rounded-md cursor-not-allowed text-sm font-mono" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Legal Agreement Status</label>
              <div className="px-3 py-2 bg-slate-100 border border-slate-200 rounded-md flex items-center h-[38px]">
                <span className={`text-xs font-bold uppercase ${employeeData?.agreementStatus === 'signed' ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {employeeData?.agreementStatus || 'Pending'}
                </span>
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-4">
            To update your monthly contribution amount, please navigate to the Contributions tab. To modify your legal status, contact your Employer.
          </p>
        </div>
      </div>

      {/* Clerk UserProfile for editing emails, names, profile pic */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex justify-center p-6">
        <UserProfile routing="hash" appearance={{ elements: { rootBox: { width: '100%' }, card: { width: '100%', maxWidth: '100%', boxShadow: 'none' } } }} />
      </div>
    </div>
  );
};
