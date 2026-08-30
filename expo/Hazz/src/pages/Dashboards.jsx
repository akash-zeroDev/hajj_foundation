import { useState, useEffect } from 'react';
import { useUser, useAuth, useOrganization } from '@clerk/react';
import { useLocation, Link } from 'react-router-dom';
import SidebarLayout from '../layouts/SidebarLayout';
import { superAdminNavigation, orgAdminNavigation } from '../config/navigation';

// ... (OldLayout and Employee/Admin Dashboards unchanged for now)

const OldLayout = ({ title, children, description }) => {
  const { user } = useUser();
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50">
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 leading-tight">{title}</h1>
              {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};

export const EmployeeDashboard = () => {
  const { getToken } = useAuth(); // EmployeeDashboard
  const { user, isLoaded: userLoaded } = useUser();
  const { organization, isLoaded: orgLoaded } = useOrganization();
  const [employeeData, setEmployeeData] = useState(null);
  const [activeDocument, setActiveDocument] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);
    const [contribution, setContribution] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [isLoadingTx, setIsLoadingTx] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);

    const downloadStatement = () => {
    if (!employeeData) return;
    
    try {
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(22);
      doc.setTextColor(15, 23, 42); // slate-900
      doc.text("Savings Statement", 14, 20);
      
      doc.setFontSize(12);
      doc.setTextColor(100, 116, 139); // slate-500
      doc.text(`Account Holder: ${employeeData.firstName} ${employeeData.lastName}`, 14, 30);
      doc.text(`Organisation: ${organization?.name || 'N/A'}`, 14, 36);
      doc.text(`Statement Date: ${new Date().toLocaleDateString()}`, 14, 42);
      doc.text(`Current Balance: £${employeeData.balance.toLocaleString()}`, 14, 48);

      // Financials Table
      const txRows = transactions.map(tx => [
        new Date(tx.createdAt).toLocaleDateString(),
        `£${tx.amount.toLocaleString()}`,
        tx.status
      ]);

      doc.autoTable({
        startY: 55,
        head: [['Date', 'Contribution', 'Status']],
        body: txRows,
        theme: 'striped',
        headStyles: { fillColor: [5, 150, 105] }, // emerald-600
        styles: { fontSize: 11, cellPadding: 6 }
      });
      
      doc.save(`Hajj_Savings_Statement_${employeeData.firstName}_${employeeData.lastName}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF statement.');
    }
  };

  const handleSetupSubscription = async () => {
    setIsRedirecting(true);
    try {
      const res = await fetch('http://localhost:5000/api/payments/create-employee-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${await getToken()}`
        },
        body: JSON.stringify({ employeeId: employeeData._id })
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error(data.message);
        setIsRedirecting(false);
      }
    } catch (err) {
      console.error('Subscription Error:', err);
      setIsRedirecting(false);
    }
  };

  useEffect(() => {
    const fetchEmployeeData = async () => {
      if (!userLoaded || !orgLoaded || !user || !organization) return;
      try {
        const token = await getToken();
        const params = new URLSearchParams(window.location.search);
        const sessionId = params.get('session_id');
        if (sessionId) {
          await fetch(`http://localhost:5000/api/payments/verify-employee-subscription?session_id=${sessionId}`, {
            headers: { Authorization: `Bearer ${token}` }
          }).catch(console.error);
          window.history.replaceState({}, document.title, window.location.pathname);
        }
        const res = await fetch(`http://localhost:5000/api/employees/clerk/${user.id}?clerkOrgId=${organization.id}`, { headers: { Authorization: `Bearer ${await getToken()}` } });
        const data = await res.json();
        if (data.success) {
          setEmployeeData(data.data);
          // Fetch transactions
          try {
            const txRes = await fetch('http://localhost:5000/api/financials/my-transactions', {
              headers: { Authorization: `Bearer ${await getToken()}` }
            });
            const txData = await txRes.json();
            if (txData.success) {
              setTransactions(txData.data);
            }
          } catch(e) {
            console.error('Failed to fetch transactions', e);
          } finally {
            setIsLoadingTx(false);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEmployeeData();
  }, [user, organization, userLoaded, orgLoaded]);

  const handleCompleteOnboarding = async (e) => {
    e.preventDefault();
    if (!contribution || Number(contribution) < 10) {
      alert('Minimum contribution is £10');
      return;
    }
    setIsAccepting(true);
    try {
      const res = await fetch(`http://localhost:5000/api/employees/${employeeData._id}/complete-onboarding`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${await getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ monthlyContribution: Number(contribution), firstName, lastName, phone, signedDocumentId: activeDocument?._id })
      });
      const data = await res.json();
      if (data.success) {
        setEmployeeData(data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsAccepting(false);
    }
  };

  if (!userLoaded || !orgLoaded || isLoading) {
    return (
      <OldLayout title="Loading Profile..." description="">
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      </OldLayout>
    );
  }

  if (employeeData?.agreementStatus === 'pending') {
    return (
      <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100 font-sans">
        <div className="flex-grow flex flex-col items-center justify-center p-6 max-w-3xl mx-auto w-full">
          <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 flex items-center justify-center rounded-full mb-8 shadow-lg shadow-emerald-500/10">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-white text-center">
            Welcome, {user?.firstName || 'Employee'}!
          </h1>
          <p className="text-lg text-slate-400 mb-10 max-w-xl text-center">
            To finalise your enrollment in {organization?.name}'s savings plan, please accept your employee agreement and set your monthly contribution.
          </p>

          <form onSubmit={handleCompleteOnboarding} className="w-full bg-slate-800 rounded-2xl overflow-hidden shadow-2xl border border-slate-700/50 flex flex-col">
            <div className="p-6 bg-slate-800 border-b border-slate-700">
              
              <h2 className="text-xl font-bold text-white mb-2">1. Personal Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">First Name</label>
                  <input type="text" required value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white outline-none focus:border-emerald-500" placeholder="John" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Last Name</label>
                  <input type="text" required value={lastName} onChange={e => setLastName(e.target.value)} className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white outline-none focus:border-emerald-500" placeholder="Doe" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-1">Phone Number</label>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white outline-none focus:border-emerald-500" placeholder="+44 7700 900077" />
                </div>
              </div>
              <hr className="border-slate-700 mb-6" />
              <h2 className="text-xl font-bold text-white mb-2">2. Employee Agreement</h2>
              <p className="text-sm text-emerald-400 mb-4">Please read the document below carefully.</p>
              <div className="h-64 bg-slate-100 rounded-lg overflow-hidden border border-slate-600 flex items-center justify-center">
                {activeDocument ? (
                  <iframe src={activeDocument.fileUrl} className="w-full h-full" title="Employee Agreement"></iframe>
                ) : (
                  <p className="text-slate-500">No active agreement document found. Please contact your administrator.</p>
                )}
              </div>
            </div>
            
            <div className="p-6 bg-slate-800 border-b border-slate-700">
              <h2 className="text-xl font-bold text-white mb-2">3. Monthly Contribution</h2>
              <p className="text-sm text-slate-400 mb-4">How much would you like to automatically save from your salary each month? (Minimum £10)</p>
              <div className="relative max-w-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-slate-400 sm:text-lg">£</span>
                </div>
                <input
                  type="number"
                  min="10"
                  required
                  value={contribution}
                  onChange={(e) => setContribution(e.target.value)}
                  className="block w-full pl-8 pr-12 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent sm:text-lg"
                  placeholder="50"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-slate-400 sm:text-sm">/ mo</span>
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-800">
              <button
                type="submit"
                disabled={isAccepting}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white text-lg font-bold rounded-xl transition shadow-lg shadow-emerald-900/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isAccepting ? 'Saving Profile...' : 'Accept & Complete Setup'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <OldLayout title="Employee Portal" description="Manage your contributions, view balances, and download statements.">
      
      {employeeData?.awardStatus === 'won' && (
        <div className="mb-6 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 rounded-xl shadow-lg border border-amber-300 p-6 flex flex-col sm:flex-row items-center gap-6 transform hover:scale-[1.01] transition-transform">
          <div className="flex-shrink-0 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-inner">
            <span className="text-3xl">🎉</span>
          </div>
          <div>
            <h2 className="text-2xl font-black text-amber-900 mb-1">Congratulations! You have been selected!</h2>
            <p className="text-amber-800 font-medium text-lg">You are a winner in the latest Hajj Awards draw. A member of our team will contact you shortly.</p>
          </div>
        </div>
      )}

      {employeeData?.subscriptionStatus === 'past_due' && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg shadow-sm">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Action Required: Payment Failed</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>Your last monthly contribution failed to process. You are currently <strong>disqualified</strong> from the Hajj Awards draw until the outstanding balance is paid.</p>
              </div>
            </div>
          </div>
        </div>
      )}

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
            <p className="text-sm text-slate-500 font-medium mb-1">Total Savings Balance</p>
            <p className="text-4xl font-extrabold text-emerald-600">£{employeeData?.balance?.toLocaleString()}</p>
          </div>
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
            <div className="flex justify-between items-start mb-1">
              <p className="text-sm text-slate-500 font-medium">Monthly Contribution</p>
              {employeeData?.subscriptionStatus === 'active' ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Active
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Action Required
                </span>
              )}
            </div>
            <p className="text-4xl font-extrabold text-slate-800">£{employeeData?.monthlyContribution?.toLocaleString()}</p>
            {employeeData?.subscriptionStatus !== 'active' && (
              <button 
                onClick={handleSetupSubscription}
                disabled={isRedirecting}
                className="mt-4 w-full py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 transition shadow-sm disabled:bg-emerald-400 flex justify-center items-center gap-2"
              >
                {isRedirecting ? 'Connecting...' : 'Set up Direct Debit'}
              </button>
            )}
          </div>
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 flex flex-col justify-center">
            <p className="text-sm text-slate-500 font-medium mb-2">Hajj Award Status</p>
            {employeeData?.awardStatus === 'won' ? (
              <span className="px-3 py-1 bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-900 text-sm font-black rounded-full w-max shadow-sm border border-amber-300 uppercase tracking-wide">
                🏆 Award Winner
              </span>
            ) : (
              <span className="px-3 py-1 bg-slate-200 text-slate-700 text-sm font-bold rounded-full w-max">
                Not Selected Yet
              </span>
            )}
          </div>
        </div>

        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h3 className="text-lg font-bold text-slate-800">Payment History</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-slate-500 font-medium border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Description</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoadingTx ? (
                   <tr><td colSpan="4" className="px-6 py-8 text-center text-slate-500">Loading transactions...</td></tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center">
                      <h3 className="text-base font-bold text-slate-800 mb-1">No Transactions Yet</h3>
                      <p className="text-slate-500">Your first payroll deduction will appear here soon.</p>
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => (
                    <tr key={tx._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900">
                        Monthly Contribution
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-900">
                        £{tx.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {tx.status === 'succeeded' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
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
      </div>
    </OldLayout>
  );
};

export const AdminDashboard = () => {
  const { getToken } = useAuth(); // AdminDashboard
  const { organization, isLoaded: orgLoaded } = useOrganization();
  const [orgData, setOrgData] = useState(null);
  const [isLoadingBackend, setIsLoadingBackend] = useState(true);
  const [empCount, setEmpCount] = useState(0);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handlePayAnnualFee = async () => {
    setIsRedirecting(true);
    try {
      const res = await fetch('http://localhost:5000/api/payments/create-annual-fee-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${await getToken()}`
        },
        body: JSON.stringify({ orgId: orgData._id })
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error(data.message);
        setIsRedirecting(false);
      }
    } catch (err) {
      console.error('Payment Error:', err);
      setIsRedirecting(false);
    }
  };


  useEffect(() => {
    if (orgLoaded && organization) {
      const verifyPaymentIfNeeded = async () => {
        const params = new URLSearchParams(window.location.search);
        const sessionId = params.get('session_id');
        if (sessionId) {
          try {
            const token = await getToken();
            await fetch(`http://localhost:5000/api/payments/verify-annual-fee?session_id=${sessionId}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            // Clear URL so it doesn't verify again on refresh
            window.history.replaceState({}, document.title, window.location.pathname);
          } catch (err) {
            console.error('Failed to verify payment', err);
          }
        }
      };

      verifyPaymentIfNeeded().then(() => {
        getToken().then(token => fetch(`http://localhost:5000/api/organisations/clerk/${organization.id}`, { headers: { Authorization: `Bearer ${token}` } })).then(res => {
          if (!res.ok) throw new Error('Not found');
          return res.json();
        })
        .then(data => {
          setOrgData(data.data || data);
          setIsLoadingBackend(false);
        })
        .catch(err => {
          console.error(err);
          setIsLoadingBackend(false);
        });

      });

      organization.getMemberships().then(m => {
        setEmpCount(m?.data?.length || 0);
      }).catch(console.error);
    } else if (orgLoaded && !organization) {
      setIsLoadingBackend(false);
    }
  }, [orgLoaded, organization]);

  const handleAcceptAgreement = async () => {
    setIsAccepting(true);
    try {
      const res = await fetch(`http://localhost:5000/api/organisations/clerk/${organization.id}/accept-agreement`, { headers: { Authorization: `Bearer ${await getToken()}` },
        method: 'PATCH'
      });
      if (res.ok) {
        const updated = await res.json();
        setOrgData(updated);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsAccepting(false);
    }
  };

  if (!orgLoaded || isLoadingBackend) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-emerald-200 rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="max-w-md w-full text-center bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">No Organisation Found</h2>
          <p className="text-slate-500">You do not seem to be attached to an active organisation. Please ensure you clicked the invitation link.</p>
        </div>
      </div>
    );
  }

  if (orgData?.agreementStatus === 'pending') {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl w-full">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-extrabold text-white mb-3">Welcome to Hajj Savings</h1>
            <p className="text-lg text-slate-400">Before managing your employees, you must review and accept your organisation's financial agreement.</p>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="bg-emerald-50 px-8 py-6 border-b border-emerald-100 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-emerald-900">{orgData.name} - Master Agreement</h2>
                <p className="text-sm text-emerald-700 mt-1">Please read the document below carefully.</p>
              </div>
              <div className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                Action Required
              </div>
            </div>

            <div className="p-8 flex-1 overflow-y-auto bg-slate-50">
              {orgData.agreementUrl ? (
                <div className="w-full bg-slate-200 rounded-xl overflow-hidden border border-slate-300 h-96 flex flex-col">
                   <div className="bg-slate-800 px-4 py-2 flex justify-between items-center text-white text-sm font-medium">
                     <span>Legal_Agreement.pdf</span>
                     <a href={orgData.agreementUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300">Open in New Tab ↗</a>
                   </div>
                   <iframe src={orgData.agreementUrl} className="w-full flex-1" title="Agreement Document"></iframe>
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
                  <p className="text-slate-500">No document was uploaded by the Super Admin.</p>
                </div>
              )}
              
              <div className="mt-8 p-6 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm">
                <strong>Legal Notice:</strong> By clicking "I Accept" below, you digitally sign and bind <strong>{orgData.name}</strong> to the terms specified in this document. 
                You also agree to pay the Annual Fee of <strong>£{orgData.annualFee.toLocaleString()}</strong>.
              </div>
            </div>

            <div className="px-8 py-6 bg-white border-t border-slate-200 flex items-center justify-between">
              <p className="text-sm text-slate-500">Take your time to review. You cannot proceed until accepted.</p>
              <button 
                onClick={handleAcceptAgreement}
                disabled={isAccepting}
                className="px-8 py-3 bg-emerald-600 border border-transparent rounded-xl text-base font-bold text-white shadow-lg hover:bg-emerald-700 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/30 transition-all disabled:opacity-50"
              >
                {isAccepting ? 'Processing...' : 'I Accept & Sign Document'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SidebarLayout navigation={orgAdminNavigation} title="Employer Dashboard">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">{organization.name} Overview</h1>
        <p className="text-sm text-slate-500">Manage your employees, view signed agreements, and pay annual fees.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Status Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-sm font-medium text-slate-500 mb-4">Annual Fee Status</h3>
          <div className="flex items-center gap-3">
            {orgData?.annualFeeStatus === 'pending' ? (
              <>
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div>
                  <p className="text-xl font-bold text-slate-900">£{orgData?.annualFee?.toLocaleString()}</p>
                  <p className="text-sm text-amber-600 font-medium">Pending Payment</p>
                </div>
              </>
            ) : (
              <>
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div>
                  <p className="text-xl font-bold text-slate-900">£{orgData?.annualFee?.toLocaleString()}</p>
                  <p className="text-sm text-emerald-600 font-medium">Paid Successfully</p>
                </div>
              </>
            )}
          </div>
          {orgData?.annualFeeStatus === 'pending' && (
            <button 
              onClick={handlePayAnnualFee}
              disabled={isRedirecting}
              className="mt-4 w-full py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition shadow-sm disabled:bg-slate-700 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              {isRedirecting ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Connecting to Stripe...
                </>
              ) : (
                'Pay Now'
              )}
            </button>
          )}
        </div>

        {/* Agreement Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-sm font-medium text-slate-500 mb-4">Master Agreement</h3>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900">Signed</p>
              <a href={orgData?.agreementUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-emerald-600 font-medium hover:underline inline-flex items-center gap-1">
                View Document
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
              </a>
            </div>
          </div>
        </div>

        {/* Employees Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-medium text-slate-500 mb-1">Active Employees</h3>
            <p className="text-3xl font-bold text-slate-900">0</p>
          </div>
          <Link to="/admin/employees" className="mt-4 w-full py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition shadow-sm text-center block">
            Manage Employees
          </Link>
        </div>
      </div>

      {/* Setup Checklist */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h3 className="font-bold text-slate-800">Account Setup Checklist</h3>
        </div>
        <div className="divide-y divide-slate-100">
          <div className="p-6 flex items-center gap-4 bg-emerald-50/30">
            <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
            </div>
            <div>
              <p className="font-bold text-slate-900">Accept Master Agreement</p>
              <p className="text-sm text-slate-500">Completed on {new Date(orgData?.updatedAt).toLocaleDateString('en-GB')}</p>
            </div>
          </div>
          <div className="p-6 flex items-center gap-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${orgData?.annualFeeStatus === 'pending' ? 'border-2 border-slate-300 text-slate-400' : 'bg-emerald-500 text-white'}`}>
              {orgData?.annualFeeStatus === 'pending' ? '2' : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>}
            </div>
            <div>
              <p className="font-bold text-slate-900">Pay Annual Setup Fee</p>
              <p className="text-sm text-slate-500">Your organisation's £{orgData?.annualFee?.toLocaleString()} fee must be cleared by the Super Admin.</p>
            </div>
          </div>
          <div className="p-6 flex items-center gap-4">
            <div className="w-8 h-8 rounded-full border-2 border-slate-300 text-slate-400 flex items-center justify-center shrink-0">
              3
            </div>
            <div>
              <p className="font-bold text-slate-900">Add Employees</p>
              <p className="text-sm text-slate-500">Onboard your staff so they can begin making monthly Hajj savings contributions.</p>
            </div>
          </div>
        </div>
      </div>

        {/* Document Center Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full lg:col-span-3">
          <div className="p-6 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
               <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
               Document Center
            </h2>
          </div>
          <div className="p-6 flex flex-col sm:flex-row gap-4">
            <div className="flex-1 p-5 border border-slate-200 rounded-xl flex items-start gap-4 hover:border-emerald-200 hover:bg-emerald-50/50 transition">
              <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Savings Statement</h3>
                <p className="text-xs text-slate-500 mt-1 mb-3">Download a formal PDF statement of your account balance and historical contributions.</p>
                <button 
                  onClick={downloadStatement}
                  className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition"
                >
                  Download PDF
                </button>
              </div>
            </div>

            <div className="flex-1 p-5 border border-slate-200 rounded-xl flex items-start gap-4 hover:border-blue-200 hover:bg-blue-50/50 transition">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">My Signed Agreement</h3>
                <p className="text-xs text-slate-500 mt-1 mb-3">View the specific version of the Shariah Master Agreement that you digitally signed.</p>
                {employeeData?.signedDocumentId ? (
                   <a 
                     href={employeeData.signedDocumentId.fileUrl} 
                     target="_blank" 
                     rel="noopener noreferrer"
                     className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition inline-block"
                   >
                     View Contract
                   </a>
                ) : (
                   <span className="text-xs font-medium text-slate-400 bg-slate-100 px-3 py-1 rounded-full">No Contract Found</span>
                )}
              </div>
            </div>
          </div>
        </div>

    </SidebarLayout>
  );
};

export const SuperAdminDashboard = () => {
  const { getToken } = useAuth();
  const location = useLocation();
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (location.search.includes('onboard=true')) {
      setIsCreating(true);
    }
  }, [location.search]);
  const [formData, setFormData] = useState({
    orgName: '', companyNumber: '', address: '',
    adminFirstName: '', adminLastName: '', adminEmail: '', adminPhone: '',
    annualFee: ''
  });
  const [file, setFile] = useState(null);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const token = await getToken();
      
      const submitData = new FormData();
      Object.keys(formData).forEach(key => submitData.append(key, formData[key]));
      if (file) submitData.append('agreementFile', file);

      const response = await fetch('http://localhost:5000/api/organisations/onboard', {
        method: 'POST',
        headers: { Authorization: `Bearer ${await getToken()}`,
          'Authorization': `Bearer ${token}`
        },
        body: submitData
      });

      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message || 'Failed to onboard organisation');

      alert("Success! " + data.message);
      setIsCreating(false);
      setFormData({
        orgName: '', companyNumber: '', address: '',
        adminFirstName: '', adminLastName: '', adminEmail: '', adminPhone: '',
        annualFee: ''
      });
      setFile(null);
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isCreating) {
    return (
      <SidebarLayout navigation={superAdminNavigation} title="Dashboard Overview">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 flex flex-col items-center justify-center text-center min-h-[400px]">
           <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
           </div>
           <h3 className="text-xl font-bold text-slate-900 mb-2">No Organisations Yet</h3>
           <p className="text-slate-500 max-w-md mx-auto mb-6">
              You haven't onboarded any organisations yet. Get started by setting up the first participating organisation.
           </p>
           <button 
             onClick={() => setIsCreating(true)}
             className="flex items-center justify-center py-2.5 px-6 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition"
           >
              + Onboard Organisation
           </button>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout navigation={superAdminNavigation} title="Onboard New Organisation">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-200 bg-slate-50/50">
          <h2 className="text-xl font-bold text-slate-800">Organisation Onboarding Form</h2>
          <p className="text-sm text-slate-500 mt-1">Fill out the details below to create a new tenant organisation and invite their administrator.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Section 1 */}
          <div>
            <h3 className="text-lg font-bold text-emerald-800 border-b border-slate-200 pb-2 mb-5 flex items-center gap-2">
              <span className="bg-emerald-100 text-emerald-800 w-6 h-6 rounded-full flex items-center justify-center text-sm">1</span>
              Company Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Organisation Name</label>
                <input required type="text" name="orgName" value={formData.orgName} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Company / Charity Number</label>
                <input required type="text" name="companyNumber" value={formData.companyNumber} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Registered Address</label>
                <textarea required name="address" value={formData.address} onChange={handleChange} rows="3" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none resize-none"></textarea>
              </div>
            </div>
          </div>

          {/* Section 2 */}
          <div>
            <h3 className="text-lg font-bold text-emerald-800 border-b border-slate-200 pb-2 mb-5 flex items-center gap-2">
              <span className="bg-emerald-100 text-emerald-800 w-6 h-6 rounded-full flex items-center justify-center text-sm">2</span>
              Administrator Profile
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                <input required type="text" name="adminFirstName" value={formData.adminFirstName} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                <input required type="text" name="adminLastName" value={formData.adminLastName} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Admin Email</label>
                <input required type="email" name="adminEmail" value={formData.adminEmail} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                <input required type="tel" name="adminPhone" value={formData.adminPhone} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
            </div>
          </div>

          {/* Section 3 */}
          <div>
            <h3 className="text-lg font-bold text-emerald-800 border-b border-slate-200 pb-2 mb-5 flex items-center gap-2">
              <span className="bg-emerald-100 text-emerald-800 w-6 h-6 rounded-full flex items-center justify-center text-sm">3</span>
              Financials & Agreements
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Agreed Annual Fee</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-slate-500 sm:text-sm">£</span>
                  </div>
                  <input required type="number" name="annualFee" value={formData.annualFee} onChange={handleChange} className="w-full pl-8 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="0.00" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Initial Signed Agreement (PDF)</label>
                <input type="file" accept=".pdf" onChange={handleFileChange} className="w-full px-4 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100" />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-6 border-t border-slate-200 flex justify-end gap-4">
            <button 
              type="button" 
              onClick={() => setIsCreating(false)}
              className="px-6 py-2.5 border border-slate-300 rounded-lg shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isLoading}
              className="px-6 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition disabled:opacity-50"
            >
              {isLoading ? 'Processing...' : 'Complete Onboarding'}
            </button>
          </div>
        </form>
      </div>
    </SidebarLayout>
  );
};

export const Unauthorized = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
    <div className="max-w-md w-full text-center">
      <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Access Denied</h1>
      <p className="text-slate-600 mb-8">You do not have the required permissions to view this dashboard.</p>
      <button 
        onClick={() => window.history.back()} 
        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 transition"
      >
        Go Back
      </button>
    </div>
  </div>
);
