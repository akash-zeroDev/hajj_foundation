import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { useToast } from '../context/ToastContext';
import { useState, useEffect } from 'react';
import { useUser, useAuth, useOrganization } from '@clerk/react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import SidebarLayout from '../layouts/SidebarLayout';
import HorizontalTabs from '../components/HorizontalTabs';
import { EmployeeSettings } from './employee/Settings';
import PrimaryButton from '../components/PrimaryButton';
import { superAdminNavigation, orgAdminNavigation } from '../config/navigation';
import { Building2, Users, Landmark, CreditCard, Plus } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

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

export { EmployeeDashboard } from "./EmployeeDashboard";

export const AdminDashboard = () => {
  const { showToast } = useToast();
  const { getToken } = useAuth();
  const { organization, isLoaded: orgLoaded } = useOrganization();
  const [orgData, setOrgData] = useState(null);
  const [isLoadingBackend, setIsLoadingBackend] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrganisationData = async () => {
      if (!orgLoaded || !organization) return;
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const sessionId = urlParams.get('session_id');

        if (sessionId) {
          await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/payments/verify-annual-fee?session_id=${sessionId}`, {
            headers: { Authorization: `Bearer ${await getToken()}` }
          });
          window.history.replaceState({}, document.title, window.location.pathname);
          showToast('Payment successful!', 'success');
        }

        const token = await getToken();
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/organisations/clerk/${organization.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setOrgData(data);
      } catch (err) {
        showToast('Error loading organisation data', 'error');
      } finally {
        setIsLoadingBackend(false);
      }
    };
    fetchOrganisationData();
  }, [orgLoaded, organization]);

  const handlePayAnnualFee = async () => {
    setIsRedirecting(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/payments/create-annual-fee-checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${await getToken()}` },
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

  
  const [isAccepting, setIsAccepting] = useState(false);
  
  const handleAcceptAgreement = async () => {
    try {
      setIsAccepting(true);
      const token = await getToken();
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/organisations/clerk/${organization.id}/accept-agreement`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ agreementStatus: 'signed' })
      });
      if (res.ok) {
        showToast('Agreement accepted successfully!', 'success');
        window.location.reload();
      } else {
        const errorData = await res.json();
        showToast(errorData.message || 'Failed to accept agreement', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('An error occurred while accepting', 'error');
    } finally {
      setIsAccepting(false);
    }
  };

  if (!orgLoaded || isLoadingBackend) {
    return (
      <SidebarLayout navigation={orgAdminNavigation} title="Employer Dashboard">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#17a377]"></div>
        </div>
      </SidebarLayout>
    );
  }

  // Handle master agreement acceptance wall (existing logic)
  if (orgData?.agreementStatus === 'pending') {
    return (
      <SidebarLayout navigation={orgAdminNavigation} title="Employer Dashboard">
        <div className="min-h-[calc(100vh-70px)] bg-[#f4f7f6] flex flex-col p-4 sm:p-8 items-center justify-center">
          <div className="mx-auto max-w-4xl w-full flex flex-col items-center">
            <div className="text-center mb-6">
              <h1 className="text-[28px] font-extrabold text-[#0e1a16] tracking-tight mb-2">Welcome to Hajj Savings</h1>
              <p className="text-[15px] text-[#5c6b65]">Before managing your employees, you must review and accept your organisation's financial agreement.</p>
            </div>
            
            {orgData?.agreementUrl && (
              <div className="w-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8 h-[500px]">
                <iframe 
                  src={`${orgData.agreementUrl}#toolbar=0`} 
                  className="w-full h-full" 
                  title="Master Agreement"
                />
              </div>
            )}
            
            <button onClick={handleAcceptAgreement} disabled={isAccepting} className="font-semibold text-[14px] px-8 py-3 rounded-xl inline-flex items-center justify-center gap-2 bg-[#0E5C3E] text-white hover:bg-[#0b4830] transition-colors disabled:opacity-50">
              {isAccepting ? 'Accepting...' : 'Accept Agreement →'}
            </button>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  const stats = orgData?.dashboardStats || {};
  const totalEmp = stats.totalEmployees || 0;
  const signedAgreements = totalEmp - (stats.pendingAgreements || 0);
  const signedPercent = totalEmp > 0 ? Math.round((signedAgreements / totalEmp) * 100) : 0;
  
  // Need to handle missing values safely based on what API returns
  const avgMonthly = totalEmp > 0 ? (stats.totalCombinedSavings || 0) / totalEmp : 0; // rough estimate
  
  // Custom styles for sparkline chart
  const pts = stats.activityGraphData ? stats.activityGraphData.map(d => d.employees) : [0,0,0,0,0,0];
  const labels = stats.activityGraphData ? stats.activityGraphData.map(d => d.month) : ['-','-','-','-','-','-'];
  const max = Math.max(4, ...pts);
  const W = 620, H = 110, pl = 8, pr = 8, pt = 8, pb = 20;
  const X = i => pl + (W - pl - pr) * (i / (pts.length - 1 || 1));
  const Y = v => pt + (H - pt - pb) * (1 - v / max);
  const line = pts.map((v, i) => `${X(i)},${Y(v)}`).join(' ');
  const area = `${X(0)},${H - pb} ` + line + ` ${X(pts.length - 1 || 1)},${H - pb}`;

  return (
    <SidebarLayout navigation={orgAdminNavigation} title="Overview">
      <div className="max-w-[1180px] w-full mx-auto pb-[48px]">
        {/* Page head */}
        <div className="flex items-start gap-4 flex-wrap mt-1 mb-5">
          <div>
            <p className="text-[10.5px] font-semibold tracking-[0.12em] uppercase text-[#9CA3AF] m-0 mb-1.5">Employer workspace</p>
            <h1 className="text-[26px] font-bold tracking-[-0.03em] m-0 leading-[1.05]">{orgData?.name} <span className="text-[#9CA3AF] font-medium">Overview</span></h1>
          </div>
          <div className="ml-auto flex gap-2.5 items-center">
            <button className="bg-white border border-[#E5E7EB] text-[#2B3330] rounded-lg px-3.5 py-2.5 text-[13.5px] font-[550] cursor-pointer hover:border-[#D1D5DB]" onClick={() => navigate('/admin/agreements')}>View agreements</button>
            <button className="bg-[#0E5C3E] text-white border border-[#0E5C3E] rounded-lg px-4 py-2.5 text-[13.5px] font-[650] cursor-pointer hover:bg-[#0A3D2A]" onClick={() => navigate('/admin/employees')}>+ Invite employees</button>
          </div>
        </div>

        {/* Fee strip */}
        <div className="flex items-center gap-3 bg-white border border-[#E5E7EB] border-l-4 border-l-[#EAB308] rounded-lg px-4 py-[11px] mb-5 text-[13px] shadow-sm">
          <span className="text-[10.5px] font-semibold tracking-[0.1em] uppercase text-[#6B7280]">Annual fee</span>
          <span className="font-mono font-semibold text-[14px]">£{orgData?.annualFee || 0}</span>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#FEF3C7] border border-[#EAB308] text-[#92400E]">
            {orgData?.annualFeeStatus === 'paid' ? 'Paid' : 'Pending'}
          </span>
          <span className="text-[#9CA3AF] text-[12.5px]">
            {orgData?.annualFeeStatus === 'paid' ? 'Valid for 12 months' : 'due to keep award eligibility'}
          </span>
          {orgData?.annualFeeStatus !== 'paid' && (
            <button onClick={handlePayAnnualFee} className="ml-auto text-[12.5px] font-[650] text-[#0E5C3E] bg-transparent border-0 cursor-pointer hover:underline whitespace-nowrap">Pay now →</button>
          )}
        </div>

        {/* Position: asymmetric ledger panel */}
        <section className="bg-white border border-[#E5E7EB] rounded-[10px] shadow-sm mb-3.5 overflow-hidden" aria-label="Financial position">
          <div className="grid grid-cols-1 md:grid-cols-[1.15fr_1fr]">
            <div className="p-[22px_24px_18px] md:border-r border-b md:border-b-0 border-[#EEF0F3]">
              <p className="text-[10.5px] font-semibold tracking-[0.12em] uppercase text-[#9CA3AF] m-0">Combined staff savings</p>
              <p className="font-mono text-[46px] font-semibold tracking-[-0.05em] leading-none m-[10px_0_4px]">£{stats.totalCombinedSavings || 0} <small className="text-[15px] text-[#9CA3AF] font-medium tracking-[-0.01em]">GBP · in trust</small></p>
              <p className="m-0 text-[13px] text-[#6B7280]">Across <b className="text-[#0B0F0E]">{totalEmp} staff</b> · avg balance <b className="font-mono text-[#0B0F0E]">£{avgMonthly.toFixed(2)}</b></p>
              <div className="h-[1px] bg-[#EEF0F3] mt-4 mb-0"></div>
              <div className="flex items-center gap-2.5 pt-[13px] pb-0.5 text-[12.5px] text-[#6B7280]">
                <span className="w-[22px] h-[22px] rounded-full bg-[#F9FAFB] border border-[#E5E7EB] grid place-items-center text-[11px] font-bold text-[#0E5C3E] shrink-0">✓</span>
                <span>Monthly Award Draw — <b className="text-[#0B0F0E]">{totalEmp}</b> company tickets · <b className="text-[#0B0F0E]">{stats.hajjJourneysWon || 0}</b> journeys won</span>
                
              </div>
            </div>
            <div className="py-1.5">
              <div className="flex items-baseline justify-between gap-3 px-6 py-[13px] border-b border-[#EEF0F3] text-[13px]">
                <span className="text-[#6B7280]">Active direct debits</span>
                <span className="font-[650] tracking-[-0.01em] text-right">{stats.activeDirectDebits || 0} of {totalEmp}</span>
              </div>
              <div className="flex items-baseline justify-between gap-3 px-6 py-[13px] border-b border-[#EEF0F3] text-[13px]">
                <span className="text-[#6B7280]">Agreements signed</span>
                <span className="font-[650] tracking-[-0.01em] text-right">{signedAgreements} of {totalEmp} <span className="text-[11px] font-bold text-[#065F46] bg-[#ECFDF5] border border-[#A7F3D0] rounded-full px-1.5 py-[1px] ml-2 whitespace-nowrap">{signedPercent}%</span></span>
              </div>
              <div className="flex items-baseline justify-between gap-3 px-6 py-[13px] text-[13px]">
                <span className="text-[#6B7280]">Collection health</span>
                <span className={`font-[650] tracking-[-0.01em] text-right ${stats.collectionHealth === 'On track' ? 'text-[#065F46]' : 'text-[#92400E]'}`}>{stats.collectionHealth || 'On track'}</span>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 mb-3.5">
          <div className="md:col-span-8 bg-white border border-[#E5E7EB] rounded-[10px] shadow-sm overflow-hidden flex flex-col">
            <div className="flex items-baseline gap-2.5 px-[18px] py-[13px] border-b border-[#EEF0F3]">
              <h3 className="m-0 text-[13px] font-[650] tracking-[-0.01em]">Enrolments</h3>
              <span className="text-[12px] text-[#9CA3AF]">per month</span>
              <span className="ml-auto text-[12px] text-[#9CA3AF]">Last 6 months</span>
            </div>
            <div className="p-[16px_18px_8px] overflow-hidden">
              <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[120px] block">
                {[0.5].map(t => <line key={t} x1={pl} x2={W-pr} y1={pt+(H-pt-pb)*t} y2={pt+(H-pt-pb)*t} stroke="#EEF0F3" strokeWidth="1"/>)}
                <polygon points={area} fill="#EDF3EF"/>
                <polyline points={line} fill="none" stroke="#0E5C3E" strokeWidth="1.75" strokeLinejoin="round"/>
                {pts.map((v,i) => <circle key={i} cx={X(i)} cy={Y(v)} r={v>0?3.5:2} fill={v>0?'#0E5C3E':'#D1D5DB'} stroke="#fff" strokeWidth="1.5"><title>{labels[i]}: {v}</title></circle>)}
                {labels.map((m,i) => <text key={i} x={X(i)} y={H-3} textAnchor="middle" fontSize="10.5" fill="#9CA3AF" fontFamily="Inter">{m}</text>)}
              </svg>
            </div>
            <div className="flex justify-between gap-2.5 p-[11px_18px] border-t border-[#EEF0F3] text-[12.5px] text-[#6B7280]">
              <span>All <b>{totalEmp}</b> enrolments visualised</span>
              <button onClick={() => navigate('/admin/employees')} className="text-[#0E5C3E] font-semibold cursor-pointer hover:underline bg-transparent border-0">Employee list →</button>
            </div>
          </div>
          
          <div className="md:col-span-4 bg-white border border-[#E5E7EB] rounded-[10px] shadow-sm overflow-hidden flex flex-col">
            <div className="flex items-baseline gap-2.5 px-[18px] py-[13px] border-b border-[#EEF0F3]">
              <h3 className="m-0 text-[13px] font-[650] tracking-[-0.01em]">Needs attention</h3>
              <span className="ml-auto text-[12px] text-[#9CA3AF]">Alerts</span>
            </div>
            {orgData?.annualFeeStatus !== 'paid' && (
              <div className="flex gap-3 items-start p-[13px_18px] border-b border-[#EEF0F3] text-[13px]">
                <span className="font-mono text-[11px] text-[#9CA3AF] pt-[2px] min-w-[18px]">01</span>
                <div>
                  <b className="block font-semibold tracking-[-0.01em]">Annual fee pending</b>
                  <small className="block text-[#6B7280] text-[12.5px] mt-[1px]">Eligibility lapses if unpaid.</small>
                </div>
                <button onClick={handlePayAnnualFee} className="ml-auto self-center text-[12.5px] font-semibold text-[#0E5C3E] bg-transparent border-0 cursor-pointer hover:underline whitespace-nowrap">Pay</button>
              </div>
            )}
            {stats.pendingAgreements > 0 && (
              <div className="flex gap-3 items-start p-[13px_18px] border-b border-[#EEF0F3] text-[13px]">
                <span className="font-mono text-[11px] text-[#9CA3AF] pt-[2px] min-w-[18px]">02</span>
                <div>
                  <b className="block font-semibold tracking-[-0.01em]">Agreements pending</b>
                  <small className="block text-[#6B7280] text-[12.5px] mt-[1px]">{stats.pendingAgreements} staff need to sign.</small>
                </div>
                <button onClick={() => navigate('/admin/agreements')} className="ml-auto self-center text-[12.5px] font-semibold text-[#0E5C3E] bg-transparent border-0 cursor-pointer hover:underline whitespace-nowrap">View</button>
              </div>
            )}
            {orgData?.annualFeeStatus === 'paid' && stats.pendingAgreements === 0 && (
               <div className="p-5 text-center text-[13px] text-[#6B7280]">All good! No pending actions.</div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
          <div className="md:col-span-8 bg-white border border-[#E5E7EB] rounded-[10px] shadow-sm overflow-hidden flex flex-col">
            <div className="flex items-baseline gap-2.5 px-[18px] py-[13px] border-b border-[#EEF0F3]">
              <h3 className="m-0 text-[13px] font-[650] tracking-[-0.01em]">Recent employees</h3>
              <span className="text-[12px] text-[#9CA3AF]">latest enrolments</span>
              <span className="ml-auto"><button onClick={() => navigate('/admin/employees')} className="text-[#0E5C3E] font-semibold cursor-pointer text-[12.5px] bg-transparent border-0 hover:underline">View all →</button></span>
            </div>
            <div className="overflow-auto w-full">
              <table className="w-full border-collapse text-[13px]">
                <thead>
                  <tr>
                    <th className="text-[10px] font-semibold tracking-[0.09em] uppercase text-[#9CA3AF] text-left p-[9px_16px] border-b border-[#E5E7EB] bg-white whitespace-nowrap">Employee</th>
                    <th className="text-[10px] font-semibold tracking-[0.09em] uppercase text-[#9CA3AF] text-left p-[9px_16px] border-b border-[#E5E7EB] bg-white whitespace-nowrap">Monthly</th>
                    <th className="text-[10px] font-semibold tracking-[0.09em] uppercase text-[#9CA3AF] text-left p-[9px_16px] border-b border-[#E5E7EB] bg-white whitespace-nowrap">Balance</th>
                    <th className="text-[10px] font-semibold tracking-[0.09em] uppercase text-[#9CA3AF] text-left p-[9px_16px] border-b border-[#E5E7EB] bg-white whitespace-nowrap">Agreement</th>
                    <th className="text-[10px] font-semibold tracking-[0.09em] uppercase text-[#9CA3AF] text-left p-[9px_16px] border-b border-[#E5E7EB] bg-white whitespace-nowrap">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {(stats.recentEmployees || []).map(emp => (
                    <tr key={emp._id} className="hover:bg-[#FAFAF8] group">
                      <td className="p-[11px_16px] border-b border-[#EEF0F3] align-middle whitespace-nowrap group-last:border-0"><span className="font-semibold tracking-[-0.01em]">{emp.firstName} {emp.lastName}</span></td>
                      <td className="p-[11px_16px] border-b border-[#EEF0F3] align-middle whitespace-nowrap group-last:border-0 font-mono">{emp.monthlyContribution ? `£${emp.monthlyContribution}` : <span className="text-[#9CA3AF]">—</span>}</td>
                      <td className="p-[11px_16px] border-b border-[#EEF0F3] align-middle whitespace-nowrap group-last:border-0 font-mono"><b>£{emp.balance || 0}</b></td>
                      <td className="p-[11px_16px] border-b border-[#EEF0F3] align-middle whitespace-nowrap group-last:border-0">
                        {emp.agreementStatus === 'signed' ? (
                          <span className="text-[11px] font-[650] p-[2px_0] text-[#065F46] ">Signed</span>
                        ) : (
                          <span className="text-[11px] font-[650] p-[2px_0] text-[#92400E] ">Pending</span>
                        )}
                      </td>
                      <td className="p-[11px_16px] border-b border-[#EEF0F3] align-middle whitespace-nowrap group-last:border-0 text-[#6B7280]">
                        {new Date(emp.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                  {(!stats.recentEmployees || stats.recentEmployees.length === 0) && (
                    <tr><td colSpan="5" className="p-4 text-center text-[#6B7280]">No employees yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="md:col-span-4 bg-white border border-[#E5E7EB] rounded-[10px] shadow-sm overflow-hidden flex flex-col">
            <div className="flex items-baseline gap-2.5 px-[18px] py-[13px] border-b border-[#EEF0F3]">
              <h3 className="m-0 text-[13px] font-[650] tracking-[-0.01em]">Actions</h3>
            </div>
            <button onClick={handlePayAnnualFee} className="flex items-center gap-3 w-full text-left bg-transparent border-0 border-b border-[#EEF0F3] p-[13px_18px] text-[13.5px] font-[650] cursor-pointer text-[#0A3D2A] hover:bg-[#FAFAF8]">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-[15px] h-[15px] text-[#9CA3AF]"><rect x="3" y="6" width="18" height="12" rx="2"/><path d="M3 10h18"/></svg>
              Pay annual fee
              <span className="ml-auto text-[#9CA3AF] text-[14px]">→</span>
            </button>
            <button onClick={() => navigate('/admin/agreements')} className="flex items-center gap-3 w-full text-left bg-transparent border-0 border-b border-[#EEF0F3] p-[13px_18px] text-[13.5px] font-[550] cursor-pointer text-[#0B0F0E] hover:bg-[#FAFAF8]">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-[15px] h-[15px] text-[#9CA3AF]"><path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5"/></svg>
              View agreements
              <span className="ml-auto text-[#9CA3AF] text-[14px]">→</span>
            </button>
            <button onClick={() => navigate('/admin/employees')} className="flex items-center gap-3 w-full text-left bg-transparent border-0 p-[13px_18px] text-[13.5px] font-[550] cursor-pointer text-[#0B0F0E] hover:bg-[#FAFAF8]">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-[15px] h-[15px] text-[#9CA3AF]"><circle cx="9" cy="8" r="3"/><path d="M3.5 20c.6-3 2.8-4.8 5.5-4.8s4.9 1.8 5.5 4.8M18 8v6M15 11h6"/></svg>
              Invite employees
              <span className="ml-auto text-[#9CA3AF] text-[14px]">→</span>
            </button>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
};


export const SuperAdminDashboard = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const API = import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}`;
  const [overview, setOverview] = useState(null);
  const [banks, setBanks] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Skeleton helpers — no demo numbers, pure live
  const SkeletonCard = () => <div className="bg-white border border-[#E5E7EB] rounded-[10px] p-[16px_14px_14px] animate-pulse"><div className="h-3 bg-[#F3F4F6] rounded w-1/2 mb-4" /><div className="h-7 bg-[#F3F4F6] rounded w-1/3 mb-3" /><div className="h-3 bg-[#F3F4F6] rounded w-3/4" /></div>;
  const SkeletonChart = ({h=150}) => <div className="animate-pulse"><div className="h-3 bg-[#F3F4F6] rounded w-1/3 mb-3" /><div style={{height:h}} className="bg-[#F3F4F6] rounded-lg" /></div>;

  useEffect(() => {
    let mounted = true;
    const fetchAll = async () => {
      try {
        const token = await getToken();
        const headers = { Authorization: `Bearer ${token}` };
        const [dashRes, banksRes, auditRes] = await Promise.all([
          fetch(`${API}/api/dashboard/superadmin`, { headers }),
          fetch(`${API}/api/banks`, { headers }),
          fetch(`${API}/api/audit-logs`, { headers }).catch(() => ({ json: async () => ({ success: false, data: [] }) })),
        ]);
        const dashJson = await dashRes.json().catch(() => ({}));
        const banksJson = await banksRes.json().catch(() => ({}));
        const auditJson = await auditRes.json().catch(() => ({}));
        if (!mounted) return;
        if (dashJson.success) setOverview(dashJson.data);
        if (banksJson.success) setBanks(banksJson.data || []);
        if (auditJson.success) setAuditLogs((auditJson.data || []).slice(0, 4));
      } catch (e) {
        console.error('Dashboard fetch error', e);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchAll();
    return () => { mounted = false; };
  }, []);

  // Derived live data — no demo fallback
  const areaData = overview?.savingsGrowth?.map(s => ({ m: s.name, v: s.amount })) || [];
  const barData = overview?.orgGrowth?.map(b => ({ m: b.name, a: b.onboarded })) || [];
  const recentData = overview?.recentOrgs?.map(o => ({
    n: o.name, id: o._id, co: o.companyNumber || '—', fee: o.annualFee ?? '—', st: o.annualFeeStatus ? (o.annualFeeStatus.charAt(0).toUpperCase()+o.annualFeeStatus.slice(1)) : 'Pending', ag: o.agreementStatus ? (o.agreementStatus.charAt(0).toUpperCase()+o.agreementStatus.slice(1)) : 'Pending', d: o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-GB') : '—', suspended: o.isSuspended
  })) || [];
  const auditData = auditLogs.map(l => {
    // clerkUserId is like user_3laxXXXXXXXX — first 8 chars are always "user_3ln" → looked identical. Show last 6 + role hint
    const raw = l.clerkUserId || '';
    const isSystem = !raw || raw === 'System' || raw.startsWith('system');
    const shortId = isSystem ? 'System' : `…${raw.slice(-6)}`;
    const label = isSystem ? 'System' : (l.action?.includes('Super') || l.details?.includes('Super Admin') ? `Superadmin ${shortId}` : shortId);
    return { t: new Date(l.createdAt).toLocaleString('en-GB', {day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit'}), who: label, fullId: raw, act: l.details || l.action, ip: l.ipAddress || '—' };
  });
  const kpis = overview ? [
    { label: 'Active Organisations', value: String(overview.totalOrganisations), sub: `${overview.compliance?.orgSigned ?? 0} signed · ${overview.compliance?.orgPending ?? 0} pending · ${overview.compliance?.suspended ?? 0} suspended`, trend: `+${overview.trends?.thisMonthOrgs ?? 0} this month`, trendType: (overview.trends?.thisMonthOrgs||0)>0?'up':'flat', accent: false },
    { label: 'Active Members', value: String(overview.totalEmployees), sub: `Across ${overview.totalOrganisations||0} orgs · avg balance £${overview.financial?.avgBalance?.toLocaleString() ?? 0}`, trend: `+${overview.trends?.thisWeekEmployees ?? 0} this week`, trendType: (overview.trends?.thisWeekEmployees||0)>0?'up':'flat', accent: false },
    { label: 'Trust Pool (Platform)', value: `£${(overview.totalSavingsPool||0).toLocaleString()}`, sub: 'Cumulative contributions · bank-matched', trend: overview.savingsGrowth?.length ? `£${Math.round(overview.savingsGrowth.slice(-1)[0].amount)} total` : 'No data', trendType: 'up', accent: false },
    { label: 'Platform Revenue', value: `£${(overview.platformRevenue||0).toLocaleString()}`, sub: `${overview.collection?.paid ?? 0} paid · outstanding £${overview.collection?.outstandingAmount?.toLocaleString() ?? 0} · overdue £${overview.collection?.overdueAmount?.toLocaleString() ?? 0}`, trend: `${overview.collection?.rate ?? 0}% collected`, trendType: (overview.collection?.rate||0)>=70?'up':'flat', accent: false },
  ] : [];
  const collection = overview?.collection || { paid:0, pending:0, overdue:0, total:0, rate:0, outstandingAmount:0, overdueAmount:0 };
  const subscription = overview?.subscription || { active:0, pending:0, pastDue:0, total:0, autoPayOn:0 };
  const compliance = overview?.compliance || { orgSigned:0, orgPending:0, orgTotal:0, empSigned:0, empPending:0, empTotal:0, suspended:0 };
  const eligiblePool = overview?.eligiblePool ?? 0;
  const totalAUM = overview ? `£${(overview.totalSavingsPool||0).toLocaleString()}` : '—';

  // SVG helpers — now use live areaData/barData
  const AreaChartSvg = () => {
    const W = 640, H = 140, padL = 0, padR = 8, padT = 8, padB = 18;
    const vals = areaData.map(d => d.v), min = vals.length? Math.min(...vals) * 0.92 : 0, max = vals.length? Math.max(...vals) * 1.02 : 100;
    const X = i => padL + (W - padL - padR) * (areaData.length>1 ? (i / (areaData.length - 1)) : 0.5);
    const Y = v => padT + (H - padT - padB) * (1 - (v - min) / (max - min || 1));
    const pts = areaData.map((d, i) => `${X(i)},${Y(d.v)}`).join(' ');
    const areaPts = `${X(0)},${H - padB} ` + pts + ` ${X(areaData.length - 1)},${H - padB}`;
    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[150px] block">
        {[0.25, 0.5, 0.75].map(t => (
          <line key={t} x1={padL} x2={W - padR} y1={padT + (H - padT - padB) * t} y2={padT + (H - padT - padB) * t} stroke="#EEF0F3" strokeWidth="1" strokeDasharray="3 4" />
        ))}
        <polygon points={areaPts} fill="#EDF3EF" />
        <polyline points={pts} fill="none" stroke="#0E5C3E" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {areaData.map((d, i) => (
          <circle key={i} cx={X(i)} cy={Y(d.v)} r="4" fill="#0E5C3E" stroke="#fff" strokeWidth="1.6" />
        ))}
        {areaData.map((d, i) => (
          <text key={d.m} x={X(i)} y={H - 2} textAnchor="middle" fontSize="11" fill="#9CA3AF">{d.m}</text>
        ))}
      </svg>
    );
  };
  const BarChartSvg = () => {
    const W = 360, H = 160, padL = 8, padR = 8, padT = 24, padB = 22;
    const max = Math.max(4, ...barData.map(d=>d.a));
    const bw = ((W - padL - padR) / barData.length) * 0.52, gap = (W - padL - padR) / barData.length;
    const y = v => padT + (H - padT - padB) * (1 - v / max);
    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[170px] overflow-visible">
        <line x1={padL} x2={W - padR} y1={padT} y2={padT} stroke="#EEF0F3" strokeWidth="1" />
        <line x1={padL} x2={W - padR} y1={padT + (H - padT - padB) / 2} y2={padT + (H - padT - padB) / 2} stroke="#EEF0F3" strokeWidth="1" strokeDasharray="3 4" />
        {barData.map((d, i) => {
          const x = padL + gap * i + gap / 2 - bw / 2;
          const h = (H - padT - padB) * (d.a / max);
          const labelY = d.a > 0 ? Math.max(12, y(d.a) - 6) : y(d.a) - 6;
          return (
            <g key={d.m}>
              <rect x={x} y={y(d.a)} width={bw} height={h} rx="4" fill="#0E5C3E" />
              <text x={padL + gap * i + gap / 2} y={H - 4} textAnchor="middle" fontSize="11" fill="#9CA3AF">{d.m}</text>
              <text x={padL + gap * i + gap / 2} y={labelY} textAnchor="middle" fontSize="11" fontWeight="600" fill="#0B0F0E">{d.a}</text>
            </g>
          );
        })}
      </svg>
    );
  };

  return (
    <SidebarLayout navigation={superAdminNavigation} title="Super Admin Dashboard">
      {/* Page head — same as v2 */}
      <div className="mb-4">
        <h1 className="text-[24px] font-bold tracking-[-0.03em] text-[#0B0F0E] leading-none">Platform Overview</h1>

      </div>

      {/* Alert banner — skeleton while loading, live thereafter */}
      {loading ? (
        <div className="h-[46px] bg-white border border-[#E5E7EB] rounded-lg animate-pulse mb-4" />
      ) : (() => {
        const overdue = overview?.collection?.overdue ?? 0;
        const pendingDraws = overview?.alerts?.pendingDraws ?? 0;
        const excluded = overview?.compliance ? (overview.compliance.orgTotal - overview.compliance.orgSigned) : 0;
        const hasAlert = overdue>0 || pendingDraws>0 || excluded>0;
        if (!hasAlert) return <div className="flex items-center gap-2.5 px-3.5 py-3 rounded-lg border border-[#A7F3D0] bg-[#ECFDF5] text-[13px] mb-4"><span className="text-[11px] font-bold bg-white border border-[#A7F3D0] px-2 py-0.5 rounded-full text-[#065F46]">All clear</span><span className="text-[#0B0F0E]">No overdue fees or pending draws. Platform healthy.</span></div>;
        return (
        <div className="flex items-center gap-2.5 px-3.5 py-3 rounded-lg border border-[#FDE68A] bg-[#FEF3C7] text-[13px] mb-4">
          <span className="text-[11px] font-bold tracking-wide bg-white border border-[#FDE68A] px-2 py-0.5 rounded-full text-[#92400E]">Action needed</span>
          <span className="text-[#0B0F0E]"><b>{overdue} organisations</b> overdue &gt;14 days · <b>{pendingDraws} draw</b> pending approval · <b>{excluded} orgs</b> excluded from next draw until signed.</span>
          <button onClick={() => navigate('/superadmin/organisations')} className="ml-auto text-[#0A3D2A] font-semibold underline underline-offset-2 text-[13px] bg-transparent border-0 cursor-pointer">Review →</button>
        </div>
        );
      })()}

      {/* KPI Strip — wired to live overview, demo fallback */}
      {loading && !overview ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-3.5">
          {[1,2,3,4].map(i => <div key={i} className="bg-white border border-[#E5E7EB] rounded-[10px] p-6 animate-pulse"><div className="h-3 bg-[#F3F4F6] rounded w-1/2 mb-3" /><div className="h-7 bg-[#F3F4F6] rounded w-1/3" /></div>)}
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-3.5">
        {kpis.map(k => (
          <div key={k.label} className={`bg-white border border-[#E5E7EB] rounded-[10px] shadow-[0_1px_2px_rgba(0,0,0,.05)] p-[16px_14px_14px] relative overflow-hidden ${k.accent ? 'before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[2px] before:bg-[#0E5C3E] before:content-[""]' : ''}`}>
            <div className="flex items-start justify-between gap-2 mb-2">
              <span className="text-[11.5px] font-semibold tracking-[0.02em] uppercase text-[#6B7280]">{k.label}</span>
              <span className="w-7 h-7 rounded-[7px] grid place-items-center bg-[#F9FAFB] border border-[#EEF0F3] text-[#9CA3AF] shrink-0">
                {k.label.includes('Organisations') && <Building2 size={16} strokeWidth={1.7} />}
                {k.label.includes('Members') && <Users size={16} strokeWidth={1.7} />}
                {k.label.includes('Trust') && <Landmark size={16} strokeWidth={1.7} />}
                {k.label.includes('Revenue') && <CreditCard size={16} strokeWidth={1.7} />}
              </span>
            </div>
            <p className="text-[28px] font-bold tracking-[-0.04em] leading-none text-[#0B0F0E] font-mono" style={{fontFamily:"'JetBrains Mono',monospace"}}>{k.value}</p>
            <p className="mt-2 text-[12.5px] text-[#6B7280] leading-snug" dangerouslySetInnerHTML={{__html:k.sub}} />
            <div className="mt-2.5"><span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${k.trendType==='up' ? 'bg-[#ECFDF5] border-[#A7F3D0] text-[#065F46]' : 'bg-[#F3F4F6] border-[#E5E7EB] text-[#6B7280]'}`}>{k.trendType==='up' ? '↗ ' : '— '}{k.trend}</span></div>
          </div>
        ))}
      </div>
      )}

      {/* Row 2 — Trust Pool + Collection */}
      <div className="grid grid-cols-12 gap-3.5 mb-3.5">
        <div className="col-span-12 lg:col-span-8 bg-white border border-[#E5E7EB] rounded-[10px] shadow-[0_1px_2px_rgba(0,0,0,.05)] overflow-hidden">
          <div className="flex items-center gap-2.5 px-4 py-3.5 border-b border-[#EEF0F3]">
            <div><h3 className="m-0 text-[13.5px] font-semibold tracking-[-0.015em] text-[#0B0F0E]">Trust Pool — Cumulative Growth</h3><p className="m-0 text-[12px] text-[#6B7280]">Employee contribution pool (succeeded). Last 6 months.</p></div>
            <span className="ml-auto inline-flex text-[11px] font-bold px-2 py-1 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46]">+£3.2k this month</span>
          </div>
          <div className="p-4">
            {loading ? <SkeletonChart h={150} /> : areaData.length===0 ? <div className="py-12 text-center text-[13px] text-[#6B7280]">No contribution data yet — chart will appear after first payroll.</div> : (
              <>
                <div className="flex items-center gap-2.5 mb-3 text-[12px] text-[#6B7280]"><i className="w-2.5 h-2.5 rounded-sm bg-[#0E5C3E] inline-block" /> Cumulative pool <span className="ml-2 font-semibold text-[#0B0F0E]">{totalAUM}</span><span className="text-[#6B7280]">total AUM</span></div>
                <AreaChartSvg />
              </>
            )}
          </div>
        </div>
        <div className="col-span-12 lg:col-span-4 bg-white border border-[#E5E7EB] rounded-[10px] shadow-[0_1px_2px_rgba(0,0,0,.05)] overflow-hidden">
          <div className="px-4 py-3.5 border-b border-[#EEF0F3]"><h3 className="m-0 text-[13.5px] font-semibold tracking-[-0.015em]">Collection Health</h3><p className="m-0 text-[12px] text-[#6B7280]">Annual fee status across {collection.total || '—'} orgs</p></div>
          <div className="p-4 flex gap-4 items-center">
            <div className="relative w-[116px] h-[116px] shrink-0">
              {(() => {
                const total = collection.total || 13;
                const pPaid = total? Math.round((collection.paid/total)*100):0;
                const pPend = total? Math.round((collection.pending/total)*100):0;
                const pOver = total? Math.round((collection.overdue/total)*100):0;
                return (
                <>
                <svg viewBox="0 0 42 42" className="w-[116px] h-[116px] -rotate-90">
                  <circle cx="21" cy="21" r="15.9" fill="none" stroke="#E5E7EB" strokeWidth="6" />
                  <circle cx="21" cy="21" r="15.9" fill="none" stroke="#0E5C3E" strokeWidth="6" strokeDasharray={`${pPaid} ${100-pPaid}`} strokeLinecap="round" />
                  <circle cx="21" cy="21" r="15.9" fill="none" stroke="#F59E0B" strokeWidth="6" strokeDasharray={`${pPend} ${100-pPend}`} strokeDashoffset={`-${pPaid}`} strokeLinecap="round" opacity=".95" />
                  <circle cx="21" cy="21" r="15.9" fill="none" stroke="#DC2626" strokeWidth="6" strokeDasharray={`${pOver} ${100-pOver}`} strokeDashoffset={`-${pPaid+pPend}`} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 grid place-items-center text-[14px] font-extrabold tracking-tight">{collection.rate}%</div>
                </>
                );
              })()}
            </div>
            <div className="flex-1">
              <div className="text-[22px] font-bold tracking-tight">{collection.rate}%<span className="text-[12px] font-semibold text-[#6B7280] ml-1.5">collected</span></div>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="inline-flex items-center text-[12px] font-semibold px-2.5 py-1 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46]">Paid {collection.paid}</span>
                <span className="inline-flex items-center text-[12px] font-semibold px-2.5 py-1 rounded-full bg-[#FEF3C7] border border-[#FDE68A] text-[#92400E]">Pending {collection.pending}</span>
                <span className="inline-flex items-center text-[12px] font-semibold px-2.5 py-1 rounded-full bg-[#FEF2F2] border border-[#FECDD3] text-[#9F1239]">Overdue {collection.overdue}</span>
              </div>
              <div className="mt-2.5 text-[12.5px] text-[#6B7280]">Outstanding <b className="text-[#0B0F0E] font-mono">£{(collection.outstandingAmount||0).toLocaleString()}</b> · Overdue <b className="text-[#9F1239] font-mono">£{(collection.overdueAmount||0).toLocaleString()}</b></div>
              <div className="mt-2 h-1.5 bg-[#EEF0F3] rounded-full overflow-hidden flex"><div style={{flex:collection.paid}} className="bg-[#0E5C3E]" /><div style={{flex:collection.pending}} className="bg-[#F59E0B]" /><div style={{flex:collection.overdue}} className="bg-[#DC2626]" /></div>
            </div>
          </div>
          <div className="border-t border-[#EEF0F3] p-4">
            <div className="flex justify-between items-center mb-2"><h4 className="m-0 text-[12.5px] font-semibold">Member Subscription Health</h4><span className="text-[12px] text-[#6B7280]">{subscription.total} members</span></div>
            <div className="h-2 bg-[#EEF0F3] rounded-full overflow-hidden flex"><div style={{flex:subscription.active||1}} className="bg-[#0E5C3E]" /><div style={{flex:subscription.pending||1}} className="bg-[#F59E0B]" /><div style={{flex:subscription.pastDue||1}} className="bg-[#DC2626]" /></div>
            <div className="flex gap-2 mt-2 flex-wrap items-center">
              <span className="text-[11.5px] font-semibold px-2 py-1 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46]">Active {subscription.active}</span>
              <span className="text-[11.5px] font-semibold px-2 py-1 rounded-full bg-[#FEF3C7] border border-[#FDE68A] text-[#92400E]">Pending {subscription.pending}</span>
              <span className="text-[11.5px] font-semibold px-2 py-1 rounded-full bg-[#FEF2F2] border border-[#FECDD3] text-[#9F1239]">Past due {subscription.pastDue}</span>
              <span className="ml-auto text-[12px] text-[#6B7280]">AutoPay <b className="text-[#0B0F0E]">{subscription.total? Math.round((subscription.autoPayOn/subscription.total)*100):0}%</b></span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3 */}
      <div className="grid grid-cols-12 gap-3.5 mb-3.5">
        <div className="col-span-12 lg:col-span-6 bg-white border border-[#E5E7EB] rounded-[10px] shadow-[0_1px_2px_rgba(0,0,0,.05)] overflow-hidden">
          <div className="px-4 py-3.5 border-b border-[#EEF0F3]"><h3 className="m-0 text-[13.5px] font-semibold">Organisation Onboarding</h3><p className="m-0 text-[12px] text-[#6B7280]">New orgs by month</p></div>
          <div className="p-4">{loading ? <SkeletonChart h={160} /> : barData.length===0 ? <div className="py-12 text-center text-[13px] text-[#6B7280]">No onboarding data yet.</div> : (<><BarChartSvg /><div className="flex gap-2.5 justify-center mt-1.5 text-[11.5px] text-[#6B7280]"><span className="inline-flex items-center gap-1.5"><i className="w-2 h-2 bg-[#0E5C3E] rounded-sm inline-block" />Onboarded</span></div></>)}</div>
        </div>
        <div className="col-span-12 lg:col-span-6 bg-white border border-[#E5E7EB] rounded-[10px] shadow-[0_1px_2px_rgba(0,0,0,.05)] overflow-hidden">
          <div className="px-4 py-3.5 border-b border-[#EEF0F3]"><h3 className="m-0 text-[13.5px] font-semibold">Agreement Compliance</h3><p className="m-0 text-[12px] text-[#6B7280]">Signed vs pending — eligibility gate</p></div>
          <div className="p-4">
            <div className="grid grid-cols-2 gap-3.5">
              <div><div className="text-[12px] font-semibold text-[#6B7280]">Organisations</div><div className="flex items-baseline gap-2 mt-1.5"><span className="text-[24px] font-bold tracking-tight">{compliance.orgSigned} / {compliance.orgTotal}</span><span className="text-[12px] text-[#6B7280]">signed</span><span className="ml-auto text-[11px] font-bold px-2 py-1 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46]">{compliance.orgTotal? Math.round(compliance.orgSigned/compliance.orgTotal*100):0}%</span></div><div className="h-2 bg-[#EEF0F3] rounded-full overflow-hidden mt-2 flex"><div style={{flex:compliance.orgSigned||1}} className="bg-[#0E5C3E]" /><div style={{flex:(compliance.orgTotal-compliance.orgSigned)||1}} className="bg-[#E5E7EB]" /></div><div className="text-[12px] text-[#6B7280] mt-1.5">{compliance.orgTotal-compliance.orgSigned} pending — excluded from next draw</div></div>
              <div><div className="text-[12px] font-semibold text-[#6B7280]">Members</div><div className="flex items-baseline gap-2 mt-1.5"><span className="text-[24px] font-bold tracking-tight">{compliance.empSigned} / {compliance.empTotal}</span><span className="text-[12px] text-[#6B7280]">signed</span><span className="ml-auto text-[11px] font-bold px-2 py-1 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46]">{compliance.empTotal? Math.round(compliance.empSigned/compliance.empTotal*100):0}%</span></div><div className="h-2 bg-[#EEF0F3] rounded-full overflow-hidden mt-2 flex"><div style={{flex:compliance.empSigned||1}} className="bg-[#0E5C3E]" /><div style={{flex:(compliance.empTotal-compliance.empSigned)||1}} className="bg-[#E5E7EB]" /></div><div className="text-[12px] text-[#6B7280] mt-1.5">If {compliance.orgTotal-compliance.orgSigned} orgs sign → pool <b className="text-[#0B0F0E]">+{eligiblePool}</b> eligible</div></div>
            </div>
            <div className="h-px bg-[#EEF0F3] my-3.5" />
            <div className="flex gap-2 flex-wrap items-center">
              <span className="inline-flex items-center gap-1 text-[11.5px] font-semibold px-2 py-1 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46]">Eligible: {eligiblePool}</span>
              <span className="inline-flex items-center gap-1 text-[11.5px] font-semibold px-2 py-1 rounded-full bg-[#FEF3C7] border border-[#FDE68A] text-[#92400E]">Excluded: {compliance.orgTotal - compliance.orgSigned} orgs</span>
              <span className="inline-flex items-center gap-1 text-[11.5px] font-semibold px-2 py-1 rounded-full bg-[#F3F4F6] border border-[#E5E7EB] text-[#6B7280]">Suspended: {compliance.suspended}</span>
              <button onClick={() => navigate('/superadmin/organisations')} className="ml-auto text-[12.5px] font-semibold text-[#0E5C3E] bg-transparent border-0 cursor-pointer">Review queue →</button>
            </div>
          </div>
        </div>
      </div>

      {/* Row 4 — Recent + Quick */}
      <div className="grid grid-cols-12 gap-3.5 mb-3.5">
        <div className="col-span-12 lg:col-span-8 bg-white border border-[#E5E7EB] rounded-[10px] shadow-[0_1px_2px_rgba(0,0,0,.05)] overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#EEF0F3]"><h3 className="m-0 text-[13.5px] font-semibold">Recent Organisations</h3><p className="m-0 text-[12px] text-[#6B7280]">Latest onboardings</p><Link to="/superadmin/organisations" className="ml-auto text-[13px] font-semibold text-[#0E5C3E] hover:underline">View all →</Link></div>
          <div className="overflow-auto">
            <table className="w-full border-collapse text-[13px]">
              <thead><tr className="bg-[#F9FAFB]"><th className="text-left px-3.5 py-2.5 text-[10.5px] font-bold tracking-widest uppercase text-[#9CA3AF] border-b border-[#EEF0F3]">Organisation</th><th className="text-left px-3.5 py-2.5 text-[10.5px] font-bold tracking-widest uppercase text-[#9CA3AF] border-b border-[#EEF0F3]">Company No.</th><th className="text-left px-3.5 py-2.5 text-[10.5px] font-bold tracking-widest uppercase text-[#9CA3AF] border-b border-[#EEF0F3]">Annual fee</th><th className="text-left px-3.5 py-2.5 text-[10.5px] font-bold tracking-widest uppercase text-[#9CA3AF] border-b border-[#EEF0F3]">Status</th><th className="text-left px-3.5 py-2.5 text-[10.5px] font-bold tracking-widest uppercase text-[#9CA3AF] border-b border-[#EEF0F3]">Agreement</th><th className="text-left px-3.5 py-2.5 text-[10.5px] font-bold tracking-widest uppercase text-[#9CA3AF] border-b border-[#EEF0F3]">Joined</th></tr></thead>
              <tbody>
                {loading ? (
                  [1,2,3].map(i => <tr key={i} className="animate-pulse"><td colSpan="6" className="px-3.5 py-4"><div className="h-3 bg-[#F3F4F6] rounded w-full" /></td></tr>)
                ) : recentData.length===0 ? (
                  <tr><td colSpan="6" className="px-3.5 py-8 text-center text-[13px] text-[#6B7280]">No organisations onboarded yet.</td></tr>
                ) : recentData.map(r => (
                  <tr key={r.n+r.id} className="hover:bg-[#F9FAFB] border-b border-[#EEF0F3] last:border-0 cursor-pointer" onClick={() => r.id && navigate(`/superadmin/organisations/${r.id}`)}>
                    <td className="px-3.5 py-3"><div className="font-semibold tracking-tight text-[#0B0F0E]">{r.n} {r.suspended && <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded bg-[#F3F4F6] border border-[#E5E7EB] text-[#6B7280]">Suspended</span>}</div><div className="text-[12px] text-[#6B7280]">No: {r.co}</div></td>
                    <td className="px-3.5 py-3 font-mono text-[#6B7280]">{r.co}</td>
                    <td className="px-3.5 py-3 font-mono font-bold text-[#0B0F0E]">£{r.fee}</td>
                    <td className="px-3.5 py-3"><span className={`inline-flex items-center gap-1 text-[11.5px] font-semibold px-2 py-1 rounded-full border ${r.st==='Paid' ? 'bg-[#ECFDF5] border-[#A7F3D0] text-[#065F46]' : r.st==='Overdue' ? 'bg-[#FEF2F2] border-[#FECDD3] text-[#9F1239]' : 'bg-[#FEF3C7] border-[#FDE68A] text-[#92400E]'}`}>{r.st}</span></td>
                    <td className="px-3.5 py-3"><span className={`inline-flex items-center gap-1 text-[11.5px] font-semibold px-2 py-1 rounded-full border ${r.ag==='Signed' ? 'bg-[#ECFDF5] border-[#A7F3D0] text-[#065F46]' : 'bg-[#FEF3C7] border-[#FDE68A] text-[#92400E]'}`}>{r.ag}</span></td>
                    <td className="px-3.5 py-3 text-[#2B3330]">{r.d}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="col-span-12 lg:col-span-4">
          <div className="bg-white border border-[#E5E7EB] rounded-[10px] shadow-[0_1px_2px_rgba(0,0,0,.05)] overflow-hidden">
            <div className="px-4 py-3.5 border-b border-[#EEF0F3]"><h3 className="m-0 text-[13.5px] font-semibold">Quick Actions</h3></div>
            <div className="grid gap-2.5 p-3.5">
              <button onClick={() => navigate('/superadmin/organisations?onboard=true')} className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-lg bg-[#0E5C3E] text-white font-semibold text-[13.5px] border border-[#0E5C3E] hover:bg-[#0A3D2A] transition"><Plus size={16} strokeWidth={2} />Onboard Organisation</button>
              <button onClick={() => navigate('/superadmin/awards')} className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-lg bg-white text-[#0B0F0E] font-semibold text-[13.5px] border border-[#D1D5DB] hover:bg-[#F9FAFB] transition">Run Awards Draw</button>
              <button onClick={() => navigate('/superadmin/reports')} className="inline-flex items-center justify-center px-3.5 py-2 rounded-lg bg-transparent text-[#2B3330] font-medium text-[13.5px] border-0 hover:underline">Export audit report ↓</button>
            </div>

          </div>
        </div>
      </div>

      {/* Row 5 — Treasury + Audit */}
      <div className="grid grid-cols-12 gap-3.5">
        <div className="col-span-12 lg:col-span-4 bg-white border border-[#E5E7EB] rounded-[10px] shadow-[0_1px_2px_rgba(0,0,0,.05)] overflow-hidden">
          <div className="px-4 py-3.5 border-b border-[#EEF0F3]"><h3 className="m-0 text-[13.5px] font-semibold">Treasury</h3><p className="m-0 text-[12px] text-[#6B7280]">Superadmin-only bank pools</p></div>
          <div className="grid grid-cols-2">
            {loading ? (
              <div className="col-span-2 p-6 animate-pulse"><div className="h-4 bg-[#F3F4F6] rounded w-1/3 mb-3" /><div className="h-6 bg-[#F3F4F6] rounded w-1/2" /></div>
            ) : banks.length ? banks.map(b => (
              <div key={b._id || b.accountType} className="p-3.5 border-r last:border-0 border-[#EEF0F3]"><div className="text-[11px] font-semibold tracking-wide uppercase text-[#6B7280]">{b.accountType==='hajj_trust_pool'?'Awards Reserve':'HS Collections — GBP'}</div><div className="font-semibold mt-1">{b.bankName} · {b.isActive?'Primary':'—'}</div><div className="text-[12.5px] text-[#6B7280] mt-1.5 font-mono">•••• {b.last4}</div><div className="text-[18px] font-bold tracking-tight mt-2 font-mono">£{(b.balance ?? 0).toLocaleString(undefined,{minimumFractionDigits:2, maximumFractionDigits:2})}</div><div className="mt-1.5"><span className={`inline-flex items-center text-[11.5px] font-semibold px-2.5 py-1 rounded-full border ${b.isActive?'bg-[#ECFDF5] border-[#A7F3D0] text-[#065F46]':'bg-[#F3F4F6] border-[#E5E7EB] text-[#6B7280]'}`}>{b.isActive?'Connected':'Inactive'}</span></div></div>
            )) : (
              <div className="col-span-2 p-6 text-center text-[13px] text-[#6B7280]">No bank accounts configured yet.</div>
            )}
          </div>
        </div>
        <div className="col-span-12 lg:col-span-8 bg-white border border-[#E5E7EB] rounded-[10px] shadow-[0_1px_2px_rgba(0,0,0,.05)] overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#EEF0F3]"><h3 className="m-0 text-[13.5px] font-semibold">Live Audit Trail</h3><p className="m-0 text-[12px] text-[#6B7280]">Immutable log — last 4 events</p><Link to="/superadmin/reports" className="ml-auto text-[13px] font-semibold text-[#0E5C3E] hover:underline">View all →</Link></div>
          <div className="overflow-auto">
            <table className="w-full border-collapse text-[13px]">
              <thead><tr className="bg-[#F9FAFB]"><th className="text-left px-3.5 py-2.5 text-[10.5px] font-bold tracking-widest uppercase text-[#9CA3AF] border-b border-[#EEF0F3]">When</th><th className="text-left px-3.5 py-2.5 text-[10.5px] font-bold tracking-widest uppercase text-[#9CA3AF] border-b border-[#EEF0F3]">Actor</th><th className="text-left px-3.5 py-2.5 text-[10.5px] font-bold tracking-widest uppercase text-[#9CA3AF] border-b border-[#EEF0F3]">Event</th><th className="text-left px-3.5 py-2.5 text-[10.5px] font-bold tracking-widest uppercase text-[#9CA3AF] border-b border-[#EEF0F3]">IP</th></tr></thead>
              <tbody>
                {loading ? (
                  [1,2,3].map(i => <tr key={i} className="animate-pulse"><td colSpan="4" className="px-3.5 py-4"><div className="h-3 bg-[#F3F4F6] rounded w-full" /></td></tr>)
                ) : auditData.length===0 ? (
                  <tr><td colSpan="4" className="px-3.5 py-8 text-center text-[13px] text-[#6B7280]">No audit events yet.</td></tr>
                ) : auditData.map(a => (
                  <tr key={a.act+a.t} className="hover:bg-[#F9FAFB] border-b border-[#EEF0F3] last:border-0">
                    <td className="px-3.5 py-3 text-[#6B7280]">{a.t}</td>
                    <td className="px-3.5 py-3"><span className="inline-flex text-[11.5px] font-semibold px-2 py-1 rounded-full bg-[#F3F4F6] border border-[#E5E7EB] text-[#6B7280] max-w-[90px] truncate">{a.who}</span></td>
                    <td className="px-3.5 py-3 font-medium text-[#0B0F0E] max-w-[280px] truncate" title={a.act}>{a.act}</td>
                    <td className="px-3.5 py-3 font-mono text-[#6B7280]">{a.ip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
