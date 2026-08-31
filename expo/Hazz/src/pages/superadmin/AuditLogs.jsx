import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/react';
import SidebarLayout from '../../layouts/SidebarLayout';
import { superAdminNavigation } from '../../config/navigation';

export const AuditLogs = () => {
  const { getToken } = useAuth();
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const token = await getToken();
        const res = await fetch('http://localhost:5000/api/audit-logs', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setLogs(data.data || []);
        }
      } catch (err) {
        console.error('Error fetching audit logs:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const getActionBadge = (action) => {
    switch (action) {
      case 'UPDATED_BANK_ROUTING':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">Bank Routing</span>;
      case 'UPLOADED_DOCUMENT':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">Document Upload</span>;
      case 'EXECUTED_DRAW':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">Draw Executed</span>;
      case 'APPROVED_DRAW':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">Draw Approved</span>;
      case 'DISCARDED_DRAW':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-800 border border-rose-200">Draw Discarded</span>;
      case 'DOWNLOADED_LEDGER_CSV':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 border border-indigo-200">Ledger Download</span>;
      case 'DOWNLOADED_OPS_PDF':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 border border-indigo-200">Summary Download</span>;
      case 'DOWNLOADED_SAVINGS_STATEMENT':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-800 border border-teal-200">Statement Download</span>;
      case 'VIEWED_SIGNED_CONTRACT':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-800 border border-teal-200">Contract Viewed</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200">{action}</span>;
    }
  };

  return (
    <SidebarLayout title="Security & Audit Logs" navigation={superAdminNavigation}>
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Security & Audit Logs</h1>
          <p className="text-slate-500 mt-1">Immutable ledger of sensitive administrative actions across the platform.</p>
        </div>
        <div className="bg-slate-100 px-4 py-2 rounded-lg border border-slate-200 flex items-center gap-2">
           <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
           <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Live Logging Active</span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">System Event Trail</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Admin (Clerk ID)</th>
                <th className="px-6 py-4">Event Type</th>
                <th className="px-6 py-4 w-1/3">Context / Details</th>
                <th className="px-6 py-4">Origin IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500 font-medium">Retrieving security logs...</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500 font-medium">No security events recorded yet.</td>
                </tr>
              ) : (
                logs.map(log => (
                  <tr key={log._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600 font-medium">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                          {log.clerkUserId.substring(5,7).toUpperCase()}
                        </div>
                        <span className="text-slate-900 font-medium text-xs font-mono bg-slate-100 px-2 py-1 rounded">
                          {log.clerkUserId}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getActionBadge(log.action)}
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      {log.details}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-xs font-mono text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-200">
                        {log.ipAddress}
                      </span>
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
