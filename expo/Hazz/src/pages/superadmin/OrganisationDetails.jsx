import { useAuth } from '@clerk/react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SidebarLayout from '../../layouts/SidebarLayout';
import HorizontalTabs from '../../components/HorizontalTabs';
import SearchFilterBar from '../../components/SearchFilterBar';
import EmployeeProfileSidecar from '../../components/EmployeeProfileSidecar';
import { superAdminNavigation } from '../../config/navigation';

export const OrganisationDetails = () => {
  const { getToken } = useAuth(); // OrganisationDetails
  const { id } = useParams();
  const navigate = useNavigate();
  const [org, setOrg] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Billing State
  const [transactions, setTransactions] = useState(null);
  const [isLoadingBilling, setIsLoadingBilling] = useState(false);
  const [totalEmployeeFunds, setTotalEmployeeFunds] = useState(0);
  const [billingSearch, setBillingSearch] = useState('');

  // Awards State
  const [orgDraws, setOrgDraws] = useState(null);
  const [isLoadingAwards, setIsLoadingAwards] = useState(false);

  // Employees State
  const [employees, setEmployees] = useState(null);
  const [allDbEmployees, setAllDbEmployees] = useState([]);
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [employeeTab, setEmployeeTab] = useState('active');
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [activeMember, setActiveMember] = useState(null);

  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // Custom Confirm Modal State
  const [isConfirmingSuspend, setIsConfirmingSuspend] = useState(false);
  const [isConfirmingArchive, setIsConfirmingArchive] = useState(false);


  useEffect(() => {
    if (activeTab === 'billing' && transactions === null && org) {
      const fetchBilling = async () => {
        setIsLoadingBilling(true);
        try {
          const res = await fetch(`http://localhost:5000/api/financials/org-transactions/${org.clerkOrganizationId}`, {
            headers: { Authorization: `Bearer ${await getToken()}` }
          });
          if (res.ok) {
            const data = await res.json();
            const txs = data.data || [];
            setTransactions(txs);
            
            // Calculate total funds
            const total = txs
              .filter(t => t.type === 'employee_contribution' && t.status === 'succeeded')
              .reduce((sum, t) => sum + t.amount, 0);
            setTotalEmployeeFunds(total);
          }
        } catch (error) {
          console.error(error);
        } finally {
          setIsLoadingBilling(false);
        }
      };
      fetchBilling();
    }
  }, [activeTab, org, transactions, getToken]);

  useEffect(() => {
    if (activeTab === 'awards' && orgDraws === null && org) {
      const fetchAwards = async () => {
        setIsLoadingAwards(true);
        try {
          const res = await fetch('http://localhost:5000/api/awards', {
            headers: { Authorization: `Bearer ${await getToken()}` }
          });
          if (res.ok) {
            const data = await res.json();
            const allDraws = data.data || [];
            // Filter draws that have at least one winner from this org
            const filtered = allDraws
              .filter(draw => draw.winners?.some(w => w.organisationId?._id === org._id))
              .map(draw => ({
                ...draw,
                orgWinners: draw.winners.filter(w => w.organisationId?._id === org._id)
              }));
            setOrgDraws(filtered);
          }
        } catch (error) {
          console.error(error);
        } finally {
          setIsLoadingAwards(false);
        }
      };
      fetchAwards();
    }
  }, [activeTab, org, orgDraws, getToken]);

  useEffect(() => {
    const fetchOrg = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/organisations/${id}`, { headers: { Authorization: `Bearer ${await getToken()}` } });
        if (!res.ok) throw new Error('Not found');
        const data = await res.json();
        setOrg(data);
        setEditFormData({
          name: data.name,
          companyNumber: data.companyNumber,
          registeredAddress: data.registeredAddress,
          annualFee: data.annualFee
        });
      } catch (error) {
        console.error(error);
        navigate('/superadmin/organisations');
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrg();
  }, [id, navigate]);

  useEffect(() => {
    if (activeTab === 'employees' && employees === null) {
      const fetchEmployees = async () => {
        setIsLoadingEmployees(true);
        try {
          const token = await getToken();
          const res = await fetch(`http://localhost:5000/api/organisations/${id}/employees`, { headers: { Authorization: `Bearer ${token}` } });
          if (!res.ok) throw new Error('Failed to fetch active employees');
          const data = await res.json();
          let activeEmployees = Array.isArray(data) ? data : [];
          
          if (org?.clerkOrganizationId) {
             const dbRes = await fetch(`http://localhost:5000/api/organisations/clerk/${org.clerkOrganizationId}/employee-agreements`, { headers: { Authorization: `Bearer ${token}` } });
             if (dbRes.ok) {
                 const dbData = await dbRes.json();
                 const allDb = dbData.data || [];
                 setAllDbEmployees(allDb);
                 const removedDb = allDb.filter(emp => emp.isRemoved);
                 const removedMocks = removedDb.map(emp => ({
                    id: 'removed_' + emp._id,
                    role: 'org:member',
                    isRemoved: true,
                    createdAt: emp.createdAt,
                    publicUserData: {
                       firstName: emp.firstName || '',
                       lastName: emp.lastName || '',
                       identifier: emp.email || '',
                       hasImage: false
                    }
                 }));
                 activeEmployees = [...activeEmployees, ...removedMocks];
             }
          }
          setEmployees(activeEmployees);
        } catch (error) {
          console.error(error);
        } finally {
          setIsLoadingEmployees(false);
        }
      };
      fetchEmployees();
    }
  }, [activeTab, id, employees]);

  const confirmArchive = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/organisations/${id}/archive`, { headers: { Authorization: `Bearer ${await getToken()}` },
        method: 'PATCH'
      });
      if (res.ok) {
        navigate('/superadmin/organisations');
      }
    } catch (error) {
      console.error('Failed to archive', error);
    } finally {
      setIsConfirmingArchive(false);
    }
  };

  const handleToggleSuspension = () => {
    setIsConfirmingSuspend(true);
  };

  const confirmToggleSuspension = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/organisations/${id}/suspend`, { headers: { Authorization: `Bearer ${await getToken()}` },
        method: 'PATCH'
      });
      if (res.ok) {
        const updatedOrg = await res.json();
        setOrg(updatedOrg);
      }
    } catch (error) {
      console.error('Failed to toggle suspension', error);
    } finally {
      setIsConfirmingSuspend(false);
    }
  };

  const handleSaveEdit = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`http://localhost:5000/api/organisations/${id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${await getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData)
      });
      if (res.ok) {
        const updatedOrg = await res.json();
        setOrg(updatedOrg);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Failed to edit organisation', error);
    } finally {
      setIsSaving(false);
    }
  };

  const renderBadge = (status) => {
    const colors = {
      pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      signed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      overdue: 'bg-red-50 text-red-700 border-red-200'
    };
    const activeColor = colors[status] || 'bg-slate-50 text-slate-700 border-slate-200';
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border capitalize ${activeColor}`}>
        {status}
      </span>
    );
  };

  if (isLoading) {
    return (
      <SidebarLayout navigation={superAdminNavigation} title="Loading Organisation...">
        <div className="flex items-center justify-center h-64">
          <p className="text-slate-500">Fetching details...</p>
        </div>
      </SidebarLayout>
    );
  }

  if (!org) return null;

  const tabs = [
    { id: 'overview', name: 'Overview' },
    { id: 'employees', name: 'Employees' },
    { id: 'billing', name: 'Billing & Payments' },
    { id: 'awards', name: 'Awards History' },
    { id: 'settings', name: 'Settings' }
  ];


  const employeeProfile = activeMember ? allDbEmployees.find(e => e.clerkUserId === (activeMember.publicUserData?.userId || activeMember.clerkUserId)) : null;

  return (
    <SidebarLayout navigation={superAdminNavigation} title="Organisation Details">
      
      {/* Back Button */}
      <button 
        onClick={() => navigate('/superadmin/organisations')}
        className="mb-6 flex items-center text-sm font-medium text-slate-500 hover:text-emerald-700 transition"
      >
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Organisations
      </button>

      {/* Header Profile Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6 relative">
        {org.isSuspended && (
          <div className="absolute top-0 inset-x-0 h-1 bg-red-500"></div>
        )}
        <div className="px-6 py-6 sm:px-8 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-slate-900">{org.name}</h2>
              {org.isSuspended && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold border bg-red-50 text-red-700 border-red-200 uppercase tracking-wide">
                  Suspended
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500 mt-1">Company No: {org.companyNumber} • Joined {new Date(org.createdAt).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-50/50 px-6 sm:px-8">
          <HorizontalTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
      </div>

      {/* Tab Content: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Financials & Legal Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
              <h3 className="font-bold text-slate-800">Financial & Legal Status</h3>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Agreed Annual Fee</p>
                  <p className="text-lg font-bold text-slate-900">£{org.annualFee.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Fee Status</p>
                  {renderBadge(org.annualFeeStatus)}
                </div>
              </div>
              
              <div className="border-t border-slate-100 pt-6 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Agreement Status</p>
                  {renderBadge(org.agreementStatus)}
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-2">Signed Document</p>
                  {org.agreementUrl ? (
                    <a 
                      href={org.agreementUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-1.5 border border-slate-300 rounded text-sm font-medium text-emerald-700 bg-white hover:bg-slate-50 transition"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      View PDF
                    </a>
                  ) : (
                    <p className="text-sm text-slate-500 italic">No document available.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Contact & Location Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
              <h3 className="font-bold text-slate-800">Organisation Details</h3>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <p className="text-xs text-slate-500 mb-1">Organisation ID</p>
                <p className="text-sm font-mono text-slate-700 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 break-all">{org._id}</p>
              </div>
              <div className="border-t border-slate-100 pt-6">
                <p className="text-xs text-slate-500 mb-1">Registered Address</p>
                <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">{org.registeredAddress}</p>
              </div>
            </div>
          </div>
          
        </div>
      )}

      {/* Tab Content: EMPLOYEES */}
      {activeTab === 'employees' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-800">Organisation Members</h3>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="flex-1 w-full">
                <SearchFilterBar searchTerm={employeeSearch} setSearchTerm={setEmployeeSearch} placeholder="Search employees..." />
              </div>
              <div className="flex bg-slate-200/50 p-1 rounded-lg shrink-0" style={{ marginBottom: '24px' }}>
                <button className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${employeeTab === 'active' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`} onClick={() => setEmployeeTab('active')}>Active</button>
                <button className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${employeeTab === 'removed' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`} onClick={() => setEmployeeTab('removed')}>Removed</button>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-sm text-slate-500 bg-white">
                  <th className="px-6 py-4 font-medium">Name</th>
                  <th className="px-6 py-4 font-medium">Email</th>
                  <th className="px-6 py-4 font-medium">System Role</th>
                  <th className="px-6 py-4 font-medium">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoadingEmployees ? (
                  <tr><td colSpan="4" className="text-center py-8 text-slate-500">Loading employees...</td></tr>
                ) : (employees || []).filter(e => (employeeTab === 'active' ? !e.isRemoved : e.isRemoved)).filter(e => !employeeSearch || (e.publicUserData?.firstName || '').toLowerCase().includes(employeeSearch.toLowerCase()) || (e.publicUserData?.lastName || '').toLowerCase().includes(employeeSearch.toLowerCase()) || (e.publicUserData?.identifier || '').toLowerCase().includes(employeeSearch.toLowerCase())).length === 0 ? (
                  <tr><td col colSpan="4" className="text-center py-8 text-slate-500">No {employeeTab} employees found.</td></tr>
                ) : (
                  (employees || []).filter(e => (employeeTab === 'active' ? !e.isRemoved : e.isRemoved)).filter(e => !employeeSearch || (e.publicUserData?.firstName || '').toLowerCase().includes(employeeSearch.toLowerCase()) || (e.publicUserData?.lastName || '').toLowerCase().includes(employeeSearch.toLowerCase()) || (e.publicUserData?.identifier || '').toLowerCase().includes(employeeSearch.toLowerCase())).map((member) => (
                    <tr key={member.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => { setActiveMember(member); setSelectedMember(member); }}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {member.publicUserData.hasImage ? (
                            <img src={member.publicUserData.imageUrl} alt="" className="w-8 h-8 rounded-full border border-slate-200 object-cover" />
                          ) : (
                            <div className="w-8 h-8 shrink-0 rounded-full grid place-items-center text-white font-bold text-xs bg-gradient-to-br from-emerald-600 to-emerald-800 shadow-sm border border-emerald-700/50">
                              {(member.publicUserData.firstName || member.publicMetadata?.firstName)?.[0] || ''}{(member.publicUserData.lastName || member.publicMetadata?.lastName)?.[0] || ''}
                              {!member.publicUserData.firstName && !member.publicUserData.lastName && !member.publicMetadata?.firstName && !member.publicMetadata?.lastName && (member.publicUserData.identifier?.[0]?.toUpperCase() || 'U')}
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-slate-900 flex items-center gap-2">
                              {member.publicUserData.firstName || member.publicUserData.lastName || member.publicMetadata?.firstName || member.publicMetadata?.lastName ? `${member.publicUserData.firstName || member.publicMetadata?.firstName || ''} ${member.publicUserData.lastName || member.publicMetadata?.lastName || ''}`.trim() : (
  <span className="italic text-slate-500 font-normal">
    {member.publicUserData.identifier?.split('@')[0] || 'Awaiting setup'}
  </span>
)}
                              {member.isRemoved && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider bg-slate-100 text-slate-500 border border-slate-200">Removed</span>}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {member.publicUserData.identifier}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${member.role === 'org:admin' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-slate-50 text-slate-700 border-slate-200'}`}>
                          {member.role === 'org:admin' ? 'Administrator' : 'Employee'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {new Date(member.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Content: BILLING & PAYMENTS */}
      {activeTab === 'billing' && (
        <div className="space-y-6">
          {/* Subscription Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
              <h3 className="font-bold text-slate-800">Subscription Overview</h3>
            </div>
            <div className="p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-extrabold text-slate-900">£{(org?.annualFee || 0).toLocaleString()}</span>
                  <span className="text-sm text-slate-500 font-medium">/ year</span>
                </div>
                {org?.annualFeeStatus === 'paid' ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active & Paid
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Pending Payment
                  </span>
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                  <span className="text-sm font-medium text-slate-600">Total Employee Funds Routed</span>
                </div>
                <span className="text-sm font-bold text-emerald-600">£{totalEmployeeFunds.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Unified Transaction Ledger */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
              <h3 className="font-bold text-slate-800">Transaction Ledger</h3>
            </div>
            <div className="p-6 pb-0">
              <SearchFilterBar searchTerm={billingSearch} setSearchTerm={setBillingSearch} placeholder="Search by payer name or email..." />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 bg-white">
                    <th className="px-6 py-4 font-medium">Date</th>
                    <th className="px-6 py-4 font-medium">Payer</th>
                    <th className="px-6 py-4 font-medium">Type</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoadingBilling ? (
                    <tr><td colSpan="5" className="text-center py-8 text-slate-500">Loading ledger...</td></tr>
                  ) : (transactions || []).filter(tx => {
                    if (!billingSearch.trim()) return true;
                    const q = billingSearch.toLowerCase();
                    if (tx.type === 'employer_fee') return (org?.name || '').toLowerCase().includes(q);
                    const name = `${tx.payerId?.firstName || ''} ${tx.payerId?.lastName || ''}`.toLowerCase();
                    const email = (tx.payerId?.email || '').toLowerCase();
                    return name.includes(q) || email.includes(q);
                  }).length === 0 ? (
                    <tr><td colSpan="5" className="text-center py-8 text-slate-500">{billingSearch.trim() ? 'No matching transactions.' : 'No transactions recorded yet.'}</td></tr>
                  ) : (
                    (transactions || []).filter(tx => {
                      if (!billingSearch.trim()) return true;
                      const q = billingSearch.toLowerCase();
                      if (tx.type === 'employer_fee') return (org?.name || '').toLowerCase().includes(q);
                      const name = `${tx.payerId?.firstName || ''} ${tx.payerId?.lastName || ''}`.toLowerCase();
                      const email = (tx.payerId?.email || '').toLowerCase();
                      return name.includes(q) || email.includes(q);
                    }).map((tx) => (
                      <tr key={tx._id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                          {new Date(tx.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-6 py-4">
                          {tx.type === 'employer_fee' ? (
                            <span className="font-bold text-slate-800">{org?.name} (Employer)</span>
                          ) : (
                            <div className="flex flex-col">
                              <span className="font-medium text-slate-900">{tx.payerId?.firstName} {tx.payerId?.lastName}</span>
                              <span className="text-xs text-slate-500">{tx.payerId?.email}</span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {tx.type === 'employer_fee' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase tracking-wide">Platform Fee</span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200 uppercase tracking-wide">Employee Savings</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {tx.status === 'succeeded' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Paid
                            </span>
                          ) : tx.status === 'pending' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Pending
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Failed
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-slate-900">
                          £{tx.amount.toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: AWARDS HISTORY */}
      {activeTab === 'awards' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
            <h3 className="font-bold text-slate-800">Hajj Award Draws</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 bg-white">
                  <th className="px-6 py-4 font-medium">Draw Name</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Draw Status</th>
                  <th className="px-6 py-4 font-medium">Winners from this Org</th>
                  <th className="px-6 py-4 font-medium">Claim Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoadingAwards ? (
                  <tr><td colSpan="5" className="text-center py-8 text-slate-500">Loading awards history...</td></tr>
                ) : (orgDraws || []).length === 0 ? (
                  <tr><td colSpan="5" className="text-center py-8 text-slate-500">No award draws have included employees from this organisation yet.</td></tr>
                ) : (
                  (orgDraws || []).map((draw) => (
                    <tr key={draw._id} className="hover:bg-slate-50 transition-colors align-top">
                      <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">{draw.drawName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                        {new Date(draw.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {draw.status === 'completed' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Completed
                          </span>
                        ) : draw.status === 'pending_approval' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Pending Approval
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Discarded
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          {draw.orgWinners.map((w) => (
                            <div key={w._id} className="flex items-center gap-2">
                              <div className="w-6 h-6 shrink-0 rounded-full grid place-items-center text-white font-bold text-[10px] bg-gradient-to-br from-emerald-600 to-emerald-800">
                                {w.firstName?.[0] || ''}{w.lastName?.[0] || ''}
                              </div>
                              <span className="text-sm text-slate-800">{w.firstName} {w.lastName}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          {draw.orgWinners.map((w) => (
                            <div key={w._id}>
                              {w.awardStatus === 'claimed' ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Claimed
                                </span>
                              ) : w.awardStatus === 'won' ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Won — Unclaimed
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                  —
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Content: SETTINGS */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          {/* Organisation Details Form */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
              <h3 className="font-bold text-slate-800">Organisation Details</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Organisation Name</label>
                  <input 
                    type="text" 
                    value={editFormData.name || ''} 
                    onChange={e => setEditFormData({...editFormData, name: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Company Number</label>
                  <input 
                    type="text" 
                    value={editFormData.companyNumber || ''} 
                    onChange={e => setEditFormData({...editFormData, companyNumber: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Annual Fee (£)</label>
                  <input 
                    type="number" 
                    value={editFormData.annualFee || ''} 
                    onChange={e => setEditFormData({...editFormData, annualFee: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Registered Address</label>
                  <textarea 
                    rows="3"
                    value={editFormData.registeredAddress || ''} 
                    onChange={e => setEditFormData({...editFormData, registeredAddress: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button 
                  onClick={handleSaveEdit}
                  disabled={isSaving}
                  className="px-5 py-2.5 bg-emerald-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 transition shadow-sm"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>

          {/* Administrative Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
              <h3 className="font-bold text-slate-800">Administrative Actions</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{org.isSuspended ? 'Activate Organisation' : 'Suspend Organisation'}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {org.isSuspended 
                      ? 'Restore full access for this organisation and its employees.' 
                      : 'Temporarily block access for this organisation. This can be undone.'}
                  </p>
                </div>
                <button 
                  onClick={handleToggleSuspension}
                  className={`px-4 py-2 border rounded-lg text-sm font-medium transition shrink-0 ${
                    org.isSuspended 
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100' 
                      : 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
                  }`}
                >
                  {org.isSuspended ? 'Activate Account' : 'Suspend Account'}
                </button>
              </div>
              <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Archive Organisation</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Permanently archive this organisation. This action cannot be easily undone.</p>
                </div>
                <button 
                  onClick={() => setIsConfirmingArchive(true)}
                  className="px-4 py-2 bg-red-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-red-700 transition shrink-0"
                >
                  Archive Org
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Confirmation Modal */}
      {isConfirmingSuspend && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0">
          <style>{`
            @keyframes modal-pop {
              0% { opacity: 0; transform: scale(0.95) translateY(10px); }
              100% { opacity: 1; transform: scale(1) translateY(0); }
            }
            @keyframes backdrop-fade {
              0% { opacity: 0; }
              100% { opacity: 1; }
            }
            .animate-modal-pop {
              animation: modal-pop 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            }
            .animate-backdrop {
              animation: backdrop-fade 0.3s ease-out forwards;
            }
          `}</style>
          
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm animate-backdrop" 
            onClick={() => setIsConfirmingSuspend(false)}
          ></div>
          
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm text-center animate-modal-pop">
            <div className={`mx-auto flex items-center justify-center h-14 w-14 rounded-full mb-4 ${org.isSuspended ? 'bg-emerald-100' : 'bg-red-100'}`}>
              {org.isSuspended ? (
                <svg className="h-7 w-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="h-7 w-7 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              )}
            </div>
            
            <h3 className="text-xl font-bold text-slate-900">
              {org.isSuspended ? 'Activate Organisation?' : 'Suspend Organisation?'}
            </h3>
            <p className="text-sm text-slate-500 mt-2 mb-8 leading-relaxed">
              {org.isSuspended 
                ? 'They will regain full access to the portal and their employees will be able to manage their funds.' 
                : 'This will instantly block their access to the platform. You can undo this action later.'}
            </p>
            
            <div className="flex gap-3 w-full">
              <button 
                onClick={() => setIsConfirmingSuspend(false)}
                className="flex-1 px-4 py-2.5 border border-slate-300 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmToggleSuspension}
                className={`flex-1 px-4 py-2.5 border border-transparent rounded-xl text-sm font-bold text-white focus:outline-none focus:ring-2 transition-colors shadow-sm ${
                  org.isSuspended 
                    ? 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500' 
                    : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                }`}
              >
                Yes, {org.isSuspended ? 'Activate' : 'Suspend'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Archive Confirmation Modal */}
      {isConfirmingArchive && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0">
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm animate-backdrop" 
            onClick={() => setIsConfirmingArchive(false)}
          ></div>
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm text-center animate-modal-pop">
            <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full mb-4 bg-orange-100">
              <svg className="h-7 w-7 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>
            
            <h3 className="text-xl font-bold text-slate-900">Archive Organisation?</h3>
            <p className="text-sm text-slate-500 mt-2 mb-8 leading-relaxed">
              This will hide the organisation from all main views and automatically suspend their access. Financial records will be kept for compliance.
            </p>
            
            <div className="flex gap-3 w-full">
              <button 
                onClick={() => setIsConfirmingArchive(false)}
                className="flex-1 px-4 py-2.5 border border-slate-300 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmArchive}
                className="flex-1 px-4 py-2.5 border border-transparent rounded-xl text-sm font-bold text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors shadow-sm"
              >
                Yes, Archive
              </button>
            </div>
          </div>
        </div>
      )}


            {/* Employee Details Side Panel */}
      <EmployeeProfileSidecar
        isOpen={!!selectedMember}
        onClose={() => setSelectedMember(null)}
        activeMember={selectedMember}
        employeeProfile={employeeProfile}
        isFetchingProfile={false}
      />
</SidebarLayout>
  );
};
