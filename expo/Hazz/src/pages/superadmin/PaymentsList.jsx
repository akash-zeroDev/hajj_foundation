import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/react';
import { CreditCard, Landmark } from 'lucide-react';
import SidebarLayout from '../../layouts/SidebarLayout';
import { superAdminNavigation } from '../../config/navigation';

export const PaymentsList = () => {
  const { getToken } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({ totalRevenue: 0, totalSavingsPool: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await getToken();
        const [txRes, statsRes] = await Promise.all([
          fetch('http://localhost:5000/api/financials/transactions', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('http://localhost:5000/api/financials/stats', { headers: { Authorization: `Bearer ${token}` } })
        ]);

        if (txRes.ok) {
          const txData = await txRes.json();
          setTransactions(txData.data || []);
        }
        if (statsRes.ok) {
          const stData = await statsRes.json();
          if (stData.success) {
            setStats(stData.data);
          }
        }
      } catch (err) {
        console.error('Error fetching financials:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <SidebarLayout navigation={superAdminNavigation}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Payments & Revenues</h1>
        <p className="text-slate-500 mt-1">Track operating revenue and the global Hajj Savings Pool.</p>
      </div>

      {/* Stats Cards — skeleton while loading, no backend change */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {isLoading ? (
          <>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-pulse">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 bg-slate-200 rounded-lg" />
                <div className="h-3 bg-slate-200 rounded w-1/2" />
              </div>
              <div className="h-8 bg-slate-200 rounded w-1/3 mb-3" />
              <div className="h-3 bg-slate-200 rounded w-1/2" />
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-pulse">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 bg-slate-200 rounded-lg" />
                <div className="h-3 bg-slate-200 rounded w-1/2" />
              </div>
              <div className="h-8 bg-slate-200 rounded w-1/3 mb-3" />
              <div className="h-3 bg-slate-200 rounded w-1/2" />
            </div>
          </>
        ) : (
          <>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <CreditCard size={20} strokeWidth={1.7} className="text-emerald-600" />
                </div>
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Company Revenue (Org Fees)</h3>
              </div>
              <p className="text-3xl font-extrabold text-slate-900">£{stats.totalRevenue.toLocaleString()}</p>
              <p className="text-xs text-slate-400 mt-2">Available for operations</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Landmark size={20} strokeWidth={1.7} className="text-blue-600" />
                </div>
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Savings Pool (AUM)</h3>
              </div>
              <p className="text-3xl font-extrabold text-slate-900">£{stats.totalSavingsPool.toLocaleString()}</p>
              <p className="text-xs text-slate-400 mt-2">Held in trust for Hajj Awards</p>
            </div>
          </>
        )}
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-800">Global Ledger</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Payer</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                [1, 2, 3, 4].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-3 bg-slate-200 rounded w-20" /></td>
                    <td className="px-6 py-4"><div className="h-3 bg-slate-200 rounded w-32 mb-2" /><div className="h-3 bg-slate-200 rounded w-24" /></td>
                    <td className="px-6 py-4"><div className="h-5 bg-slate-200 rounded-full w-24" /></td>
                    <td className="px-6 py-4"><div className="h-3 bg-slate-200 rounded w-16" /></td>
                    <td className="px-6 py-4"><div className="h-5 bg-slate-200 rounded-full w-14" /></td>
                  </tr>
                ))
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-500">No transactions found in the ledger.</td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {tx.payerModel === 'Organisation' ? (
                        <div className="font-medium text-slate-900">{tx.payerId?.companyName || 'Unknown Org'}</div>
                      ) : (
                        <div>
                          <div className="font-medium text-slate-900">{tx.payerId?.firstName} {tx.payerId?.lastName}</div>
                          <div className="text-xs text-slate-500">{tx.orgId?.companyName}</div>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {tx.type === 'employer_fee' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700">Org Setup Fee</span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">Employee Savings</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-900">
                      £{tx.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {tx.status === 'succeeded' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Paid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
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
