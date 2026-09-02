import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/react';
import SidebarLayout from '../../layouts/SidebarLayout';
import { superAdminNavigation } from '../../config/navigation';
import { Building, Wallet } from 'lucide-react';
import SearchFilterBar from '../../components/SearchFilterBar';


export const PaymentsList = () => {
  const { getToken } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
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

  
  const filteredTransactions = transactions.filter(tx => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    
    let payerName = '';
    let orgName = '';
    
    if (tx.payerModel === 'Organisation') {
      payerName = tx.payerId?.name || '';
      orgName = tx.payerId?.name || '';
    } else {
      payerName = `${tx.payerId?.firstName || ''} ${tx.payerId?.lastName || ''}`;
      orgName = tx.orgId?.name || '';
    }
    
    return payerName.toLowerCase().includes(term) || orgName.toLowerCase().includes(term);
  });

  return (
    <SidebarLayout navigation={superAdminNavigation}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Payments & Revenues</h1>
        <p className="text-slate-500 mt-1">Track operating revenue and the global Hajj Savings Pool.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-slate-100 rounded-lg">
              <Building className="w-5 h-5 text-slate-800" />
            </div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Company Revenue (Org Fees)</h3>
          </div>
          <p className="text-3xl font-extrabold text-slate-900">£{stats.totalRevenue.toLocaleString()}</p>
          <p className="text-xs text-slate-400 mt-2">Available for operations</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-slate-100 rounded-lg">
              <Wallet className="w-5 h-5 text-slate-800" />
            </div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Savings Pool (AUM)</h3>
          </div>
          <p className="text-3xl font-extrabold text-slate-900">£{stats.totalSavingsPool.toLocaleString()}</p>
          <p className="text-xs text-slate-400 mt-2">Held in trust for Hajj Awards</p>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <SearchFilterBar 
          searchTerm={searchTerm} 
          setSearchTerm={setSearchTerm} 
          placeholder="Search by payer or organisation..." 
          containerClassName="flex-1 max-w-md"
        />
      </div>

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
                <th className="px-6 py-3">Organisation</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-500">Loading transactions...</td>
                </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-500">No transactions found in the ledger.</td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {tx.payerModel === 'Organisation' ? (
                        <div className="font-medium text-slate-900 truncate max-w-[150px]" title={tx.payerId?.name || 'Unknown Org'}>{tx.payerId?.name || 'Unknown Org'}</div>
                      ) : (
                        <div className="font-medium text-slate-900 truncate max-w-[150px]" title={`${tx.payerId?.firstName || ''} ${tx.payerId?.lastName || ''}`}>{tx.payerId?.firstName} {tx.payerId?.lastName}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-slate-600 truncate max-w-[150px] sm:max-w-[200px]" title={tx.payerModel === 'Organisation' ? (tx.payerId?.name || 'Unknown Org') : (tx.orgId?.name || 'Unknown Org')}>
                        {tx.payerModel === 'Organisation' ? (tx.payerId?.name || 'Unknown Org') : (tx.orgId?.name || 'Unknown Org')}
                      </div>
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
