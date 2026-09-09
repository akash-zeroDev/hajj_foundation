import React, { useState, useEffect, useRef } from 'react';
import { useAuth, useUser, useOrganization } from '@clerk/react';
import { useToast } from '../context/ToastContext';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';


export const EmployeeDashboard = () => {
  const hasVerified = useRef(false);
  const { showToast } = useToast();
  const { getToken, signOut } = useAuth();
  const { user, isLoaded: userLoaded } = useUser();
  const { organization, isLoaded: orgLoaded } = useOrganization();
  const [employeeData, setEmployeeData] = useState(null);
  const [activeDocument, setActiveDocument] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);
  const [contribution, setContribution] = useState('');
  const [isAgreed, setIsAgreed] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [isLoadingTx, setIsLoadingTx] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const [activeTab, setActiveTab] = useState('overview');
  
  const [autoPayEnabled, setAutoPayEnabled] = useState(false);
  const [bankDetails, setBankDetails] = useState({ accountName: '', accountNumber: '', sortCode: '' });
  const [isSavingBank, setIsSavingBank] = useState(false);
  
  useEffect(() => {
    if (employeeData) {
      setAutoPayEnabled(employeeData.autoPayEnabled || false);
      if (employeeData.bankDetails) setBankDetails(employeeData.bankDetails);
    }
  }, [employeeData]);

  const handleSaveBankSettings = async () => {
    setIsSavingBank(true);
    try {
      const token = await getToken();
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/employees/${employeeData._id}/bank-settings`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ autoPayEnabled, bankDetails })
      });
      const data = await res.json();
      if (data.success) {
        setEmployeeData(data.data);
        showToast('Bank settings saved successfully', 'success');
        
        const txRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/financials/my-transactions`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const txData = await txRes.json();
        if (txData.success) {
          setTransactions(txData.data);
        }
      } else {
        showToast(data.message || 'Error saving settings', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error', 'error');
    } finally {
      setIsSavingBank(false);
    }
  };

  const trackDocumentActivity = async (action, details) => {
    try {
      const token = await getToken();
      const orgId = typeof employeeData.organisationId === 'object' ? employeeData.organisationId._id : employeeData.organisationId;
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/documents/${orgId}/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action, details })
      });
    } catch (e) { console.error('Failed to track document', e); }
  };

  const downloadStatement = () => {
    try {
      const doc = new jsPDF();
      
      // Brand Colors
      const primaryGreen = [14, 92, 62]; // #0E5C3E
      
      // Header
      doc.setFontSize(24);
      doc.setTextColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
      doc.text('Hajj Savings Statement', 20, 25);
      
      doc.setFontSize(11);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated on ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`, 20, 32);
      
      // Employee Details Card
      doc.setFillColor(249, 250, 251); // slate-50
      doc.setDrawColor(229, 231, 235); // slate-200
      doc.roundedRect(20, 40, 170, 30, 3, 3, 'FD');
      
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.text('EMPLOYEE', 25, 48);
      doc.text('EMAIL ADDRESS', 85, 48);
      
      doc.setFontSize(12);
      doc.setTextColor(30, 41, 59); // slate-800
      doc.text(`${employeeData?.firstName} ${employeeData?.lastName}`, 25, 56);
      doc.text(`${user?.primaryEmailAddress?.emailAddress}`, 85, 56);
      
      // Summary Card
      doc.setFillColor(249, 250, 251);
      doc.roundedRect(20, 75, 170, 30, 3, 3, 'FD');
      
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.text('TOTAL SAVINGS', 25, 83);
      doc.text('MONTHLY CONTRIBUTION', 85, 83);
      
      doc.setFontSize(16);
      doc.setTextColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
      doc.text(`£${(employeeData?.balance || 0).toFixed(2)}`, 25, 93);
      doc.setTextColor(30, 41, 59);
      doc.text(`£${(employeeData?.monthlyContribution || 0).toFixed(2)}`, 85, 93);
      
      doc.setFontSize(14);
      doc.setTextColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
      doc.text('Transaction History', 20, 125);
      
      // Transactions Table
      const tableData = transactions.map(tx => [
        new Date(tx.createdAt).toLocaleDateString('en-GB'),
        tx.type === 'employee_contribution' ? 'Monthly Contribution' : 'Refund / Adjustment',
        `£${tx.amount.toFixed(2)}`,
        tx.status.toUpperCase()
      ]);
      
      autoTable(doc, {
        startY: 132,
        head: [['DATE', 'DESCRIPTION', 'AMOUNT', 'STATUS']],
        body: tableData,
        theme: 'grid',
        headStyles: {
          fillColor: primaryGreen,
          textColor: [255, 255, 255],
          fontSize: 9,
          fontStyle: 'bold',
          halign: 'left'
        },
        bodyStyles: {
          textColor: [50, 50, 50],
          fontSize: 9
        },
        alternateRowStyles: {
          fillColor: [250, 252, 251]
        },
        styles: {
          cellPadding: 5,
          lineColor: [229, 231, 235],
          lineWidth: 0.1
        },
        columnStyles: {
          2: { fontStyle: 'bold' } // Amount bold
        }
      });
      
      doc.save(`Hajj_Savings_Statement_${employeeData.firstName}_${employeeData.lastName}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      showToast('Failed to generate PDF statement.', 'error');
    }
  };

  const handleSetupSubscription = async () => {
    setIsRedirecting(true);
    try {
      const token = await getToken();
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/payments/create-employee-subscription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ employeeId: employeeData._id })
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.message || 'Failed to create subscription session');
      }
    } catch (err) {
      console.error(err);
      showToast(err.message, 'error');
      setIsRedirecting(false);
    }
  };

  useEffect(() => {
    if (!userLoaded || !orgLoaded || !user) return;
    
    const fetchData = async () => {
      try {
        const token = await getToken();
        if (!token) return;

        const params = new URLSearchParams(window.location.search);
        const sessionId = params.get('session_id');
        if (sessionId && !hasVerified.current) {
          hasVerified.current = true;
          await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/payments/verify-employee-subscription?session_id=${sessionId}`, {
            headers: { Authorization: `Bearer ${token}` }
          }).catch(console.error);
          window.history.replaceState({}, document.title, window.location.pathname);
        }

        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/employees/clerk/${user.id}?clerkOrgId=${organization.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.status === 404) {
          setIsLoading(false);
          return;
        }
        
        const data = await res.json();
        
        if (data.success && data.data) {
          const emp = data.data;
          setEmployeeData(emp);
          setContribution(String(emp.monthlyContribution || ''));
          setFirstName(emp.firstName || '');
          setLastName(emp.lastName || '');
          setPhone(emp.phone || '');
          
          try {
            const docRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/documents/active`);
            const docData = await docRes.json();
            if (docData.success) {
              setActiveDocument(docData.data);
            }
          } catch(e) {
            console.error('Failed to fetch active document', e);
          }
          
          if (emp.agreementStatus === 'signed') {
            const txRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/financials/my-transactions`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            const txData = await txRes.json();
            if (txData.success) {
              setTransactions(txData.data);
            }
            setIsLoadingTx(false);
          } else {
             setIsLoadingTx(false);
          }
        }
      } catch (err) {
        console.error('Error fetching employee data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [user, organization, userLoaded, orgLoaded]);

  const handleCompleteOnboarding = async (e) => {
    e.preventDefault();
    if (!contribution || Number(contribution) < 10) {
      showToast('Minimum contribution is £10', 'error');
      return;
    }
    setIsAccepting(true);
    try {
      const token = await getToken();
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/employees/${employeeData._id}/complete-onboarding`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ monthlyContribution: Number(contribution), firstName, lastName, phone, signedDocumentId: activeDocument?._id })
      });
      const data = await res.json();
      if (res.ok) {
        setEmployeeData(data.data);
        showToast('Onboarding completed successfully!', 'success');
        
        const txRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/financials/my-transactions`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const txData = await txRes.json();
        if (txData.success) {
          setTransactions(txData.data);
        }
        setIsLoadingTx(false);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setIsAccepting(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('setup_success') === 'true') {
      showToast('Direct Debit setup successful! Your contribution is now active.', 'success');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    if (params.get('setup_canceled') === 'true') {
      showToast('Direct Debit setup was canceled.', 'info');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  if (isLoading || !userLoaded || !orgLoaded) {
    return <div className="min-h-screen flex items-center justify-center bg-[#F4F7F6]"><div className="w-8 h-8 border-4 border-[#0E5C3E] border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (!employeeData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F7F6] p-4">
        <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
          </div>
          <h2 className="text-[20px] font-bold text-[#0B0F0E] mb-2">Account Not Found</h2>
          <p className="text-[14px] text-slate-500 mb-6">We couldn't find an employee record associated with your account. Please contact your employer.</p>
          <button onClick={() => signOut()} className="w-full py-2.5 bg-[#0E5C3E] text-white font-semibold rounded-lg hover:bg-[#0A3D2A] transition">Sign Out</button>
        </div>
      </div>
    );
  }

  if (employeeData.agreementStatus === 'pending') {
    return (
      <div className="min-h-screen bg-[#F4F7F6] py-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center mb-8">
            <h1 className="text-[28px] font-bold text-[#0B0F0E] tracking-tight">Complete your enrolment</h1>
            <p className="text-[15px] text-slate-500 mt-2">Please review the Master Agreement and set up your monthly contribution to participate.</p>
          </div>
          
          <form onSubmit={handleCompleteOnboarding} className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] overflow-hidden">
              <div className="px-6 py-4 border-b border-[#E5E7EB] bg-slate-50">
                <h2 className="text-[15px] font-bold text-[#0B0F0E]">1. Review Shariah Agreement</h2>
              </div>
              <div className="p-6">
                {activeDocument ? (
                  <div className="w-full h-96 border border-[#E5E7EB] rounded-lg overflow-hidden bg-slate-50">
                    <iframe src={activeDocument.fileUrl} className="w-full h-full" title="Master Agreement"></iframe>
                  </div>
                ) : (
                  <div className="text-center py-12 border border-[#E5E7EB] rounded-lg text-slate-500 text-[14px]">No document available. Please contact your employer.</div>
                )}
                
                <div className="mt-6 flex items-start gap-3">
                  <input type="checkbox" id="agree" required checked={isAgreed} onChange={e => setIsAgreed(e.target.checked)} className="mt-1 w-4 h-4 text-[#0E5C3E] border-slate-300 rounded focus:ring-[#0E5C3E]" />
                  <label htmlFor="agree" className="text-[13.5px] text-slate-700">I have read and agree to the terms of the Master Shariah Agreement.</label>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] overflow-hidden">
              <div className="px-6 py-4 border-b border-[#E5E7EB] bg-slate-50">
                <h2 className="text-[15px] font-bold text-[#0B0F0E]">2. Personal Details</h2>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="grid gap-1">
                  <label className="text-[12.5px] font-semibold text-[#0B0F0E]">First name</label>
                  <input required value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-[13.5px] focus:outline-none focus:border-[#0E5C3E] focus:ring-1 focus:ring-[#0E5C3E]" />
                </div>
                <div className="grid gap-1">
                  <label className="text-[12.5px] font-semibold text-[#0B0F0E]">Last name</label>
                  <input required value={lastName} onChange={e => setLastName(e.target.value)} className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-[13.5px] focus:outline-none focus:border-[#0E5C3E] focus:ring-1 focus:ring-[#0E5C3E]" />
                </div>
                <div className="grid gap-1">
                  <label className="text-[12.5px] font-semibold text-[#0B0F0E]">Phone number</label>
                  <input type="tel" required placeholder="+44 7700 900077" value={phone} onChange={e => setPhone(e.target.value)} className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-[13.5px] focus:outline-none focus:border-[#0E5C3E] focus:ring-1 focus:ring-[#0E5C3E]" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] overflow-hidden">
              <div className="px-6 py-4 border-b border-[#E5E7EB] bg-slate-50">
                <h2 className="text-[15px] font-bold text-[#0B0F0E]">3. Monthly Contribution</h2>
                <p className="text-[12.5px] text-slate-500 mt-1">Automatically saved from your salary each month. Minimum £10.</p>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-semibold text-[16px]">£</span>
                    <input type="text" required value={contribution} onChange={e => setContribution(e.target.value.replace(/\D/g, ''))} className="w-48 border border-[#E5E7EB] rounded-lg pl-8 pr-12 py-3 text-[16px] font-bold focus:outline-none focus:border-[#0E5C3E] focus:ring-1 focus:ring-[#0E5C3E]" />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-[14px]">/ mo</span>
                  </div>
                  <div className="flex gap-2">
                    {[25, 50, 100, 200].map(val => (
                      <button key={val} type="button" onClick={() => setContribution(String(val))} className={`px-4 py-3 rounded-lg border font-semibold text-[14px] transition ${Number(contribution) === val ? 'bg-[#ECFDF5] border-[#0E5C3E] text-[#0E5C3E]' : 'bg-white border-[#E5E7EB] text-slate-600 hover:border-[#0E5C3E]'}`}>£{val}</button>
                    ))}
                  </div>
                </div>
                
                <div className="bg-slate-50 border border-[#E5E7EB] rounded-lg p-4 flex gap-3 items-start">
                  <svg className="w-5 h-5 text-[#0E5C3E] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  <div className="text-[13px] text-slate-600">Your first collection happens on the 1st of next month. You will receive an email confirmation with your direct-debit reference.</div>
                </div>
              </div>
              <div className="px-6 py-5 border-t border-[#E5E7EB] bg-slate-50 flex justify-end">
                <button type="submit" disabled={isAccepting || !isAgreed || Number(contribution) < 10 || !firstName || !lastName || !phone} className="px-6 py-2.5 bg-[#0E5C3E] text-white font-semibold rounded-lg hover:bg-[#0A3D2A] transition disabled:opacity-50">
                  {isAccepting ? 'Saving Profile...' : 'Accept & Complete Setup'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden text-slate-800 bg-[#F4F7F6] font-sans">
      <aside className="w-[260px] bg-[#0B0F0E] flex flex-col shrink-0">
        <div className="p-6 border-b border-white/10 flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-[#0E5C3E] flex items-center justify-center text-white font-bold text-lg">H</div>
          <div>
            <div className="text-white font-bold text-[15px] tracking-tight leading-tight">Hajj Savings</div>
            <div className="text-[#0E5C3E] text-[10px] font-bold tracking-widest uppercase mt-0.5">Employee</div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div>
            <div className="text-[11px] font-semibold text-white/40 tracking-widest uppercase mb-2 px-3">Overview</div>
            <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13.5px] font-medium transition ${activeTab==='overview'?'bg-[#0E5C3E] text-white':'text-[#9CA3AF] hover:text-white hover:bg-white/5'}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
              Dashboard
            </button>
          </div>
          
          <div>
            <div className="text-[11px] font-semibold text-white/40 tracking-widest uppercase mb-2 px-3">Finance</div>
            <button onClick={() => setActiveTab('transactions')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13.5px] font-medium mb-1 transition ${activeTab==='transactions'?'bg-[#0E5C3E] text-white':'text-[#9CA3AF] hover:text-white hover:bg-white/5'}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              My Transactions
            </button>
            <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13.5px] font-medium transition ${activeTab==='settings'?'bg-[#0E5C3E] text-white':'text-[#9CA3AF] hover:text-white hover:bg-white/5'}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
              Settings & Bank
            </button>
          </div>
          
          <div>
            <div className="text-[11px] font-semibold text-white/40 tracking-widest uppercase mb-2 px-3">Legal</div>
            <button onClick={() => setActiveTab('documents')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13.5px] font-medium transition ${activeTab==='documents'?'bg-[#0E5C3E] text-white':'text-[#9CA3AF] hover:text-white hover:bg-white/5'}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
              Documents
            </button>
          </div>
        </div>

        <div className="p-4 border-t border-white/10 mt-auto">
          <div className="flex items-center gap-3 px-2 py-2 cursor-pointer hover:bg-white/5 rounded-lg transition" onClick={() => signOut()}>
            <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold text-[13px]">{employeeData?.firstName?.charAt(0)}{employeeData?.lastName?.charAt(0)}</div>
            <div>
              <div className="text-[13px] font-medium text-white">{employeeData?.firstName} {employeeData?.lastName}</div>
              <div className="text-[11px] text-white/50">Sign out</div>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-[70px] bg-white border-b border-[#E5E7EB] flex items-center justify-between px-8 shrink-0">
          <h1 className="text-[16px] font-bold text-[#0B0F0E] capitalize">{activeTab}</h1>
          <div className="flex items-center gap-4">
            <div className="text-[13px] text-slate-500 font-medium">{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          
          {activeTab === 'overview' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-sm flex flex-col relative overflow-hidden">
                  <div className="text-[11.5px] font-bold tracking-widest text-slate-400 uppercase mb-3">Total Savings</div>
                  <div className="text-[32px] font-bold text-[#0B0F0E] tracking-tight leading-none mb-2">£{(employeeData?.balance || 0).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</div>
                  <div className="mt-auto pt-3">
                    <span className="inline-flex items-center gap-1 text-[11.5px] font-semibold px-2 py-1 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46]">
                      +£{employeeData?.monthlyContribution || 0} this month
                    </span>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-sm flex flex-col">
                  <div className="text-[11.5px] font-bold tracking-widest text-slate-400 uppercase mb-3">Monthly Contribution</div>
                  <div className="text-[24px] font-bold text-[#0B0F0E] tracking-tight leading-none mb-1">£{(employeeData?.monthlyContribution || 0).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</div>
                  <div className="text-[13px] text-slate-500 mb-4">Deducted on the 1st of every month</div>
                  <div className="mt-auto">
                    {!employeeData.autoPayEnabled ? (
                      <button onClick={handleSetupSubscription} disabled={isRedirecting} className="w-full text-center px-4 py-2 bg-[#0E5C3E] text-white font-semibold rounded-lg hover:bg-[#0A3D2A] transition text-[13px]">
                        {isRedirecting ? 'Redirecting...' : 'Setup Direct Debit'}
                      </button>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#0E5C3E]">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        Direct Debit Active
                      </div>
                    )}
                  </div>
                </div>

                <div className={`rounded-xl border p-5 shadow-sm flex flex-col relative overflow-hidden ${employeeData?.autoPayEnabled ? 'bg-gradient-to-br from-[#0B0F0E] to-[#1a2e26] border-[#0B0F0E] text-white' : 'bg-slate-50 border-[#E5E7EB] text-slate-800'}`}>
                  {employeeData?.autoPayEnabled && (
                    <div className="absolute -right-4 -bottom-4 opacity-10">
                      <svg className="w-32 h-32" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                    </div>
                  )}
                  <div className={`text-[11.5px] font-bold tracking-widest uppercase mb-3 relative z-10 ${employeeData?.autoPayEnabled ? 'text-white/50' : 'text-slate-400'}`}>Hajj Awards Draw</div>
                  <div className="text-[20px] font-bold tracking-tight leading-tight mb-2 relative z-10">
                    {employeeData?.autoPayEnabled ? "You're in the pool!" : "Not in the pool yet"}
                  </div>
                  {!employeeData?.autoPayEnabled && (
                    <div className="text-[13px] relative z-10 text-slate-500">
                      Setup Direct Debit to participate in the next draw
                    </div>
                  )}
                  <div className="mt-auto pt-4 relative z-10">
                    {employeeData?.autoPayEnabled ? (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-md bg-white/10 border border-white/20 text-white">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></span> Active Participant
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-600 shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span> Pending Setup
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] overflow-hidden mb-8">
                <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between bg-[#F9FAFB]">
                  <h2 className="text-[15px] font-bold text-[#0B0F0E]">Recent Transactions</h2>
                  <button onClick={() => setActiveTab('transactions')} className="text-[13px] font-semibold text-[#0E5C3E] hover:text-[#0B0F0E] transition flex items-center gap-1">
                    View All <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-white border-b border-[#F3F4F6]">
                        <th className="px-6 py-3.5 text-[10.5px] font-bold tracking-widest uppercase text-slate-400">Date</th>
                        <th className="px-6 py-3.5 text-[10.5px] font-bold tracking-widest uppercase text-slate-400">Description</th>
                        <th className="px-6 py-3.5 text-[10.5px] font-bold tracking-widest uppercase text-slate-400">Amount</th>
                        <th className="px-6 py-3.5 text-[10.5px] font-bold tracking-widest uppercase text-slate-400">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F3F4F6]">
                      {isLoadingTx ? (
                        <tr><td colSpan="4" className="text-center py-8 text-slate-400 text-[13px]">Loading...</td></tr>
                      ) : transactions.length > 0 ? (
                        transactions.slice(0, 5).map(tx => (
                          <tr key={tx._id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 text-[13.5px] text-slate-600 font-medium">{new Date(tx.createdAt).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric'})}</td>
                            <td className="px-6 py-4 text-[13.5px] font-medium text-[#0B0F0E]">Monthly Contribution</td>
                            <td className="px-6 py-4 text-[13.5px] font-bold text-[#0B0F0E]">£{tx.amount.toLocaleString(undefined, {minimumFractionDigits:2})}</td>
                            <td className="px-6 py-4">
                              {tx.status === 'succeeded' ? (
                                <span className="inline-flex items-center text-[11px] font-bold px-2 py-1 rounded-md bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46] uppercase tracking-wider">Paid</span>
                              ) : tx.status === 'failed' ? (
                                <span className="inline-flex items-center text-[11px] font-bold px-2 py-1 rounded-md bg-red-50 border border-red-200 text-red-600 uppercase tracking-wider">Failed</span>
                              ) : (
                                <span className="inline-flex items-center text-[11px] font-bold px-2 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-600 uppercase tracking-wider">{tx.status}</span>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan="4" className="text-center py-8 text-slate-400 text-[13px]">No transactions found</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {activeTab === 'transactions' && (
            <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] overflow-hidden">
              <div className="px-6 py-4 border-b border-[#E5E7EB] bg-[#F9FAFB]">
                <h2 className="text-[15px] font-bold text-[#0B0F0E]">All Transactions</h2>
              </div>
              <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-white border-b border-[#F3F4F6]">
                        <th className="px-6 py-3.5 text-[10.5px] font-bold tracking-widest uppercase text-slate-400">Date</th>
                        <th className="px-6 py-3.5 text-[10.5px] font-bold tracking-widest uppercase text-slate-400">Description</th>
                        <th className="px-6 py-3.5 text-[10.5px] font-bold tracking-widest uppercase text-slate-400">Amount</th>
                        <th className="px-6 py-3.5 text-[10.5px] font-bold tracking-widest uppercase text-slate-400">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F3F4F6]">
                      {isLoadingTx ? (
                        <tr><td colSpan="4" className="text-center py-8 text-slate-400 text-[13px]">Loading...</td></tr>
                      ) : transactions.length > 0 ? (
                        transactions.map(tx => (
                          <tr key={tx._id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 text-[13.5px] text-slate-600 font-medium">{new Date(tx.createdAt).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric'})}</td>
                            <td className="px-6 py-4 text-[13.5px] font-medium text-[#0B0F0E]">Monthly Contribution</td>
                            <td className="px-6 py-4 text-[13.5px] font-bold text-[#0B0F0E]">£{tx.amount.toLocaleString(undefined, {minimumFractionDigits:2})}</td>
                            <td className="px-6 py-4">
                              {tx.status === 'succeeded' ? (
                                <span className="inline-flex items-center text-[11px] font-bold px-2 py-1 rounded-md bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46] uppercase tracking-wider">Paid</span>
                              ) : tx.status === 'failed' ? (
                                <span className="inline-flex items-center text-[11px] font-bold px-2 py-1 rounded-md bg-red-50 border border-red-200 text-red-600 uppercase tracking-wider">Failed</span>
                              ) : (
                                <span className="inline-flex items-center text-[11px] font-bold px-2 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-600 uppercase tracking-wider">{tx.status}</span>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan="4" className="text-center py-8 text-slate-400 text-[13px]">No transactions found</td></tr>
                      )}
                    </tbody>
                  </table>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] overflow-hidden">
                <div className="px-6 py-4 border-b border-[#E5E7EB] bg-[#F9FAFB] flex justify-between items-center">
                  <h2 className="text-[15px] font-bold text-[#0B0F0E]">Bank Details & Auto Pay</h2>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className={`text-[13px] font-bold ${autoPayEnabled ? 'text-[#0E5C3E]' : 'text-slate-400'}`}>{autoPayEnabled ? 'Auto Pay Active' : 'Auto Pay Disabled'}</span>
                    <input type="checkbox" checked={autoPayEnabled} onChange={e => setAutoPayEnabled(e.target.checked)} className="w-4 h-4 text-[#0E5C3E] border-slate-300 rounded focus:ring-[#0E5C3E]" />
                  </label>
                </div>
                <div className={`p-6 transition-opacity ${!autoPayEnabled && 'opacity-50 pointer-events-none'}`}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="grid gap-1">
                      <label className="text-[12.5px] font-semibold text-[#0B0F0E]">Account Name</label>
                      <input placeholder="e.g. John Doe" value={bankDetails.accountName} onChange={e => setBankDetails({...bankDetails, accountName: e.target.value})} className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-[13.5px] focus:outline-none focus:border-[#0E5C3E] focus:ring-1 focus:ring-[#0E5C3E]" />
                    </div>
                    <div className="grid gap-1">
                      <label className="text-[12.5px] font-semibold text-[#0B0F0E]">Sort Code</label>
                      <input placeholder="12-34-56" value={bankDetails.sortCode} onChange={e => setBankDetails({...bankDetails, sortCode: e.target.value})} className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-[13.5px] focus:outline-none focus:border-[#0E5C3E] focus:ring-1 focus:ring-[#0E5C3E]" />
                    </div>
                    <div className="grid gap-1">
                      <label className="text-[12.5px] font-semibold text-[#0B0F0E]">Account Number</label>
                      <input placeholder="12345678" value={bankDetails.accountNumber} onChange={e => setBankDetails({...bankDetails, accountNumber: e.target.value})} className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-[13.5px] focus:outline-none focus:border-[#0E5C3E] focus:ring-1 focus:ring-[#0E5C3E]" />
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end">
                    <button onClick={handleSaveBankSettings} disabled={isSavingBank} className="px-6 py-2.5 bg-[#0E5C3E] text-white font-semibold rounded-lg hover:bg-[#0A3D2A] transition disabled:opacity-50">
                      {isSavingBank ? 'Saving...' : 'Save Settings'}
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] overflow-hidden">
                <div className="px-6 py-4 border-b border-[#E5E7EB] bg-[#F9FAFB]">
                  <h2 className="text-[15px] font-bold text-[#0B0F0E]">Profile Details</h2>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="grid gap-1">
                    <label className="text-[12.5px] font-semibold text-slate-500">Full Name</label>
                    <div className="text-[14px] font-semibold text-[#0B0F0E]">{employeeData?.firstName} {employeeData?.lastName}</div>
                  </div>
                  <div className="grid gap-1">
                    <label className="text-[12.5px] font-semibold text-slate-500">Email Address</label>
                    <div className="text-[14px] font-semibold text-[#0B0F0E]">{user?.primaryEmailAddress?.emailAddress}</div>
                  </div>
                  <div className="grid gap-1">
                    <label className="text-[12.5px] font-semibold text-slate-500">Phone</label>
                    <div className="text-[14px] font-semibold text-[#0B0F0E]">{employeeData?.phone || 'Not provided'}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-6 flex flex-col">
                <div className="w-12 h-12 rounded-lg bg-[#ECFDF5] text-[#0E5C3E] flex items-center justify-center mb-4">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                </div>
                <h3 className="text-[16px] font-bold text-[#0B0F0E] mb-2">Savings Statement</h3>
                <p className="text-[13px] text-slate-500 mb-6 flex-1">A formal PDF statement of your account balance and historical contributions.</p>
                <button onClick={downloadStatement} className="w-full py-2.5 border border-[#E5E7EB] text-[#0B0F0E] font-semibold rounded-lg hover:bg-slate-50 transition flex justify-center items-center gap-2 text-[13.5px]">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                  Download PDF
                </button>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-6 flex flex-col">
                <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                </div>
                <h3 className="text-[16px] font-bold text-[#0B0F0E] mb-2">My Signed Agreement</h3>
                <p className="text-[13px] text-slate-500 mb-6 flex-1">View the version of the Shariah Master Agreement you digitally signed.</p>
                {employeeData?.signedDocumentId?.fileUrl && employeeData?.agreementStatus === 'signed' ? (
                  <a href={employeeData.signedDocumentId.fileUrl} target="_blank" rel="noopener noreferrer" onClick={() => trackDocumentActivity('VIEWED_SIGNED_CONTRACT', 'Employee viewed their signed agreement')} className="w-full py-2.5 bg-[#0E5C3E] text-white font-semibold rounded-lg hover:bg-[#0A3D2A] transition flex justify-center items-center gap-2 text-[13.5px]">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                    View Contract
                  </a>
                ) : (
                  <button disabled className="w-full py-2.5 border border-[#E5E7EB] text-slate-400 font-semibold rounded-lg bg-slate-50 flex justify-center items-center gap-2 text-[13.5px] cursor-not-allowed">
                    Not Available
                  </button>
                )}
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};
