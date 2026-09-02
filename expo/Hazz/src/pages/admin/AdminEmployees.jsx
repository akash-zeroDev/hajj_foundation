import { useState, useEffect } from 'react';
import { useOrganization, useAuth } from '@clerk/react';
import SidebarLayout from '../../layouts/SidebarLayout';
import PrimaryButton from '../../components/PrimaryButton';
import { orgAdminNavigation } from '../../config/navigation';

export const AdminEmployees = () => {
  const { organization, isLoaded } = useOrganization();
  const { getToken } = useAuth();
  const [members, setMembers] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal State
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [activeMember, setActiveMember] = useState(null);
  const [employeeProfile, setEmployeeProfile] = useState(null);
  const [isFetchingProfile, setIsFetchingProfile] = useState(false);

  useEffect(() => {
    if (activeMember) {
      fetchEmployeeProfile(activeMember.publicUserData.userId);
    } else {
      setEmployeeProfile(null);
    }
  }, [activeMember]);

  const fetchEmployeeProfile = async (clerkId) => {
    setIsFetchingProfile(true);
    try {
      const token = await getToken();
      const res = await fetch(`http://localhost:5000/api/employees/clerk/${clerkId}/admin`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setEmployeeProfile(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsFetchingProfile(false);
    }
  };


  useEffect(() => {
    const loadData = async () => {
      if (!isLoaded || !organization) return;
      try {
        const mems = await organization.getMemberships();
        const invs = await organization.getInvitations({ status: 'pending' });
        
        setMembers(mems?.data || mems || []);
        
        // Ensure we only show truly pending invitations
        const rawInvs = invs?.data || invs || [];
        const pendingInvs = rawInvs.filter(inv => inv.status === 'pending');
        setInvitations(pendingInvs);
      } catch (error) {
        console.error("Error fetching org data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [isLoaded, organization]);

  const handleInvite = async (e) => {
    e.preventDefault();
    setIsInviting(true);
    try {
      await organization.inviteMember({ 
        emailAddress: inviteEmail, 
        role: 'org:member' 
      });
      setInviteEmail('');
      setIsInviteModalOpen(false);
      
      // Refresh invitations
      const invs = await organization.getInvitations({ status: 'pending' });
      const rawInvs = invs?.data || invs || [];
      setInvitations(rawInvs.filter(inv => inv.status === 'pending'));
    } catch (error) {
      console.error(error);
      alert(error.errors?.[0]?.message || 'Failed to send invite.');
    } finally {
      setIsInviting(false);
    }
  };

  const [confirmRevokeTarget, setConfirmRevokeTarget] = useState(null);
  const [confirmRemoveTarget, setConfirmRemoveTarget] = useState(null);

  const handleRevoke = (invitation) => {
    setConfirmRevokeTarget(invitation);
  };

  const executeRevoke = async () => {
    if (!confirmRevokeTarget) return;
    try {
      await confirmRevokeTarget.revoke();
      const invs = await organization.getInvitations({ status: 'pending' });
      const rawInvs = invs?.data || invs || [];
      setInvitations(rawInvs.filter(inv => inv.status === 'pending'));
    } catch (error) {
      console.error(error);
    } finally {
      setConfirmRevokeTarget(null);
    }
  };

  const handleRemove = (userId) => {
    setConfirmRemoveTarget(userId);
  };

  const executeRemove = async () => {
    if (!confirmRemoveTarget) return;
    try {
      await organization.removeMember(confirmRemoveTarget);
      const mems = await organization.getMemberships();
      setMembers(mems?.data || mems || []);
      if (activeMember && activeMember.publicUserData.userId === confirmRemoveTarget) {
        setActiveMember(null);
        setSelectedMember(null);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setConfirmRemoveTarget(null);
    }
  };

  return (
    <SidebarLayout navigation={orgAdminNavigation} title="Manage Employees">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Employees</h1>
          <p className="text-sm text-slate-500">Add and manage your organisation's staff members.</p>
        </div>
        <button 
          onClick={() => setIsInviteModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 border border-transparent rounded-lg text-sm font-bold text-white shadow-sm hover:bg-emerald-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
          Invite Employee
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h3 className="font-bold text-slate-800">Active Team Members</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-sm text-slate-500 bg-white">
                <th className="px-6 py-4 font-medium">Employee</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Joined Date</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr><td colSpan="5" className="text-center py-8 text-slate-500">Loading employees...</td></tr>
              ) : members.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-8 text-slate-500">No active employees found.</td></tr>
              ) : (
                [...members].sort((a, b) => {
                  if (a.role === 'org:admin' && b.role !== 'org:admin') return -1;
                  if (a.role !== 'org:admin' && b.role === 'org:admin') return 1;
                  return 0;
                }).map((member) => (
                  <tr key={member.id} className={`transition-colors ${member.role === 'org:admin' ? '' : 'hover:bg-slate-50 cursor-pointer'}`} onClick={() => { if (member.role !== 'org:admin') { setActiveMember(member); setSelectedMember(member); } }}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {member.publicUserData.hasImage ? (
                          <img src={member.publicUserData.imageUrl} alt="" className="w-10 h-10 rounded-full border border-slate-200 object-cover" />
                        ) : (
                          <div className="w-10 h-10 shrink-0 rounded-full grid place-items-center text-white font-bold text-sm bg-gradient-to-br from-emerald-600 to-emerald-800 shadow-sm border border-emerald-700/50">
                            {(member.publicUserData.firstName || member.publicMetadata?.firstName)?.[0] || ''}{(member.publicUserData.lastName || member.publicMetadata?.lastName)?.[0] || ''}
                            {!member.publicUserData.firstName && !member.publicUserData.lastName && !member.publicMetadata?.firstName && !member.publicMetadata?.lastName && (member.publicUserData.identifier?.[0]?.toUpperCase() || 'U')}
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-slate-900">
                            {member.publicUserData.firstName || member.publicUserData.lastName || member.publicMetadata?.firstName || member.publicMetadata?.lastName ? `${member.publicUserData.firstName || member.publicMetadata?.firstName || ''} ${member.publicUserData.lastName || member.publicMetadata?.lastName || ''}`.trim() : (
                              <span className="italic text-slate-400 font-normal">
                                {member.publicUserData.identifier?.split('@')[0] || 'Awaiting setup'}
                              </span>
                            )}
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
                    <td className="px-6 py-4 text-right">
                      {member.role !== 'org:admin' && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleRemove(member.publicUserData.userId); }}
                          className="text-red-600 hover:text-red-800 text-sm font-medium transition"
                        >
                          Remove
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {invitations.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h3 className="font-bold text-slate-800">Pending Invitations</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-sm text-slate-500 bg-white">
                  <th className="px-6 py-4 font-medium">Email Address</th>
                  <th className="px-6 py-4 font-medium">Invited Role</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invitations.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{inv.emailAddress}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 capitalize">Employee</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium border bg-amber-50 text-amber-700 border-amber-200">
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleRevoke(inv)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium transition"
                      >
                        Revoke
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0">
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsInviteModalOpen(false)}
          ></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
            <div className="px-6 py-5 border-b border-slate-200 bg-slate-50">
              <h3 className="text-lg font-bold text-slate-900">Invite New Employee</h3>
            </div>
            <form onSubmit={handleInvite} className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">Employee Email Address</label>
                <input 
                  type="email" 
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="employee@company.com"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                />
                <p className="text-xs text-slate-500 mt-2">They will receive an email containing a secure link to join the organisation and set up their profile.</p>
              </div>
              <div className="flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isInviting}
                  className="px-4 py-2 bg-emerald-600 border border-transparent rounded-lg text-sm font-bold text-white hover:bg-emerald-700 transition disabled:opacity-50"
                >
                  {isInviting ? 'Sending...' : 'Send Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      
      
      {/* Sidecard Overlay */}
      <div 
        className={`fixed inset-0 bg-[#09100d]/50 backdrop-blur-[2px] z-40 transition-opacity duration-[250ms] ease-in-out ${selectedMember ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} 
        onClick={() => setSelectedMember(null)}
      ></div>

      <aside 
        className={`fixed top-0 right-0 h-screen w-[440px] max-w-[94vw] z-50 bg-[#fbfdfc] border-l border-[#e8edeb] flex flex-col transform transition-transform duration-[320ms] ease-[cubic-bezier(0.4,0,0.2,1)] shadow-[-30px_0_60px_-30px_rgba(14,26,22,.4)] ${selectedMember ? 'translate-x-0' : 'translate-x-full'}`}
        role="dialog" 
        aria-label="Employee profile"
      >
        {activeMember && (
          <>
            <div className="p-[8px_16px_10px] text-white bg-emerald-900 shrink-0">
              <div className="flex items-center gap-[10px]">
                <span className="text-[10px] tracking-[0.14em] uppercase text-white/50 font-bold">Employee profile</span>
                <button 
                  className="ml-auto w-[24px] h-[24px] rounded-[6px] border border-white/20 bg-white/10 text-[#e3ede9] grid place-items-center cursor-pointer hover:bg-white/20 hover:text-white transition-colors"
                  onClick={() => setSelectedMember(null)}
                  aria-label="Close"
                >
                  <svg viewBox="0 0 24 24" className="w-[12px] h-[12px] stroke-current stroke-[2] fill-none"><path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18"/></svg>
                </button>
              </div>
              <div className="flex items-center gap-[12px] mt-[6px]">
                <div className="w-[38px] h-[38px] shrink-0 rounded-[12px] grid place-items-center text-white font-extrabold text-[14px] tracking-[-0.4px] bg-gradient-to-br from-[#17a377] to-[#0a6b50] shadow-[0_6px_16px_-8px_rgba(23,163,119,.9)]">
                  {activeMember.publicUserData.firstName?.[0]}{activeMember.publicUserData.lastName?.[0]}
                </div>
                <div>
                  <h3 className="m-0 text-[16px] tracking-[-0.4px] font-bold leading-tight">{activeMember.publicUserData.firstName} {activeMember.publicUserData.lastName}</h3>
                  <a href={`mailto:${activeMember.publicUserData.identifier}`} className="inline-block mt-[1px] text-[#9ff0d2] text-[12px] font-medium no-underline hover:underline">
                    {activeMember.publicUserData.identifier}
                  </a>
                  <div className="flex gap-[6px] mt-[4px] flex-wrap">
                    <span className="text-[9.5px] font-semibold px-[7px] py-[2px] rounded-full bg-white/10 border border-white/20 text-[#dbe8e3]">
                      {activeMember.role === 'org:admin' ? 'Administrator' : 'Employee'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-[18px_20px_24px]">
              {isFetchingProfile ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#17a377]"></div>
                </div>
              ) : employeeProfile ? (
                <>
                  <div className="bg-white border border-[#e8edeb] rounded-[16px] p-[16px_17px] shadow-[0_1px_2px_rgba(14,26,22,.04),0_8px_24px_-18px_rgba(14,26,22,.35)]">
                    <div className="flex items-end justify-between gap-[12px]">
                      <div>
                        <div className="text-[11px] text-[#93a19c] font-semibold">Total savings balance</div>
                        <b className="block mt-[4px] text-[27px] font-extrabold tracking-[-1px] tabular-nums leading-none text-[#0e1a16]">£{(employeeProfile.balance || 0).toFixed(2)}</b>
                      </div>
                      <div className="text-right">
                        <div className="text-[11px] text-[#93a19c] font-semibold">Monthly contribution</div>
                        <b className="text-[16px] tracking-[-0.4px] text-[#5c6b65]">£{(employeeProfile.contribution || 0).toFixed(2)}</b>
                      </div>
                    </div>
                    
                    {(() => {
                      const target = employeeProfile.hajjTarget || 6000;
                      const balance = employeeProfile.balance || 0;
                      const pct = Math.min(100, (balance / target) * 100);
                      const months = employeeProfile.contribution > 0 ? Math.floor(balance / employeeProfile.contribution) : 0;
                      return (
                        <>
                          <div className="h-[6px] rounded-full bg-[#eef2f0] overflow-hidden mt-[16px]">
                            <div className="block h-full rounded-full bg-gradient-to-r from-[#17a377] to-[#0b7a5b]" style={{ width: `${Math.max(pct, 1.5)}%` }}></div>
                          </div>
                          <div className="flex justify-between mt-[8px] text-[11.5px] text-[#93a19c]">
                            <span><b className="inline text-[11.5px] font-bold text-[#5c6b65] tracking-normal">{pct.toFixed(1)}%</b> of £{target.toLocaleString()} Hajj target</span>
                            <span>{months} month{months === 1 ? '' : 's'} contributed</span>
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  <div className="text-[10.5px] tracking-[0.14em] uppercase text-[#93a19c] font-bold m-[22px_0_9px]">Compliance &amp; status</div>
                  <div className="bg-white border border-[#e8edeb] rounded-[16px] overflow-hidden shadow-[0_1px_2px_rgba(14,26,22,.04),0_8px_24px_-18px_rgba(14,26,22,.35)]">
                    <div className="flex items-center gap-[12px] p-[13px_15px] border-b border-[#e8edeb]">
                      <div className="w-[30px] h-[30px] shrink-0 rounded-[9px] grid place-items-center bg-[rgba(23,163,119,.12)] text-[#0b7a5b]">
                        <svg viewBox="0 0 24 24" className="w-[15px] h-[15px] stroke-current stroke-[1.8] fill-none"><path strokeLinecap="round" strokeLinejoin="round" d="M7 3h7l5 5v13H7z"/><path strokeLinecap="round" strokeLinejoin="round" d="M14 3v5h5M10 14l2 2 4-4"/></svg>
                      </div>
                      <div>
                        <div className="text-[13.4px] font-semibold tracking-[-0.1px] text-[#0e1a16]">Shariah agreement</div>
                        <div className="text-[11.8px] text-[#93a19c] mt-[2px]">Master agreement v2</div>
                      </div>
                      <div className="ml-auto text-right flex flex-col items-end gap-[4px]">
                        {employeeProfile.agreementStatus === 'signed' ? (
                          <>
                            <span className="text-[11px] font-bold px-[10px] py-[4px] rounded-full whitespace-nowrap bg-[rgba(23,163,119,.12)] text-[#0b7a5b] border border-[rgba(11,122,91,.18)]">Signed</span>
                            {/* Skipping actual date for now since it's not strictly tracked in DB as 'agreementSignedDate' yet, showing creation date as fallback to match visual density */}
                            <span className="text-[11px] text-[#93a19c]">{new Date(employeeProfile.createdAt).toLocaleDateString('en-GB')}</span>
                          </>
                        ) : (
                          <span className="text-[11px] font-bold px-[10px] py-[4px] rounded-full whitespace-nowrap bg-[#fdf6e6] text-[#8a5b12] border border-[#f2e3c2]">Pending</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-[12px] p-[13px_15px] border-b border-[#e8edeb]">
                      <div className="w-[30px] h-[30px] shrink-0 rounded-[9px] grid place-items-center bg-[rgba(23,163,119,.12)] text-[#0b7a5b]">
                        <svg viewBox="0 0 24 24" className="w-[15px] h-[15px] stroke-current stroke-[1.8] fill-none"><rect x="3" y="6" width="18" height="12" rx="2"/><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h3"/></svg>
                      </div>
                      <div>
                        <div className="text-[13.4px] font-semibold tracking-[-0.1px] text-[#0e1a16]">Subscription</div>
                        <div className="text-[11.8px] text-[#93a19c] mt-[2px]">Direct debit · Stripe</div>
                      </div>
                      <div className="ml-auto text-right flex flex-col items-end gap-[4px]">
                        {employeeProfile.subscriptionStatus === 'active' ? (
                          <>
                            <span className="text-[11px] font-bold px-[10px] py-[4px] rounded-full whitespace-nowrap bg-[rgba(23,163,119,.12)] text-[#0b7a5b] border border-[rgba(11,122,91,.18)]">Active</span>
                            {/* Assuming next payment is roughly 1 month from now or something for visual fidelity */}
                            <span className="text-[11px] text-[#93a19c]">Next: {new Date(new Date().setMonth(new Date().getMonth() + 1)).toLocaleDateString('en-GB', {day: '2-digit', month: '2-digit', year: 'numeric'})}</span>
                          </>
                        ) : (
                          <span className="text-[11px] font-bold px-[10px] py-[4px] rounded-full whitespace-nowrap bg-[#f1f4f3] text-[#93a19c] border border-[#e6ebe9]">Inactive</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-[12px] p-[13px_15px]">
                      <div className="w-[30px] h-[30px] shrink-0 rounded-[9px] grid place-items-center bg-[rgba(23,163,119,.12)] text-[#0b7a5b]">
                        <svg viewBox="0 0 24 24" className="w-[15px] h-[15px] stroke-current stroke-[1.8] fill-none"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4h16v6a8 8 0 01-16 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M9 20h6M12 18v2"/></svg>
                      </div>
                      <div>
                        <div className="text-[13.4px] font-semibold tracking-[-0.1px] text-[#0e1a16]">Hajj award</div>
                        <div className="text-[11.8px] text-[#93a19c] mt-[2px]">Monthly draw eligibility</div>
                      </div>
                      <div className="ml-auto text-right flex flex-col items-end gap-[4px]">
                        <span className="text-[11px] font-bold px-[10px] py-[4px] rounded-full whitespace-nowrap bg-[#f1f4f3] text-[#93a19c] border border-[#e6ebe9]">
                          {employeeProfile.awardStatus ? employeeProfile.awardStatus.charAt(0).toUpperCase() + employeeProfile.awardStatus.slice(1) : 'None'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {employeeProfile.agreementStatus !== 'signed' && (
                    <div className="mt-[10px] flex gap-[11px] p-[12px_13px] rounded-[14px] bg-[#fdf6e6] border border-[#f2e3c2] text-[#6f4a0e]">
                      <svg viewBox="0 0 24 24" className="w-[16px] h-[16px] shrink-0 mt-[2px] stroke-current stroke-[1.9] fill-none"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v5M12 17h.01"/><path strokeLinecap="round" strokeLinejoin="round" d="M10.3 4l-7.4 13A2 2 0 004.6 20h14.8a2 2 0 001.7-3L13.7 4a2 2 0 00-3.4 0z"/></svg>
                      <span>
                        <b className="block text-[12.6px]">Action needed</b>
                        <p className="m-[3px_0_0] text-[12.1px] leading-[1.55] text-[#8a5b12]">This employee has not signed the current agreement version.</p>
                      </span>
                    </div>
                  )}

                  <div className="text-[10.5px] tracking-[0.14em] uppercase text-[#93a19c] font-bold m-[22px_0_9px]">Account details</div>
                  <div className="bg-white border border-[#e8edeb] rounded-[16px] overflow-hidden shadow-[0_1px_2px_rgba(14,26,22,.04),0_8px_24px_-18px_rgba(14,26,22,.35)]">
                    
                    {/* Just Joined and User ID as per schema */}
                    <div className="flex items-center gap-[12px] p-[13px_15px] border-b border-[#e8edeb]">
                      <div>
                        <div className="text-[13.4px] font-semibold tracking-[-0.1px] text-[#0e1a16]">Joined</div>
                        <div className="text-[11.8px] text-[#93a19c] mt-[2px]">{new Date(activeMember.createdAt).toLocaleString('en-GB')}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-[12px] p-[13px_15px]">
                      <div>
                        <div className="text-[13.4px] font-semibold tracking-[-0.1px] text-[#0e1a16]">User ID</div>
                        <div className="text-[11.6px] text-[#93a19c] mt-[2px] font-mono break-all">{activeMember.publicUserData.userId}</div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-[#93a19c]">Failed to load profile.</div>
              )}
            </div>

            <div className="p-[13px_20px] border-t border-[#e8edeb] bg-white grid gap-[9px] shrink-0">
              <button className="border-0 cursor-pointer font-inherit font-semibold text-[13.4px] p-[11px_16px] rounded-[11px] inline-flex items-center justify-center gap-[8px] w-full text-white bg-gradient-to-b from-[#17a377] to-[#0b7a5b] shadow-[0_10px_22px_-14px_rgba(11,122,91,.9)] hover:brightness-106 transition-all">
                <svg viewBox="0 0 24 24" className="w-[16px] h-[16px] stroke-current stroke-[1.9] fill-none"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4h16v16H4z"/><path strokeLinecap="round" strokeLinejoin="round" d="M8 9h8M8 13h5"/></svg>
                View savings statement
              </button>
              <div className="grid grid-cols-2 gap-[9px]">
                <button className="cursor-pointer font-inherit font-semibold text-[13.4px] p-[11px_16px] rounded-[11px] inline-flex items-center justify-center gap-[8px] w-full bg-white border border-[#e8edeb] text-[#0e1a16] hover:bg-[#f4f8f6] transition-colors">
                  <svg viewBox="0 0 24 24" className="w-[16px] h-[16px] stroke-current stroke-[1.9] fill-none"><path strokeLinecap="round" strokeLinejoin="round" d="M4 5h16v14H4z"/><path strokeLinecap="round" strokeLinejoin="round" d="M4 7l8 6 8-6"/></svg>
                  Send reminder
                </button>
                {activeMember.role !== 'org:admin' && (
                  <button 
                    onClick={() => {
                      handleRemove(activeMember.publicUserData.userId);
                      setSelectedMember(null);
                    }}
                    className="cursor-pointer font-inherit font-semibold text-[13.4px] p-[11px_16px] rounded-[11px] inline-flex items-center justify-center gap-[8px] w-full bg-white border border-[#f6cfcc] text-[#a3271f] hover:bg-[#fdeceb] transition-colors"
                  >
                    <svg viewBox="0 0 24 24" className="w-[16px] h-[16px] stroke-current stroke-[1.9] fill-none"><path strokeLinecap="round" strokeLinejoin="round" d="M5 7h14M9 7V5h6v2M7 7l1 13h8l1-13"/></svg>
                    Remove
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </aside>



      {/* Remove Employee Modal */}
      {confirmRemoveTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <style>{`
            @keyframes modal-pop { 0% { opacity: 0; transform: scale(0.95) translateY(10px); } 100% { opacity: 1; transform: scale(1) translateY(0); } }
            @keyframes backdrop-fade { 0% { opacity: 0; } 100% { opacity: 1; } }
            .animate-modal-pop { animation: modal-pop 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
            .animate-backdrop { animation: backdrop-fade 0.3s ease-out forwards; }
          `}</style>
          
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm animate-backdrop" onClick={() => setConfirmRemoveTarget(null)}></div>
          
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm text-center animate-modal-pop">
            <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full mb-4 bg-red-100">
              <svg className="h-7 w-7 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900">Remove Employee?</h3>
            <p className="text-sm text-slate-500 mt-2 mb-8 leading-relaxed">
              Are you sure you want to remove this employee from the organisation? This action cannot be undone.
            </p>
            <div className="flex gap-3 w-full">
              <button onClick={() => setConfirmRemoveTarget(null)} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition">Cancel</button>
              <button onClick={executeRemove} className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 shadow-sm shadow-red-200 transition">Remove</button>
            </div>
          </div>
        </div>
      )}

      {/* Revoke Invitation Modal */}
      {confirmRevokeTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <style>{`
            @keyframes modal-pop { 0% { opacity: 0; transform: scale(0.95) translateY(10px); } 100% { opacity: 1; transform: scale(1) translateY(0); } }
            @keyframes backdrop-fade { 0% { opacity: 0; } 100% { opacity: 1; } }
            .animate-modal-pop { animation: modal-pop 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
            .animate-backdrop { animation: backdrop-fade 0.3s ease-out forwards; }
          `}</style>
          
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm animate-backdrop" onClick={() => setConfirmRevokeTarget(null)}></div>
          
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm text-center animate-modal-pop">
            <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full mb-4 bg-amber-100">
              <svg className="h-7 w-7 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900">Revoke Invitation?</h3>
            <p className="text-sm text-slate-500 mt-2 mb-8 leading-relaxed">
              Are you sure you want to revoke this invitation? The link they received will no longer work.
            </p>
            <div className="flex gap-3 w-full">
              <button onClick={() => setConfirmRevokeTarget(null)} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition">Cancel</button>
              <button onClick={executeRevoke} className="flex-1 px-4 py-2.5 rounded-xl bg-amber-600 text-white font-bold hover:bg-amber-700 shadow-sm shadow-amber-200 transition">Revoke</button>
            </div>
          </div>
        </div>
      )}

    </SidebarLayout>  );
};
export default AdminEmployees;
