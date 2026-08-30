import React, { useState, useEffect } from 'react';
import { useAuth, useOrganization } from '@clerk/react';
import SidebarLayout from '../../layouts/SidebarLayout';
import { orgAdminNavigation } from '../../config/navigation';

export const AgreementsTracking = () => {
  const { getToken } = useAuth();
  const { organization, isLoaded: orgLoaded } = useOrganization();
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAgreements = async () => {
      if (!orgLoaded || !organization) return;
      try {
        setIsLoading(true);
        const token = await getToken();
        const res = await fetch(`http://localhost:5000/api/organisations/clerk/${organization.id}/employee-agreements`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setEmployees(data.data || []);
        }
      } catch (err) {
        console.error('Error fetching agreements:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAgreements();
  }, [orgLoaded, organization]);

  const signedCount = employees.filter(e => e.agreementStatus === 'signed').length;
  const pendingCount = employees.filter(e => e.agreementStatus !== 'signed').length;
  const totalCount = employees.length;

  return (
    <SidebarLayout title="Agreements Tracking" navigation={orgAdminNavigation}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Master Agreements</h1>
        <p className="text-slate-500 mt-1">Track which employees have reviewed and signed the Shariah agreements.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <p className="text-sm font-medium text-slate-500 mb-1">Total Enrolled</p>
          <p className="text-3xl font-black text-slate-900">{totalCount}</p>
        </div>
        <div className="bg-emerald-50 rounded-xl shadow-sm border border-emerald-200 p-6">
          <p className="text-sm font-medium text-emerald-700 mb-1">Fully Compliant (Signed)</p>
          <p className="text-3xl font-black text-emerald-900">{signedCount}</p>
        </div>
        <div className="bg-amber-50 rounded-xl shadow-sm border border-amber-200 p-6">
          <p className="text-sm font-medium text-amber-700 mb-1">Pending Signature</p>
          <p className="text-3xl font-black text-amber-900">{pendingCount}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-800">Employee Audit Trail</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">Employee Name</th>
                <th className="px-6 py-3">Legal Status</th>
                <th className="px-6 py-3">Date Signed</th>
                <th className="px-6 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-slate-500">Loading tracking data...</td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-slate-500">No employees found.</td>
                </tr>
              ) : (
                employees.map(emp => (
                  <tr key={emp._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900">
                      {emp.firstName} {emp.lastName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {emp.agreementStatus === 'signed' ? (
                         <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                           <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                           Signed
                         </span>
                      ) : (
                         <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                           <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/></svg>
                           Pending
                         </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                      {emp.agreementStatus === 'signed' 
                        ? new Date(emp.updatedAt).toLocaleString() 
                        : '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {emp.agreementStatus === 'signed' ? (
                        <button className="text-emerald-600 hover:text-emerald-800 font-medium text-sm">Download PDF</button>
                      ) : (
                        <button className="text-slate-400 cursor-not-allowed font-medium text-sm" disabled>Unavailable</button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </SidebarLayout>
  );
};
