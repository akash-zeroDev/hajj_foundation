import { useState, useEffect } from 'react';
import { useOrganization } from '@clerk/react';
import SidebarLayout from '../../layouts/SidebarLayout';
import { orgAdminNavigation } from '../../config/navigation';

export const AdminEmployees = () => {
  const { organization, isLoaded } = useOrganization();
  const [members, setMembers] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal State
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);

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

  const handleRevoke = async (invitation) => {
    if (!window.confirm('Are you sure you want to revoke this invitation?')) return;
    try {
      await invitation.revoke();
      const invs = await organization.getInvitations({ status: 'pending' });
      const rawInvs = invs?.data || invs || [];
      setInvitations(rawInvs.filter(inv => inv.status === 'pending'));
    } catch (error) {
      console.error(error);
    }
  };

  const handleRemove = async (userId) => {
    if (!window.confirm('Are you sure you want to remove this employee from the organisation?')) return;
    try {
      await organization.removeMember(userId);
      const mems = await organization.getMemberships();
      setMembers(mems?.data || mems || []);
    } catch (error) {
      console.error(error);
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
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Joined Date</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr><td colSpan="4" className="text-center py-8 text-slate-500">Loading employees...</td></tr>
              ) : members.length === 0 ? (
                <tr><td colSpan="4" className="text-center py-8 text-slate-500">No active employees found.</td></tr>
              ) : (
                members.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {member.publicUserData.imageUrl && (
                          <img src={member.publicUserData.imageUrl} alt="" className="w-10 h-10 rounded-full border border-slate-200" />
                        )}
                        <div>
                          <div className="font-medium text-slate-900">
                            {member.publicUserData.firstName} {member.publicUserData.lastName}
                          </div>
                          <div className="text-xs text-slate-500">
                            {member.publicUserData.identifier}
                          </div>
                        </div>
                      </div>
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
                          onClick={() => handleRemove(member.publicUserData.userId)}
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

    </SidebarLayout>
  );
};
