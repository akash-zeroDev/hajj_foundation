import { useState, useEffect } from 'react';
import { useOrganization, useAuth } from '@clerk/react';


import jsPDF from 'jspdf';
import 'jspdf-autotable';
import SearchFilterBar from '../../components/SearchFilterBar';
import EmployeeProfileSidecar from '../../components/EmployeeProfileSidecar';
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
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [employeeTab, setEmployeeTab] = useState('active');
  const [allDbEmployees, setAllDbEmployees] = useState([]);
  const [isRemoving, setIsRemoving] = useState(false);

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
        role: 'org:member',
        redirectUrl: 'http://localhost:5173/dashboard'
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

  const handleDownloadStatement = async () => {
    if (!selectedMember) return;
    try {
      const token = await getToken();
      const res = await fetch(`http://localhost:5000/api/financials/org-transactions/${org.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!data.success) throw new Error('Failed to fetch transactions');
      
      const employeeClerkId = selectedMember.publicUserData?.userId || selectedMember.clerkUserId;
      const txs = (data.data || []).filter(tx => tx.payerId && tx.payerId.clerkUserId === employeeClerkId);
      
      const doc = new jsPDF();
      doc.setFontSize(20);
      doc.text("Savings Statement", 14, 22);
      
      doc.setFontSize(12);
      doc.text(`Employee: ${selectedMember.publicUserData?.firstName || ''} ${selectedMember.publicUserData?.lastName || ''}`, 14, 32);
      doc.text(`Organisation: ${org.name}`, 14, 38);
      doc.text(`Date Generated: ${new Date().toLocaleDateString()}`, 14, 44);
      
      const profile = allDbEmployees.find(e => e.clerkUserId === employeeClerkId);
      if (profile) {
         doc.text(`Total Balance: £${(profile.balance || 0).toFixed(2)}`, 14, 50);
      }
      
      const tableData = txs.map(tx => [
         new Date(tx.createdAt).toLocaleDateString(),
         tx.type === 'employer_fee' ? 'Employer Deposit' : tx.type,
         `£${tx.amount.toFixed(2)}`,
         tx.status
      ]);
      
      doc.autoTable({
         startY: 60,
         head: [['Date', 'Type', 'Amount', 'Status']],
         body: tableData,
      });
      
      doc.save(`Statement_${selectedMember.publicUserData?.firstName || 'Employee'}.pdf`);
    } catch (err) {
      console.error(err);
      alert('Failed to generate statement');
    }
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
    setIsRemoving(true);
    try {
      await organization.removeMember(confirmRemoveTarget);
      // Also tell backend to soft delete
      await fetch(`http://localhost:5000/api/organisations/${organization.id}/employees/${confirmRemoveTarget}/remove`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${await getToken()}` }
      });
      // Fetch fresh merged members
      let activeMembers = await organization.getMemberships();
      const dbRes = await fetch(`http://localhost:5000/api/organisations/clerk/${organization.id}/employee-agreements`, { headers: { Authorization: `Bearer ${await getToken()}` } });
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
            },
            clerkUserId: emp.clerkUserId
          }));
          activeMembers = [...activeMembers, ...removedMocks];
      }
      setMembers(activeMembers);

      if (activeMember && (activeMember.publicUserData?.userId === confirmRemoveTarget || activeMember.clerkUserId === confirmRemoveTarget)) {
        setActiveMember(null);
        setSelectedMember(null);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setConfirmRemoveTarget(null);
      setIsRemoving(false);
    }
  };

  return (
    <SidebarLayout navigation={orgAdminNavigation} title="Manage Employees">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Employees</h1>
          <p className="text-sm text-slate-500">Add and manage your organisation's staff members</p>
        </div>
        <button 
          onClick={() => setIsInviteModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 border border-transparent rounded-lg text-sm font-bold text-white shadow-sm hover:bg-emerald-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
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
            <EmployeeProfileSidecar
        isOpen={!!selectedMember}
        onClose={() => setSelectedMember(null)}
        activeMember={selectedMember}
        employeeProfile={employeeProfile || (activeMember ? allDbEmployees.find(e => e.clerkUserId === (activeMember.publicUserData?.userId || activeMember.clerkUserId)) : null)}
        isFetchingProfile={isFetchingProfile}
        onRemove={() => setConfirmRemoveTarget(selectedMember.publicUserData?.userId || selectedMember.clerkUserId)}
        onDownloadStatement={handleDownloadStatement}
        isRemoving={isRemoving}
      />



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
              <AlertTriangle className="h-7 w-7 text-red-600" />
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
              <AlertCircle className="h-7 w-7 text-amber-600" />
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
