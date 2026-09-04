import React, { useState, useEffect } from 'react';
import { useAuth, useOrganization } from '@clerk/react';
import SidebarLayout from '../../layouts/SidebarLayout';
import { orgAdminNavigation } from '../../config/navigation';

export const AdminPayments = () => {
  const { getToken } = useAuth();
  const { organization } = useOrganization();
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [members, setMembers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!organization) return;
      try {
        const token = await getToken();
        // Since organization.id is the Clerk ID, but our backend expects the mongo orgId for this endpoint.
        // Wait, does the backend expect mongo orgId? 
        // Let's pass the Clerk ID as a query param, or update the backend to handle it.
        // Actually, our previous route was `GET /api/financials/org-transactions/:orgId`. 
        // If we only have clerk organization.id here, we should pass it and let backend resolve it.
        // I will change the backend to use ?clerkOrgId= instead. For now I'll pass it as :orgId but it's a clerk ID!
        // Actually, I'll pass clerkOrgId in query. Let's adjust backend in a moment if needed. 
        // Our controller uses `req.params.orgId`. Let's just use `organization.id` and I'll patch the controller to find by clerkId.
        
        const res = await fetch(`http://localhost:5000/api/financials/org-transactions/${organization.id}`, { 
          headers: { Authorization: `Bearer ${token}` } 
        });

        if (res.ok) {
          const data = await res.json();
          const txs = data.data || [];
          
          try {
            const orgMembers = await organization.getMemberships();
            setMembers(orgMembers?.data || orgMembers || []);
          } catch (e) {
            console.error("Failed to fetch members", e);
          }

          // Pin Admin payments (employer_fee) to the top, then sort by date
          txs.sort((a, b) => {
            if (a.payerModel === 'Organisation' && b.payerModel !== 'Organisation') return -1;
            if (a.payerModel !== 'Organisation' && b.payerModel === 'Organisation') return 1;
            return new Date(b.createdAt) - new Date(a.createdAt);
          });
          setTransactions(txs);
        }
      } catch (err) {
        console.error('Error fetching org transactions:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [organization]);

  return (
    <SidebarLayout navigation={orgAdminNavigation}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Employee Payments</h1>
        <p className="text-slate-500 mt-1">Track monthly Hajj Savings contributions made by your employees.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-800">Transactions Ledger</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Employee Name</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-500">Loading transactions...</td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-500">No transactions found for your employees yet.</td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900">
                      {tx.payerModel === 'Organisation' ? (
                        <div className="flex items-center gap-2">
                          {`${tx.payerId?.adminFirstName || ''} ${tx.payerId?.adminLastName || ''}`.trim() || 'Organisation Admin'}
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border bg-indigo-50 text-indigo-700 border-indigo-200">
                            Administrator
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          {`${tx.payerId?.firstName || ''} ${tx.payerId?.lastName || ''}`.trim() || 'Unknown'}
                          {tx.payerId?.isRemoved && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200 uppercase tracking-wider">
                              Removed
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                      {(() => {
                        if (tx.payerModel === 'Organisation') return tx.payerId?.adminEmail || '';
                        const clerkId = tx.payerId?.clerkUserId;
                        const member = members.find(m => m.publicUserData?.userId === clerkId);
                        const foundEmail = member?.publicUserData?.identifier || tx.payerId?.email;
                        
                        if (foundEmail) return foundEmail;
                        if (tx.payerId?.isRemoved) return <span className="italic text-slate-400">Unavailable</span>;
                        return '';
                      })()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-900">
                      £{tx.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {tx.status === 'succeeded' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Paid
                        </span>
                      ) : tx.status === 'failed' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                          Failed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                          {tx.status}
                        </span>
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
