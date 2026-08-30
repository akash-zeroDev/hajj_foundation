import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/react';
import SidebarLayout from '../../layouts/SidebarLayout';
import { superAdminNavigation } from '../../config/navigation';

export const BankAccounts = () => {
  const { getToken } = useAuth();
  const [banks, setBanks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form State
  const [accountType, setAccountType] = useState('operating_revenue');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [sortCode, setSortCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const fetchBanks = async () => {
    try {
      setIsLoading(true);
      const token = await getToken();
      const res = await fetch('http://localhost:5000/api/banks', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setBanks(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching banks:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBanks();
  }, []);

  const handleUpdateBank = async (e) => {
    e.preventDefault();
    setMessage('');
    
    // Strict Confirmation
    const confirmMessage = accountType === 'operating_revenue' 
      ? "WARNING: You are about to change where Corporate Revenues are deposited. Are you absolutely sure?" 
      : "WARNING: You are about to change the Trust Account routing for Employee Savings. Are you absolutely sure?";
      
    if (!window.confirm(confirmMessage)) return;

    setIsSaving(true);
    try {
      const token = await getToken();
      const res = await fetch('http://localhost:5000/api/banks/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ accountType, accountHolderName, sortCode, accountNumber })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setIsError(false);
        setMessage('Bank account successfully updated via Stripe API.');
        // Clear sensitive fields
        setSortCode('');
        setAccountNumber('');
        fetchBanks(); // Refresh list
      } else {
        setIsError(true);
        setMessage(data.message || 'Failed to update bank account.');
      }
    } catch (err) {
      console.error(err);
      setIsError(true);
      setMessage('A critical error occurred while updating the bank account.');
    } finally {
      setIsSaving(false);
    }
  };

  const operatingBank = banks.find(b => b.accountType === 'operating_revenue');
  const trustBank = banks.find(b => b.accountType === 'hajj_trust_pool');

  return (
    <SidebarLayout title="Bank Accounts" navigation={superAdminNavigation}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Routing Configuration</h1>
        <p className="text-slate-500 mt-1">Manage the destination bank accounts for automated Stripe payouts.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Current Configuration */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
              </div>
              <h3 className="font-bold text-slate-800">Corporate Operating Account</h3>
            </div>
            {isLoading ? (
              <p className="text-sm text-slate-500">Loading...</p>
            ) : operatingBank ? (
              <div>
                <p className="text-sm text-slate-500 mb-1">Routes: <span className="font-medium text-slate-700">£12,300 Employer Fees</span></p>
                <p className="text-lg font-bold text-slate-900">{operatingBank.bankName}</p>
                <p className="text-sm text-slate-600 font-mono">**** **** **** {operatingBank.last4}</p>
                <p className="text-xs text-slate-400 mt-2 uppercase">Stripe Ref: {operatingBank.stripeBankAccountId}</p>
              </div>
            ) : (
              <p className="text-sm text-red-500 font-medium">Not Configured</p>
            )}
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </div>
              <h3 className="font-bold text-slate-800">Hajj Trust Account</h3>
            </div>
            {isLoading ? (
              <p className="text-sm text-slate-500">Loading...</p>
            ) : trustBank ? (
              <div>
                <p className="text-sm text-slate-500 mb-1">Routes: <span className="font-medium text-slate-700">£50/mo Employee Savings</span></p>
                <p className="text-lg font-bold text-slate-900">{trustBank.bankName}</p>
                <p className="text-sm text-slate-600 font-mono">**** **** **** {trustBank.last4}</p>
                <p className="text-xs text-slate-400 mt-2 uppercase">Stripe Ref: {trustBank.stripeBankAccountId}</p>
              </div>
            ) : (
              <p className="text-sm text-red-500 font-medium">Not Configured</p>
            )}
          </div>
        </div>

        {/* Right Column: Update Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h2 className="text-lg font-bold text-slate-800">Update Routing Destination</h2>
              <p className="text-sm text-slate-500">Securely push new bank details to Stripe's Payout API.</p>
            </div>
            
            <form onSubmit={handleUpdateBank} className="p-6 space-y-5">
              
              {message && (
                <div className={`p-4 rounded-lg text-sm font-medium ${isError ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                  {message}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Which routing rule are you updating?</label>
                <select 
                  value={accountType}
                  onChange={(e) => setAccountType(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                >
                  <option value="operating_revenue">Corporate Operating Account (Employer Fees)</option>
                  <option value="hajj_trust_pool">Hajj Trust Account (Employee Savings)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Account Holder Name</label>
                <input 
                  type="text" 
                  required
                  value={accountHolderName}
                  onChange={(e) => setAccountHolderName(e.target.value)}
                  placeholder="Eden Holdings Ltd"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Sort Code</label>
                  <input 
                    type="text" 
                    required
                    pattern="[0-9]{6}"
                    maxLength="6"
                    value={sortCode}
                    onChange={(e) => setSortCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-mono"
                  />
                  <p className="text-xs text-slate-500 mt-1">6 digits, no dashes</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Account Number</label>
                  <input 
                    type="text" 
                    required
                    pattern="[0-9]{8}"
                    maxLength="8"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="12345678"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-mono"
                  />
                  <p className="text-xs text-slate-500 mt-1">8 digits</p>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex gap-3 mt-6">
                <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <p className="text-sm text-blue-800">
                  <strong>Security Notice:</strong> Your full bank details are immediately transmitted to Stripe via a secure API and are <strong>never stored</strong> in our database. We only store the last 4 digits for display purposes.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button 
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSaving ? 'Updating API...' : 'Update Routing via Stripe'}
                </button>
              </div>
            </form>

          </div>
        </div>
      </div>
    </SidebarLayout>
  );
};
