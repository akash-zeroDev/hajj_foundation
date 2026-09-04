import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '@clerk/react';
import { Landmark, Lock, Info, Check } from 'lucide-react';
import SidebarLayout from '../../layouts/SidebarLayout';
import PrimaryButton from '../../components/PrimaryButton';
import CustomSelect from '../../components/CustomSelect';
import { superAdminNavigation } from '../../config/navigation';

export const BankAccounts = () => {
  const { showToast } = useToast();
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
      <div className="flex flex-col">
        {/* Page Head */}
        <div className="mb-[18px]">
          <h3 className="m-0 text-[23px] tracking-[-0.5px] font-bold text-[#0e1a16]">Routing Configuration</h3>
          <p className="m-0 mt-[5px] text-[#5c6b65] text-[13.5px]">Manage the destination bank accounts used for automated payouts.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-[16px] items-start">
          
          {/* Left Column: Accounts Stack */}
          <div className="grid gap-[16px]">
            {/* Corporate Account — skeleton while loading */}
            {isLoading ? (
              <div className="bg-white border border-[#e6ecea] rounded-[14px] shadow-[0_1px_2px_rgba(14,26,22,.04),0_8px_24px_-18px_rgba(14,26,22,.35)] p-[18px] animate-pulse">
                <div className="flex items-center gap-[12px]">
                  <div className="w-[38px] h-[38px] rounded-[11px] bg-slate-200" />
                  <div className="h-4 bg-slate-200 rounded w-1/2" />
                  <div className="ml-auto h-5 w-12 bg-slate-200 rounded-full" />
                </div>
                <div className="mt-[14px] grid gap-[9px]">
                  {[1,2,3,4].map(i => <div key={i} className="flex justify-between"><div className="h-3 bg-slate-200 rounded w-1/4" /><div className="h-3 bg-slate-200 rounded w-1/3" /></div>)}
                </div>
              </div>
            ) : (
            <div className="bg-white border border-[#e6ecea] rounded-[14px] shadow-[0_1px_2px_rgba(14,26,22,.04),0_8px_24px_-18px_rgba(14,26,22,.35)] p-[18px]">
              <div className="flex items-center gap-[12px]">
                <span className="w-[38px] h-[38px] rounded-[11px] grid place-items-center bg-[rgba(11,122,91,.10)] text-[#0b7a5b] flex-shrink-0">
                  <Landmark className="w-[18px] h-[18px] stroke-[1.8]" />
                </span>
                <h4 className="m-0 text-[14.5px] font-bold tracking-[-0.2px] text-[#0e1a16] leading-snug">Corporate Operating<br/>Account</h4>
                {operatingBank ? (
                  <span className="ml-auto text-[11px] font-semibold px-[9px] py-[3px] rounded-full bg-[rgba(23,163,119,.14)] text-[#0b7a5b]">Active</span>
                ) : (
                  <span className="ml-auto text-[11px] font-semibold px-[9px] py-[3px] rounded-full bg-[#fdf3e3] text-[#c8811f]">Pending</span>
                )}
              </div>
              <div className="mt-[14px] grid gap-[9px]">
                <div className="flex justify-between text-[13px]"><span className="text-[#8a9994]">Holder</span><b className="font-semibold text-[#0e1a16] font-variant-numeric:tabular-nums">{operatingBank?.bankName || 'Not set'}</b></div>
                <div className="flex justify-between text-[13px]"><span className="text-[#8a9994]">Sort code</span><b className="font-semibold text-[#0e1a16] font-variant-numeric:tabular-nums">{operatingBank ? '04-00-••' : 'Not set'}</b></div>
                <div className="flex justify-between text-[13px]"><span className="text-[#8a9994]">Account</span><b className="font-semibold text-[#0e1a16] font-variant-numeric:tabular-nums">{operatingBank ? `•••• ${operatingBank.last4}` : 'Not set'}</b></div>
                <div className="flex justify-between text-[13px]"><span className="text-[#8a9994]">Purpose</span><b className="font-semibold text-[#0e1a16] font-variant-numeric:tabular-nums">Employer fees</b></div>
              </div>
            </div>
            )}

            {/* Trust Account — skeleton while loading */}
            {isLoading ? (
              <div className="bg-white border border-[#e6ecea] rounded-[14px] shadow-[0_1px_2px_rgba(14,26,22,.04),0_8px_24px_-18px_rgba(14,26,22,.35)] p-[18px] animate-pulse">
                <div className="flex items-center gap-[12px]">
                  <div className="w-[38px] h-[38px] rounded-[11px] bg-slate-200" />
                  <div className="h-4 bg-slate-200 rounded w-1/2" />
                  <div className="ml-auto h-5 w-12 bg-slate-200 rounded-full" />
                </div>
                <div className="mt-[14px] grid gap-[9px]">
                  {[1,2,3,4].map(i => <div key={i} className="flex justify-between"><div className="h-3 bg-slate-200 rounded w-1/4" /><div className="h-3 bg-slate-200 rounded w-1/3" /></div>)}
                </div>
              </div>
            ) : (
            <div className="bg-white border border-[#e6ecea] rounded-[14px] shadow-[0_1px_2px_rgba(14,26,22,.04),0_8px_24px_-18px_rgba(14,26,22,.35)] p-[18px]">
              <div className="flex items-center gap-[12px]">
                <span className="w-[38px] h-[38px] rounded-[11px] grid place-items-center bg-[rgba(11,122,91,.10)] text-[#0b7a5b] flex-shrink-0">
                  <Lock className="w-[18px] h-[18px] stroke-[1.8]" />
                </span>
                <h4 className="m-0 text-[14.5px] font-bold tracking-[-0.2px] text-[#0e1a16] leading-snug">Hajj Trust Account</h4>
                {trustBank ? (
                  <span className="ml-auto text-[11px] font-semibold px-[9px] py-[3px] rounded-full bg-[rgba(23,163,119,.14)] text-[#0b7a5b]">Active</span>
                ) : (
                  <span className="ml-auto text-[11px] font-semibold px-[9px] py-[3px] rounded-full bg-[#fdf3e3] text-[#c8811f]">Pending</span>
                )}
              </div>
              <div className="mt-[14px] grid gap-[9px]">
                <div className="flex justify-between text-[13px]"><span className="text-[#8a9994]">Holder</span><b className="font-semibold text-[#0e1a16] font-variant-numeric:tabular-nums">{trustBank?.bankName || 'Not set'}</b></div>
                <div className="flex justify-between text-[13px]"><span className="text-[#8a9994]">Sort code</span><b className="font-semibold text-[#0e1a16] font-variant-numeric:tabular-nums">{trustBank ? '04-00-••' : 'Not set'}</b></div>
                <div className="flex justify-between text-[13px]"><span className="text-[#8a9994]">Account</span><b className="font-semibold text-[#0e1a16] font-variant-numeric:tabular-nums">{trustBank ? `•••• ${trustBank.last4}` : 'Not set'}</b></div>
                <div className="flex justify-between text-[13px]"><span className="text-[#8a9994]">Purpose</span><b className="font-semibold text-[#0e1a16] font-variant-numeric:tabular-nums">Member savings</b></div>
              </div>
            </div>
            )}
          </div>

          {/* Right Column: Update Form */}
          <div className="bg-white border border-[#e6ecea] rounded-[14px] shadow-[0_1px_2px_rgba(14,26,22,.04),0_8px_24px_-18px_rgba(14,26,22,.35)] overflow-hidden">
            <div className="p-[16px_18px] border-b border-[#e6ecea]">
              <h4 className="m-0 text-[15px] font-bold tracking-[-0.2px] text-[#0e1a16]">Update Routing Destination</h4>
              <p className="m-0 mt-[3px] text-[12.5px] text-[#8a9994]">Securely push new bank details to the payout provider.</p>
            </div>
            
            <div className="p-[18px]">
              <form onSubmit={handleUpdateBank} className="grid gap-[16px]">
                
                <div className="grid gap-[6px]">
                  <label className="text-[12.5px] font-semibold text-[#5c6b65]">Which routing rule are you updating?</label>
                  <select 
                    value={accountType} 
                    onChange={(e) => setAccountType(e.target.value)}
                    className="w-full font-inherit text-[14px] p-[11px_13px] border border-[#e6ecea] rounded-[10px] bg-white text-[#0e1a16] outline-none appearance-none focus:border-[#17a377] focus:shadow-[0_0_0_3px_rgba(23,163,119,0.14)]"
                    style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%238a9994%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right .7rem top 50%', backgroundSize: '.65rem auto', paddingRight: '2.5rem' }}
                  >
                    <option value="operating_revenue">Corporate Operating Account (Employer Fees)</option>
                    <option value="hajj_trust_pool">Hajj Trust Account (Member Savings)</option>
                  </select>
                </div>

                <div className="grid gap-[6px]">
                  <label className="text-[12.5px] font-semibold text-[#5c6b65]">Account holder name</label>
                  <input 
                    type="text" 
                    required
                    value={accountHolderName}
                    onChange={(e) => setAccountHolderName(e.target.value)}
                    placeholder="Hajj Savings"
                    className="w-full font-inherit text-[14px] p-[11px_13px] border border-[#e6ecea] rounded-[10px] bg-white text-[#0e1a16] outline-none placeholder:text-[#b3bfbb] focus:border-[#17a377] focus:shadow-[0_0_0_3px_rgba(23,163,119,0.14)]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-[14px]">
                  <div className="grid gap-[6px]">
                    <label className="text-[12.5px] font-semibold text-[#5c6b65]">Sort code</label>
                    <input 
                      type="text" 
                      required
                      inputMode="numeric"
                      maxLength="6"
                      value={sortCode}
                      onChange={(e) => setSortCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="123456"
                      className="w-full font-inherit text-[14px] p-[11px_13px] border border-[#e6ecea] rounded-[10px] bg-white text-[#0e1a16] outline-none placeholder:text-[#b3bfbb] focus:border-[#17a377] focus:shadow-[0_0_0_3px_rgba(23,163,119,0.14)] font-mono"
                    />
                    <span className="text-[11.5px] text-[#8a9994]">6 digits, no dashes</span>
                  </div>
                  <div className="grid gap-[6px]">
                    <label className="text-[12.5px] font-semibold text-[#5c6b65]">Account number</label>
                    <input 
                      type="text" 
                      required
                      inputMode="numeric"
                      maxLength="8"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                      placeholder="12345678"
                      className="w-full font-inherit text-[14px] p-[11px_13px] border border-[#e6ecea] rounded-[10px] bg-white text-[#0e1a16] outline-none placeholder:text-[#b3bfbb] focus:border-[#17a377] focus:shadow-[0_0_0_3px_rgba(23,163,119,0.14)] font-mono"
                    />
                    <span className="text-[11.5px] text-[#8a9994]">8 digits</span>
                  </div>
                </div>

                <div className="flex gap-[11px] p-[13px_14px] rounded-[11px] bg-[#eef4ff] border border-[#dbe6ff] text-[12.8px] leading-[1.55] text-[#1e3a8a]">
                  <Info className="w-[17px] h-[17px] flex-shrink-0 mt-[1px] stroke-[1.8]" />
                  <div><b className="font-bold">Security notice:</b> full bank details are transmitted directly to the payout provider over a secure API and are <b className="font-bold">never stored</b> in our database. Only the last 4 digits are kept for display.</div>
                </div>

                <div className="flex items-center gap-[10px] pt-[16px] border-t border-[#e6ecea] mt-[2px]">
                  <button 
                    type="button" 
                    onClick={() => { setAccountHolderName(''); setSortCode(''); setAccountNumber(''); }}
                    className="bg-white border border-[#e6ecea] text-[#0e1a16] hover:bg-[#f2f6f5] cursor-pointer font-inherit font-semibold text-[13.5px] p-[11px_18px] rounded-[10px] inline-flex items-center gap-[8px] transition-colors"
                  >
                    Cancel
                  </button>
                  <PrimaryButton 
                    type="submit"
                    isLoading={isSaving}
                    icon={<Check className="w-5 h-5" />}
                    className="ml-auto"
                  >
                    {isSaving ? 'Updating...' : 'Update routing'}
                  </PrimaryButton>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
};
