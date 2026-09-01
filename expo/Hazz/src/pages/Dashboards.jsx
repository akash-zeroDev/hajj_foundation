import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { useToast } from '../context/ToastContext';
import { useState, useEffect } from 'react';
import { useUser, useAuth, useOrganization } from '@clerk/react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import SidebarLayout from '../layouts/SidebarLayout';
import PrimaryButton from '../components/PrimaryButton';
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
  const { showToast } = useToast();
  const { getToken } = useAuth(); // EmployeeDashboard
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

    
  const trackDocumentActivity = async (action, details) => {
    try {
      const token = await getToken();
      await fetch('http://localhost:5000/api/audit-logs/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ action, details })
      });
    } catch (e) {
      console.error('Failed to track activity', e);
    }
  };

  const downloadStatement = async () => {
    if (!employeeData) return;
    await trackDocumentActivity('DOWNLOADED_SAVINGS_STATEMENT', `Employee ${employeeData.firstName} ${employeeData.lastName} downloaded their Savings Statement PDF`);
    
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
      showToast('Failed to generate PDF statement.', 'error');
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
          // Fetch active document for employee to sign
          try {
            const docRes = await fetch('http://localhost:5000/api/documents/active');
            const docData = await docRes.json();
            if (docData.success) {
              setActiveDocument(docData.data);
            }
          } catch(e) {
            console.error('Failed to fetch active document', e);
          }
          
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
      showToast('Minimum contribution is £10', 'error');
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
      <div className="hs-onboard">
        <style>{`
  .hs-onboard {
    --green:#0b7a5b; --green-600:#0a6b50; --green-400:#17a377; --mint:#9ff0d2;
    --bg:#f4f7f6; --card:#fff; --line:#e6ecea;
    --ink:#0e1a16; --ink-2:#5c6b65; --ink-3:#8a9994;
    --amber:#8a5b12; --amber-soft:#fdf6e6; --amber-line:#f2e3c2;
    --r:14px;
    --shadow:0 1px 2px rgba(14,26,22,.04), 0 8px 24px -18px rgba(14,26,22,.35);
    background: var(--bg); color: var(--ink);
    font-family: "Plus Jakarta Sans", system-ui, -apple-system, sans-serif;
    -webkit-font-smoothing: antialiased;
    min-height: 100vh;
  }
  .hs-onboard * { box-sizing: border-box; }
  .hs-onboard .wrap { max-width: 820px; margin: 0 auto; padding: 34px 22px 60px; }
  .hs-onboard .hero { text-align: center; margin-bottom: 26px; }
  .hs-onboard .hero .ic { width: 56px; height: 56px; margin: 0 auto 14px; border-radius: 16px; display: grid; place-items: center; background: rgba(11,122,91,.10); color: var(--green); }
  .hs-onboard .hero .ic svg { width: 24px; height: 24px; stroke: currentColor; stroke-width: 1.8; fill: none; }
  .hs-onboard .hero h1 { margin: 0; font-size: 27px; letter-spacing: -.7px; }
  .hs-onboard .hero p { margin: 8px auto 0; max-width: 520px; color: var(--ink-2); font-size: 14px; line-height: 1.6; }
  .hs-onboard .steps { display: flex; align-items: center; gap: 8px; justify-content: center; margin: 22px 0 24px; }
  .hs-onboard .step { display: flex; align-items: center; gap: 8px; font-size: 12.5px; font-weight: 600; color: var(--ink-3); }
  .hs-onboard .step i { width: 22px; height: 22px; border-radius: 50%; display: grid; place-items: center; font-style: normal; font-size: 11.5px; background: #e9efed; color: var(--ink-3); }
  .hs-onboard .step.done i, .hs-onboard .step.now i { background: var(--green); color: #fff; }
  .hs-onboard .step.now, .hs-onboard .step.done { color: var(--ink); }
  .hs-onboard .steps .bar { width: 38px; height: 2px; border-radius: 2px; background: #e2e9e7; }
  .hs-onboard .card { background: var(--card); border: 1px solid var(--line); border-radius: var(--r); box-shadow: var(--shadow); margin-bottom: 16px; text-align: left; }
  .hs-onboard .card-head { padding: 16px 20px; border-bottom: 1px solid var(--line); display: flex; align-items: center; gap: 11px; }
  .hs-onboard .card-head .n { width: 24px; height: 24px; flex: 0 0 24px; border-radius: 8px; display: grid; place-items: center; font-size: 12px; font-weight: 700; background: rgba(11,122,91,.10); color: var(--green); }
  .hs-onboard .card-head h4 { margin: 0; font-size: 15px; font-weight: 700; letter-spacing: -.2px; }
  .hs-onboard .card-head p { margin: 2px 0 0; font-size: 12.5px; color: var(--ink-3); }
  .hs-onboard .card-body { padding: 20px; }
  .hs-onboard .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .hs-onboard .field { display: grid; gap: 6px; }
  .hs-onboard .field label { font-size: 12.5px; font-weight: 600; color: var(--ink-2); }
  .hs-onboard input[type="text"], .hs-onboard input[type="tel"] { width: 100%; font: inherit; font-size: 14px; padding: 11px 13px; border: 1px solid var(--line); border-radius: 10px; background: #fff; color: var(--ink); outline: none; }
  .hs-onboard input::placeholder { color: #b3bfbb; }
  .hs-onboard input:focus { border-color: var(--green-400); box-shadow: 0 0 0 3px rgba(23,163,119,.14); }
  .hs-onboard .mt { margin-top: 14px; }
  .hs-onboard .doc { border: 1px solid var(--line); border-radius: 12px; overflow: hidden; background: #fafcfb; }
  .hs-onboard .doc-bar { display: flex; align-items: center; gap: 10px; padding: 11px 14px; border-bottom: 1px solid var(--line); background: #fff; }
  .hs-onboard .doc-bar .ic { width: 30px; height: 30px; border-radius: 9px; display: grid; place-items: center; background: rgba(11,122,91,.10); color: var(--green); }
  .hs-onboard .doc-bar .ic svg { width: 16px; height: 16px; stroke: currentColor; stroke-width: 1.8; fill: none; }
  .hs-onboard .doc-bar b { font-size: 13.4px; }
  .hs-onboard .doc-bar small { display: block; color: var(--ink-3); font-size: 11.8px; }
  .hs-onboard .doc-bar .btn-sm { margin-left: auto; }
  .hs-onboard .btn-sm { border: 1px solid var(--line); background: #fff; border-radius: 9px; padding: 7px 12px; font: inherit; font-size: 12.5px; font-weight: 600; color: var(--ink); cursor: pointer; display: inline-flex; align-items: center; gap: 6px; text-decoration: none; }
  .hs-onboard .btn-sm:hover { background: #f2f6f5; }
  .hs-onboard .btn-sm svg { width: 14px; height: 14px; stroke: currentColor; stroke-width: 2; fill: none; }
  .hs-onboard .doc-body { height: 350px; padding: 0; overflow-y: hidden; font-size: 12.9px; line-height: 1.7; color: var(--ink-2); }
  .hs-onboard .agree { display: flex; gap: 11px; align-items: flex-start; margin-top: 14px; padding: 13px 14px; border-radius: 11px; background: #fafcfb; border: 1px solid var(--line); cursor: pointer;}
  .hs-onboard .agree input[type="checkbox"] { appearance: none; width: 17px; height: 17px; flex: 0 0 17px; margin: 1px 0 0; border: 1.5px solid #cfdcd7; border-radius: 5px; background: #fff; cursor: pointer; display: grid; place-items: center; padding: 0; }
  .hs-onboard .agree input[type="checkbox"]:checked { background: var(--green); border-color: var(--green); }
  .hs-onboard .agree input[type="checkbox"]:checked::after { content: ""; width: 9px; height: 5px; border-left: 2px solid #fff; border-bottom: 2px solid #fff; transform: rotate(-45deg) translateY(-1px); }
  .hs-onboard .agree span { font-size: 12.9px; color: var(--ink-2); line-height: 1.55; }
  .hs-onboard .agree b { color: var(--ink); }
  .hs-onboard .amount { display: flex; align-items: center; border: 1px solid var(--line); border-radius: 11px; background: #fff; overflow: hidden; max-width: 230px; }
  .hs-onboard .amount .cur { padding: 0 13px; color: var(--ink-3); font-weight: 600; font-size: 14px; }
  .hs-onboard .amount input { border: 0; box-shadow: none; font-size: 19px; font-weight: 700; padding: 12px 0; letter-spacing: -.4px; outline: none; flex: 1; min-width: 0; }
  .hs-onboard .amount .per { padding: 0 13px; color: var(--ink-3); font-size: 12.5px; }
  .hs-onboard .chips { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
  .hs-onboard .chip { border: 1px solid var(--line); background: #fff; border-radius: 999px; padding: 7px 14px; font: inherit; font-size: 12.8px; font-weight: 600; color: var(--ink-2); cursor: pointer; }
  .hs-onboard .chip:hover { background: #f2f6f5; }
  .hs-onboard .chip.sel { background: var(--green); border-color: var(--green); color: #fff; }
  .hs-onboard .notice { display: flex; gap: 11px; padding: 13px 14px; border-radius: 12px; background: var(--amber-soft); border: 1px solid var(--amber-line); color: var(--amber); font-size: 12.6px; line-height: 1.55; }
  .hs-onboard .notice svg { width: 17px; height: 17px; flex: 0 0 17px; margin-top: 1px; stroke: currentColor; stroke-width: 1.9; fill: none; }
  .hs-onboard .submit { border: 0; cursor: pointer; font: inherit; font-weight: 700; font-size: 14.5px; padding: 14px 18px; border-radius: 12px; width: 100%; color: #fff; background: linear-gradient(180deg,var(--green-400),var(--green)); box-shadow: 0 12px 26px -14px rgba(11,122,91,.95); display: inline-flex; align-items: center; justify-content: center; gap: 9px; }
  .hs-onboard .submit:hover { filter: brightness(1.06); }
  .hs-onboard .submit:disabled { background: #cfdcd7; box-shadow: none; cursor: not-allowed; }
  .hs-onboard .submit svg { width: 17px; height: 17px; stroke: currentColor; stroke-width: 2.2; fill: none; }
  .hs-onboard .foot-note { margin: 11px 0 0; text-align: center; font-size: 12.2px; color: var(--ink-3); }
  @media(max-width:640px){ .hs-onboard .grid2 { grid-template-columns: 1fr; } .hs-onboard .steps .bar { width: 20px; } .hs-onboard .hero h1 { font-size: 23px; } }
`}</style>
        
        <div className="wrap">
          <div className="hero">
            <div className="ic">
              <svg viewBox="0 0 24 24"><rect x="4" y="10" width="16" height="10" rx="2"/><path d="M8 10V7a4 4 0 018 0v3"/></svg>
            </div>
            <h1>Complete your enrollment</h1>
            <p>Three short steps to join {organization?.name || 'your employer'}'s savings plan — confirm your details, sign the agreement, and choose your monthly contribution.</p>
          </div>

          <div className="steps">
            <div className={`step ${firstName && lastName && phone ? 'done' : 'now'}`} id="s1"><i>1</i>Details</div><div className="bar"></div>
            <div className={`step ${isAgreed ? 'done' : ''}`} id="s2"><i>2</i>Agreement</div><div className="bar"></div>
            <div className={`step ${Number(contribution) >= 10 ? 'done' : ''}`} id="s3"><i>3</i>Contribution</div>
          </div>

          <form onSubmit={handleCompleteOnboarding} id="form">
            {/* 1 */}
            <div className="card">
              <div className="card-head">
                <span className="n">1</span>
                <div><h4>Personal details</h4><p>Used on your savings agreement.</p></div>
              </div>
              <div className="card-body">
                <div className="grid2">
                  <div className="field">
                    <label>First name</label>
                    <input type="text" required value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="John" autoComplete="given-name" />
                  </div>
                  <div className="field">
                    <label>Last name</label>
                    <input type="text" required value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Doe" autoComplete="family-name" />
                  </div>
                </div>
                <div className="field mt">
                  <label>Phone number</label>
                  <input type="tel" required value={phone} onChange={e => setPhone(e.target.value)} placeholder="+44 7700 900077" autoComplete="tel" />
                </div>
              </div>
            </div>

            {/* 2 */}
            <div className="card">
              <div className="card-head">
                <span className="n">2</span>
                <div><h4>Employee agreement</h4><p>Please read the document carefully before signing.</p></div>
              </div>
              <div className="card-body">
                <div className="doc">
                  <div className="doc-bar">
                    <span className="ic"><svg viewBox="0 0 24 24"><path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5"/></svg></span>
                    <span>
                      <b>{activeDocument?.title || 'Master Shariah Agreement'}</b>
                      <small>PDF · v{activeDocument?.version || 1} · published {activeDocument ? new Date(activeDocument.createdAt).toLocaleDateString('en-GB') : 'N/A'}</small>
                    </span>
                    {activeDocument?.fileUrl && (
                      <a href={activeDocument.fileUrl} target="_blank" rel="noopener noreferrer" className="btn-sm">
                        Open PDF<svg viewBox="0 0 24 24"><path d="M7 17L17 7"/><path d="M9 7h8v8"/></svg>
                      </a>
                    )}
                  </div>
                  <div className="doc-body">
                    {activeDocument ? (
                      <object data={activeDocument.fileUrl} type="application/pdf" style={{ width: '100%', height: '100%' }}>
                        <iframe src={activeDocument.fileUrl} style={{ width: '100%', height: '100%', border: 'none' }} title="Employee Agreement">
                          <p>Your browser does not support PDFs. <a href={activeDocument.fileUrl} target="_blank" rel="noopener noreferrer">Download the PDF</a>.</p>
                        </iframe>
                      </object>
                    ) : (
                      <div style={{ padding: '16px 18px' }}>No active agreement document found. Please contact your administrator.</div>
                    )}
                  </div>
                </div>
                <label className="agree">
                  <input type="checkbox" required checked={isAgreed} onChange={(e) => setIsAgreed(e.target.checked)} />
                  <span><b>I have read and accept the Master Shariah Agreement.</b> I understand my contributions are held in trust and remain withdrawable.</span>
                </label>
              </div>
            </div>

            {/* 3 */}
            <div className="card">
              <div className="card-head">
                <span className="n">3</span>
                <div><h4>Monthly contribution</h4><p>Automatically saved from your salary each month. Minimum £10.</p></div>
              </div>
              <div className="card-body">
                <div className="amount">
                  <span className="cur">£</span>
                  <input type="text" inputMode="numeric" required value={contribution} onChange={e => setContribution(e.target.value.replace(/\D/g, ''))} />
                  <span className="per">/ mo</span>
                </div>
                <div className="chips">
                  {[25, 50, 100, 200].map(val => (
                    <button 
                      key={val} 
                      type="button" 
                      className={`chip ${Number(contribution) === val ? 'sel' : ''}`}
                      onClick={() => setContribution(String(val))}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <div className="notice">
                  <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/></svg>
                  <span>Your first collection happens on the 1st of next month. You will receive an email confirmation with your direct-debit reference.</span>
                </div>
                <button className="submit mt" type="submit" disabled={isAccepting || !isAgreed || Number(contribution) < 10 || !firstName || !lastName || !phone}>
                  {isAccepting ? (
                    'Saving Profile...'
                  ) : (
                    <><svg viewBox="0 0 24 24"><path d="M5 12l5 5L20 7"/></svg>Accept & complete setup</>
                  )}
                </button>
                <p className="foot-note">By continuing you agree to the terms of the Master Shariah Agreement.</p>
              </div>
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
                     onClick={() => trackDocumentActivity('VIEWED_SIGNED_CONTRACT', `Employee ${employeeData.firstName} ${employeeData.lastName} viewed their signed Shariah Master Agreement`)}
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


    </OldLayout>
  );
};

export const AdminDashboard = () => {
  const { showToast } = useToast();
  const { getToken } = useAuth();
  const { organization, isLoaded: orgLoaded } = useOrganization();
  const [orgData, setOrgData] = useState(null);
  const [isLoadingBackend, setIsLoadingBackend] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const navigate = useNavigate();

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
      if (data.url) window.location.href = data.url;
      else throw new Error(data.message || 'Failed to create checkout session');
    } catch (err) {
      showToast(err.message, 'error');
      setIsRedirecting(false);
    }
  };

  const handleAcceptAgreement = async () => {
    setIsAccepting(true);
    try {
      const token = await getToken();
      const res = await fetch(`http://localhost:5000/api/organisations/${organization.id}/accept`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        showToast("Agreement signed successfully!", "success");
        setOrgData(data);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setIsAccepting(false);
    }
  };

  useEffect(() => {
    const fetchOrganisationData = async () => {
      if (!orgLoaded || !organization) return;
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const sessionId = urlParams.get('session_id');

        if (sessionId) {
          await fetch(`http://localhost:5000/api/payments/verify-annual-fee?session_id=${sessionId}`, {
            headers: { Authorization: `Bearer ${await getToken()}` }
          });
          window.history.replaceState({}, document.title, window.location.pathname);
          showToast('Payment successful!', 'success');
        }

        const token = await getToken();
        const res = await fetch(`http://localhost:5000/api/organisations/clerk/${organization.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setOrgData(data);
      } catch (err) {
        console.error(err);
        showToast('Failed to load organisation data', 'error');
      } finally {
        setIsLoadingBackend(false);
      }
    };
    fetchOrganisationData();
  }, [orgLoaded, organization]);

  if (!orgLoaded || isLoadingBackend) {
    return (
      <SidebarLayout navigation={orgAdminNavigation} title="Employer Dashboard">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#17a377]"></div>
        </div>
      </SidebarLayout>
    );
  }

  if (orgData?.agreementStatus === 'pending') {
    return (
      <div className="min-h-[calc(100vh-70px)] bg-[#f4f7f6] flex flex-col p-4 sm:p-8">
        <div className="mx-auto max-w-3xl w-full">
          <div className="text-center mb-10">
            <h1 className="text-[28px] font-extrabold text-[#0e1a16] tracking-tight mb-2">Welcome to Hajj Savings</h1>
            <p className="text-[15px] text-[#5c6b65]">Before managing your employees, you must review and accept your organisation's financial agreement.</p>
          </div>
          <div className="bg-white rounded-[14px] shadow-[0_1px_2px_rgba(14,26,22,.04),_0_8px_24px_-18px_rgba(14,26,22,.35)] overflow-hidden border border-[#e6ecea]">
            <div className="bg-[#fdf3e3] px-8 py-6 border-b border-[#f2e3c2] flex justify-between items-center">
              <div>
                <h2 className="text-[18px] font-bold text-[#c8811f] m-0 tracking-[-0.2px]">{orgData.name} - Master Agreement</h2>
              </div>
            </div>
            <div className="p-8 bg-[#fcfdfd]">
              {orgData.agreementUrl ? (
                <div className="w-full bg-slate-100 rounded-xl overflow-hidden border border-[#e6ecea] h-96">
                   <object data={orgData.agreementUrl} type="application/pdf" className="w-full h-full">
                     <iframe src={orgData.agreementUrl} className="w-full h-full" title="Agreement Document">
                       <p>Your browser does not support PDFs. <a href={orgData.agreementUrl} target="_blank" rel="noopener noreferrer">Download the PDF</a>.</p>
                     </iframe>
                   </object>
                </div>
              ) : (
                <div className="text-center py-12 border border-[#e6ecea] rounded-xl"><p className="text-[#8a9994] text-[13.5px]">No document available.</p></div>
              )}
            </div>
            <div className="px-8 py-6 bg-white border-t border-[#e6ecea] flex items-center justify-between">
              <button onClick={handleAcceptAgreement} disabled={isAccepting} className="px-8 py-3 bg-[#0b7a5b] text-white rounded-[10px] text-[14px] font-bold hover:bg-[#17a377] transition-colors disabled:opacity-50 ml-auto">
                {isAccepting ? 'Processing...' : 'I Accept & Sign Document'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const stats = orgData?.dashboardStats || { totalEmployees: 0, totalCombinedSavings: 0, hajjJourneysWon: 0, pendingAgreements: 0, activityGraphData: [], recentEmployees: [] };
  const currentMonth = new Date().getMonth();
  const currentMonthData = stats.activityGraphData?.find(d => d.month === ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][currentMonth]);
  const monthEnrolments = currentMonthData ? currentMonthData.employees : 0;

  return (
    <SidebarLayout navigation={orgAdminNavigation} title="Overview">
      <div className="flex items-end gap-4 mb-[18px] flex-wrap">
        <div>
          <h3 className="m-0 text-[23px] tracking-[-0.5px] font-bold text-[#0e1a16]">{orgData.name} Overview</h3>
          <p className="m-0 mt-1 text-[#5c6b65] text-[13.5px]">Track your company's CSR impact, monitor engagement and manage alerts.</p>
        </div>
        <div className="ml-auto flex gap-[10px]">
          <PrimaryButton 
            onClick={() => navigate('/admin/employees')}
            className="!text-[13.5px] !py-[11px] !px-[18px] !rounded-[10px] shadow-[0_10px_22px_-12px_rgba(11,122,91,.9)]"
            icon={<svg className="w-4 h-4 stroke-current stroke-[2] fill-none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14"/></svg>}
          >
            Invite Employees
          </PrimaryButton>
        </div>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        <div className="bg-white border border-[#e6ecea] rounded-[14px] shadow-[0_1px_2px_rgba(14,26,22,.04),_0_8px_24px_-18px_rgba(14,26,22,.35)] p-[18px_18px_16px] relative overflow-hidden after:content-[''] after:absolute after:-bottom-10 after:-right-[30px] after:w-[120px] after:h-[120px] after:rounded-full after:bg-[radial-gradient(circle,rgba(23,163,119,.10),transparent_70%)]">
          <div className="flex items-center justify-between relative z-10">
            <span className="text-[11px] tracking-[0.1em] uppercase text-[#8a9994] font-semibold">Staff Enrolled</span>
            <span className="w-[34px] h-[34px] rounded-[10px] grid place-items-center bg-[rgba(11,122,91,.10)] text-[#0b7a5b]"><svg viewBox="0 0 24 24" className="w-[17px] h-[17px] stroke-current stroke-[1.8] fill-none"><circle cx="9" cy="8" r="3.2"/><path strokeLinecap="round" strokeLinejoin="round" d="M3 20c0-3.3 2.7-5 6-5s6 1.7 6 5"/></svg></span>
          </div>
          <div className="mt-[14px] mb-[6px] text-[30px] font-extrabold tracking-[-1px] leading-none text-[#0e1a16] relative z-10">{stats.totalEmployees}</div>
          <span className={`text-[12.5px] font-semibold inline-flex items-center gap-[5px] relative z-10 ${monthEnrolments > 0 ? 'text-[#0b7a5b]' : 'text-[#8a9994]'}`}>
            {monthEnrolments > 0 ? (
              <><svg viewBox="0 0 24 24" className="w-[13px] h-[13px] stroke-current stroke-[2.2] fill-none"><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7"/></svg>+{monthEnrolments} this month</>
            ) : 'No new enrolments this month'}
          </span>
        </div>
        
        <div className="bg-white border border-[#e6ecea] rounded-[14px] shadow-[0_1px_2px_rgba(14,26,22,.04),_0_8px_24px_-18px_rgba(14,26,22,.35)] p-[18px_18px_16px] relative overflow-hidden after:content-[''] after:absolute after:-bottom-10 after:-right-[30px] after:w-[120px] after:h-[120px] after:rounded-full after:bg-[radial-gradient(circle,rgba(23,163,119,.10),transparent_70%)]">
          <div className="flex items-center justify-between relative z-10">
            <span className="text-[11px] tracking-[0.1em] uppercase text-[#8a9994] font-semibold">Combined Savings</span>
            <span className="w-[34px] h-[34px] rounded-[10px] grid place-items-center bg-[rgba(11,122,91,.10)] text-[#0b7a5b]"><svg viewBox="0 0 24 24" className="w-[17px] h-[17px] stroke-current stroke-[1.8] fill-none"><circle cx="12" cy="12" r="8"/><path strokeLinecap="round" strokeLinejoin="round" d="M14 9.5A2.5 2.5 0 1012 15"/></svg></span>
          </div>
          <div className="mt-[14px] mb-[6px] text-[30px] font-extrabold tracking-[-1px] leading-none text-[#0e1a16] relative z-10">£{stats.totalCombinedSavings.toLocaleString()}</div>
          <div className="text-[12.5px] text-[#5c6b65] relative z-10">Funded towards Hajj by your staff</div>
        </div>

        <div className="bg-white border border-[#e6ecea] rounded-[14px] shadow-[0_1px_2px_rgba(14,26,22,.04),_0_8px_24px_-18px_rgba(14,26,22,.35)] p-[18px_18px_16px] relative overflow-hidden after:content-[''] after:absolute after:-bottom-10 after:-right-[30px] after:w-[120px] after:h-[120px] after:rounded-full after:bg-[radial-gradient(circle,rgba(23,163,119,.10),transparent_70%)]">
          <div className="flex items-center justify-between relative z-10">
            <span className="text-[11px] tracking-[0.1em] uppercase text-[#8a9994] font-semibold">Hajj Journeys Won</span>
            <span className="w-[34px] h-[34px] rounded-[10px] grid place-items-center bg-[rgba(11,122,91,.10)] text-[#0b7a5b]"><svg viewBox="0 0 24 24" className="w-[17px] h-[17px] stroke-current stroke-[1.8] fill-none"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4h16v6a8 8 0 01-16 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M9 20h6M12 18v2"/></svg></span>
          </div>
          <div className="mt-[14px] mb-[6px] text-[30px] font-extrabold tracking-[-1px] leading-none text-[#0e1a16] relative z-10">{stats.hajjJourneysWon}</div>
          <span className="text-[12.5px] font-semibold inline-flex items-center gap-[5px] text-[#8a9994] relative z-10">No draws won yet</span>
        </div>
      </section>

      <section className="p-[22px] rounded-[14px] border border-white/5 text-[#eaf6f1] bg-[radial-gradient(120%_120%_at_100%_0%,rgba(23,163,119,.35),transparent_60%),linear-gradient(135deg,#0b7a5b,#075c44)] flex flex-col md:flex-row md:items-center gap-[22px] shadow-[0_18px_34px_-22px_rgba(7,92,68,.9)] mb-4">
        <div>
          <h4 className="m-0 mb-[6px] text-[19px] text-white tracking-[-0.3px] font-bold">The Monthly Award Draw</h4>
          <p className="m-0 text-[13.5px] text-white/80 max-w-[46ch] leading-[1.5]">Every active employee earns your company more collective chances to win the sponsored Hajj trip each month.</p>
        </div>
        <div className="md:ml-auto shrink-0 text-center px-[26px] py-[16px] rounded-[12px] bg-white/10 border border-white/10">
          <span className="block text-[10px] tracking-[0.14em] uppercase text-white/70 font-semibold">Company Tickets</span>
          <strong className="block mt-2 text-[32px] font-extrabold text-white leading-none">{stats.totalEmployees}</strong>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-[1.35fr_1fr] gap-4 mb-4">
        <div className="bg-white border border-[#e6ecea] rounded-[14px] shadow-[0_1px_2px_rgba(14,26,22,.04),_0_8px_24px_-18px_rgba(14,26,22,.35)] flex flex-col">
          <div className="flex items-center gap-3 px-[18px] py-[16px] border-b border-[#e6ecea]">
            <h4 className="m-0 text-[15px] font-bold tracking-[-0.2px] text-[#0e1a16]">Activity &amp; Engagement</h4>
            <span className="text-[12.5px] text-[#8a9994]">Enrolments per month</span>
            <span className="ml-auto text-[11.5px] font-semibold px-[10px] py-[4px] rounded-full bg-[#f2f6f5] text-[#5c6b65]">Last 6 months</span>
          </div>
          <div className="p-[18px] flex-1">
            <div className="h-[210px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={stats.activityGraphData} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                   <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10.5, fill: '#8a9994' }} dy={10} />
                   <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10.5, fill: '#8a9994' }} allowDecimals={false} />
                   <RechartsTooltip 
                     cursor={{ fill: '#f4f7f6' }}
                     contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', fontSize: '12px' }}
                   />
                   <Bar dataKey="employees" radius={[6, 6, 0, 0]}>
                     {stats.activityGraphData?.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill="#0b7a5b" />
                     ))}
                   </Bar>
                 </BarChart>
               </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#e6ecea] rounded-[14px] shadow-[0_1px_2px_rgba(14,26,22,.04),_0_8px_24px_-18px_rgba(14,26,22,.35)] flex flex-col">
          <div className="flex items-center gap-3 px-[18px] py-[16px] border-b border-[#e6ecea]">
            <h4 className="m-0 text-[15px] font-bold tracking-[-0.2px] text-[#0e1a16]">Smart Alerts</h4>
            {(orgData?.annualFeeStatus === 'pending' || stats.pendingAgreements > 0) ? (
              <span className="ml-auto text-[11.5px] font-semibold px-[10px] py-[4px] rounded-full bg-[#fdf3e3] text-[#c8811f]">
                {(orgData?.annualFeeStatus === 'pending' ? 1 : 0) + (stats.pendingAgreements > 0 ? 1 : 0)} Pending
              </span>
            ) : (
               <span className="ml-auto text-[11.5px] font-semibold px-[10px] py-[4px] rounded-full bg-[rgba(23,163,119,.14)] text-[#0b7a5b]">All clear</span>
            )}
          </div>
          <ul className="m-0 p-0 list-none flex-1">
            {orgData?.annualFeeStatus === 'pending' && (
              <li className="flex gap-3 items-start px-[18px] py-[14px] border-b border-[#e6ecea] last:border-0">
                <span className="w-[32px] h-[32px] shrink-0 rounded-[9px] grid place-items-center bg-[#fdf3e3] text-[#c8811f]"><svg viewBox="0 0 24 24" className="w-[16px] h-[16px] stroke-current stroke-[1.9] fill-none"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4l9 16H3z"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 10v4M12 17h.01"/></svg></span>
                <div><strong className="block text-[13.5px] font-semibold text-[#0e1a16]">Fee payment required</strong><small className="block text-[#5c6b65] text-[12.5px] mt-[2px]">Your annual fee of £{orgData?.annualFee?.toLocaleString()} is pending.</small></div>
                <button onClick={handlePayAnnualFee} disabled={isRedirecting} className="ml-auto self-center text-[#0b7a5b] text-[12.5px] font-semibold hover:underline whitespace-nowrap bg-transparent border-0 cursor-pointer p-0">{isRedirecting ? 'Connecting...' : 'Pay now'}</button>
              </li>
            )}
            {orgData?.agreementStatus === 'signed' && (
              <li className="flex gap-3 items-start px-[18px] py-[14px] border-b border-[#e6ecea] last:border-0">
                <span className="w-[32px] h-[32px] shrink-0 rounded-[9px] grid place-items-center bg-[rgba(23,163,119,.14)] text-[#0b7a5b]"><svg viewBox="0 0 24 24" className="w-[16px] h-[16px] stroke-current stroke-[1.9] fill-none"><path strokeLinecap="round" strokeLinejoin="round" d="M20 6L9 17l-5-5"/></svg></span>
                <div><strong className="block text-[13.5px] font-semibold text-[#0e1a16]">Shariah agreement signed</strong><small className="block text-[#5c6b65] text-[12.5px] mt-[2px]">Master agreement v2 active for your organisation.</small></div>
                <a href={orgData?.agreementUrl} target="_blank" rel="noopener noreferrer" className="ml-auto self-center text-[#0b7a5b] text-[12.5px] font-semibold hover:underline whitespace-nowrap">View</a>
              </li>
            )}
            {stats.pendingAgreements > 0 && (
              <li className="flex gap-3 items-start px-[18px] py-[14px] border-b border-[#e6ecea] last:border-0">
                <span className="w-[32px] h-[32px] shrink-0 rounded-[9px] grid place-items-center bg-[#fdf3e3] text-[#c8811f]"><svg viewBox="0 0 24 24" className="w-[16px] h-[16px] stroke-current stroke-[1.9] fill-none"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg></span>
                <div><strong className="block text-[13.5px] font-semibold text-[#0e1a16]">Action Required</strong><small className="block text-[#5c6b65] text-[12.5px] mt-[2px]">{stats.pendingAgreements} employees are pending agreement signature.</small></div>
                <Link to="/admin/employees" className="ml-auto self-center text-[#0b7a5b] text-[12.5px] font-semibold hover:underline whitespace-nowrap">Review</Link>
              </li>
            )}
            {stats.totalEmployees < 2 && (
              <li className="flex gap-3 items-start px-[18px] py-[14px] border-b border-[#e6ecea] last:border-0">
                <span className="w-[32px] h-[32px] shrink-0 rounded-[9px] grid place-items-center bg-[#fdf3e3] text-[#c8811f]"><svg viewBox="0 0 24 24" className="w-[16px] h-[16px] stroke-current stroke-[1.9] fill-none"><circle cx="9" cy="8" r="3.2"/><path strokeLinecap="round" strokeLinejoin="round" d="M3 20c0-3.3 2.7-5 6-5s6 1.7 6 5"/></svg></span>
                <div><strong className="block text-[13.5px] font-semibold text-[#0e1a16]">Invite more staff</strong><small className="block text-[#5c6b65] text-[12.5px] mt-[2px]">Only {stats.totalEmployees} of your team has enrolled so far.</small></div>
                <Link to="/admin/employees" className="ml-auto self-center text-[#0b7a5b] text-[12.5px] font-semibold hover:underline whitespace-nowrap">Invite</Link>
              </li>
            )}
          </ul>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-[1.35fr_1fr] gap-4 mb-4">
        <div className="bg-white border border-[#e6ecea] rounded-[14px] shadow-[0_1px_2px_rgba(14,26,22,.04),_0_8px_24px_-18px_rgba(14,26,22,.35)] overflow-hidden">
          <div className="flex items-center gap-3 px-[18px] py-[16px] border-b border-[#e6ecea]">
            <h4 className="m-0 text-[15px] font-bold tracking-[-0.2px] text-[#0e1a16]">Recent Employees</h4>
            <span className="text-[12.5px] text-[#8a9994]">Latest enrolments</span>
            <Link to="/admin/employees" className="ml-auto text-[#0b7a5b] text-[12.5px] font-semibold hover:underline whitespace-nowrap">View all</Link>
          </div>
          <div className="overflow-x-auto w-full">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr>
                  <th className="px-[18px] py-3 text-[10.5px] tracking-[0.1em] uppercase text-[#8a9994] font-bold border-b border-[#e6ecea]">Employee</th>
                  <th className="px-[18px] py-3 text-[10.5px] tracking-[0.1em] uppercase text-[#8a9994] font-bold border-b border-[#e6ecea]">Monthly</th>
                  <th className="px-[18px] py-3 text-[10.5px] tracking-[0.1em] uppercase text-[#8a9994] font-bold border-b border-[#e6ecea]">Balance</th>
                  <th className="px-[18px] py-3 text-[10.5px] tracking-[0.1em] uppercase text-[#8a9994] font-bold border-b border-[#e6ecea]">Agreement</th>
                  <th className="px-[18px] py-3 text-[10.5px] tracking-[0.1em] uppercase text-[#8a9994] font-bold border-b border-[#e6ecea]">Joined</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentEmployees?.map((emp) => (
                  <tr key={emp._id} className="hover:bg-[#f7faf9] transition-colors border-b border-[#e6ecea] last:border-0">
                    <td className="px-[18px] py-[12px] text-[13.5px]">
                      <span className="flex items-center gap-[10px] font-semibold text-[#0e1a16]">{emp.firstName} {emp.lastName}</span>
                    </td>
                    <td className="px-[18px] py-[12px] text-[13.5px] text-[#0e1a16]">£{emp.contribution || 0}</td>
                    <td className="px-[18px] py-[12px] text-[13.5px] text-[#0e1a16]">£{emp.balance || 0}</td>
                    <td className="px-[18px] py-[12px] text-[13.5px]">
                      {emp.agreementStatus === 'signed' ? (
                        <span className="text-[11.5px] font-semibold px-[9px] py-[3px] rounded-full bg-[rgba(23,163,119,.14)] text-[#0b7a5b]">Signed</span>
                      ) : emp.agreementStatus === 'pending' ? (
                        <span className="text-[11.5px] font-semibold px-[9px] py-[3px] rounded-full bg-[#fdf3e3] text-[#c8811f]">Pending</span>
                      ) : (
                        <span className="text-[11.5px] font-semibold px-[9px] py-[3px] rounded-full bg-[#f2f6f5] text-[#5c6b65]">Invited</span>
                      )}
                    </td>
                    <td className="px-[18px] py-[12px] text-[13.5px] text-[#0e1a16]">
                      {new Date(emp.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
                {(!stats.recentEmployees || stats.recentEmployees.length === 0) && (
                  <tr>
                    <td colSpan="5" className="px-[18px] py-8 text-center text-[#8a9994] text-[13.5px]">No employees enrolled yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white border border-[#e6ecea] rounded-[14px] shadow-[0_1px_2px_rgba(14,26,22,.04),_0_8px_24px_-18px_rgba(14,26,22,.35)]">
          <div className="flex items-center gap-3 px-[18px] py-[16px] border-b border-[#e6ecea]">
            <h4 className="m-0 text-[15px] font-bold tracking-[-0.2px] text-[#0e1a16]">Quick Actions</h4>
          </div>
          <div className="grid gap-[10px] p-[18px]">
            <button onClick={() => navigate('/admin/employees')} className="flex items-center gap-3 w-full p-[13px_14px] rounded-[11px] border border-[#e6ecea] bg-white cursor-pointer text-[13.5px] font-semibold text-left text-[#0e1a16] hover:border-[#17a377] hover:bg-[rgba(23,163,119,.05)] transition-colors">
              <span className="w-[30px] h-[30px] shrink-0 rounded-[9px] grid place-items-center bg-[rgba(11,122,91,.10)] text-[#0b7a5b]"><svg viewBox="0 0 24 24" className="w-[16px] h-[16px] stroke-current stroke-[1.9] fill-none"><path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14"/></svg></span>
              Invite New Employees
            </button>
            <button onClick={handlePayAnnualFee} className="flex items-center gap-3 w-full p-[13px_14px] rounded-[11px] border border-[#e6ecea] bg-white cursor-pointer text-[13.5px] font-semibold text-left text-[#0e1a16] hover:border-[#17a377] hover:bg-[rgba(23,163,119,.05)] transition-colors">
              <span className="w-[30px] h-[30px] shrink-0 rounded-[9px] grid place-items-center bg-[rgba(11,122,91,.10)] text-[#0b7a5b]"><svg viewBox="0 0 24 24" className="w-[16px] h-[16px] stroke-current stroke-[1.9] fill-none"><rect x="3" y="6" width="18" height="12" rx="2"/><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18"/></svg></span>
              Pay Annual Fee
            </button>
            <button onClick={() => navigate('/admin/agreements')} className="flex items-center gap-3 w-full p-[13px_14px] rounded-[11px] border border-[#e6ecea] bg-white cursor-pointer text-[13.5px] font-semibold text-left text-[#0e1a16] hover:border-[#17a377] hover:bg-[rgba(23,163,119,.05)] transition-colors">
              <span className="w-[30px] h-[30px] shrink-0 rounded-[9px] grid place-items-center bg-[rgba(11,122,91,.10)] text-[#0b7a5b]"><svg viewBox="0 0 24 24" className="w-[16px] h-[16px] stroke-current stroke-[1.9] fill-none"><path strokeLinecap="round" strokeLinejoin="round" d="M7 3h7l5 5v13H7z"/><path strokeLinecap="round" strokeLinejoin="round" d="M14 3v5h5"/></svg></span>
              View Agreements
            </button>
          </div>
        </div>
      </section>
    </SidebarLayout>
  );
};


export const SuperAdminDashboard = () => {
  const [overviewData, setOverviewData] = useState({
    recentOrgs: [],
    stats: { totalOrgs: 0, activeMembers: 0, totalSavings: 0 },
    alerts: { pendingDraws: 0, unpaidOrgs: 0 }
  });
  const [isLoading, setIsLoading] = useState(true);
  const { getToken } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const token = await getToken();
        const res = await fetch('http://localhost:5000/api/organisations?limit=5', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        
        setOverviewData({
          recentOrgs: data.organisations || [],
          stats: { totalOrgs: data.totalOrganisations || 0, activeMembers: 0, totalSavings: 0 },
          alerts: { pendingDraws: 0, unpaidOrgs: 0 }
        });
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOverview();
  }, []);

  return (
    <SidebarLayout navigation={superAdminNavigation} title="Super Admin Dashboard">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Platform Overview</h1>
        <p className="text-sm text-slate-500">Manage organisations, monitor global savings, and run awards.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-sm font-medium text-slate-500 mb-1">Total Organisations</h3>
          <p className="text-3xl font-bold text-slate-900">{overviewData.stats.totalOrgs}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-sm font-medium text-slate-500 mb-1">Active Members</h3>
          <p className="text-3xl font-bold text-slate-900">0</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-sm font-medium text-slate-500 mb-1">Total Savings (Platform)</h3>
          <p className="text-3xl font-bold text-emerald-600">£0</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white border border-[#e6ecea] rounded-[14px] shadow-[0_1px_2px_rgba(14,26,22,.04),0_8px_24px_-18px_rgba(14,26,22,.35)] overflow-hidden">
            <div className="flex items-center gap-3 px-[18px] py-4 border-b border-[#e6ecea]">
              <h4 className="m-0 text-[15px] font-bold tracking-[-0.2px] text-[#0e1a16]">Recent Organisations</h4>
              <Link to="/superadmin/organisations" className="ml-auto text-[#0b7a5b] text-[12.5px] font-semibold hover:underline">View all</Link>
            </div>
            <div className="overflow-x-auto w-full">
              <table className="w-full border-collapse text-left text-[13.5px]">
                <thead>
                  <tr>
                    <th className="px-[18px] py-3 text-[10.5px] tracking-[0.1em] uppercase text-[#8a9994] font-bold border-b border-[#e6ecea]">Organisation</th>
                    <th className="px-[18px] py-3 text-[10.5px] tracking-[0.1em] uppercase text-[#8a9994] font-bold border-b border-[#e6ecea]">Annual Fee</th>
                    <th className="px-[18px] py-3 text-[10.5px] tracking-[0.1em] uppercase text-[#8a9994] font-bold border-b border-[#e6ecea]">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {overviewData.recentOrgs.map((org, i) => (
                    <tr key={i} className="hover:bg-[#f7faf9] border-b border-[#e6ecea] last:border-0 transition-colors">
                      <td className="px-[18px] py-3 font-semibold text-[#0e1a16]">{org.name}</td>
                      <td className="px-[18px] py-3">
                        {org.annualFeeStatus === 'paid' ? (
                          <span className="text-[11.5px] font-semibold px-[9px] py-[3px] rounded-full bg-[rgba(23,163,119,.14)] text-[#0b7a5b]">Paid</span>
                        ) : (
                          <span className="text-[11.5px] font-semibold px-[9px] py-[3px] rounded-full bg-[#fdf3e3] text-[#c8811f]">Unpaid</span>
                        )}
                      </td>
                      <td className="px-[18px] py-3 text-[#0e1a16]">{new Date(org.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {overviewData.recentOrgs.length === 0 && (
                    <tr><td colSpan="3" className="px-[18px] py-4 text-center text-[#5c6b65]">No organisations onboarded yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-[#e6ecea] rounded-[14px] shadow-[0_1px_2px_rgba(14,26,22,.04),0_8px_24px_-18px_rgba(14,26,22,.35)] overflow-hidden">
            <div className="px-[18px] py-4 border-b border-[#e6ecea]">
              <h4 className="m-0 text-[15px] font-bold tracking-[-0.2px] text-[#0e1a16]">Quick Actions</h4>
            </div>
            <div className="p-4 space-y-3">
              <PrimaryButton onClick={() => navigate('/superadmin?onboard=true')} className="w-full justify-center">
                Onboard Organisation
              </PrimaryButton>
              <button onClick={() => navigate('/superadmin/awards')} className="w-full flex items-center justify-center gap-2 p-[13px_14px] rounded-[11px] border border-[#e6ecea] bg-white cursor-pointer font-inherit text-[13.5px] font-semibold text-[#0e1a16] hover:bg-slate-50 transition-colors">
                Run Awards Draw
              </button>
            </div>
          </div>
        </div>
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
