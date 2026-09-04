import { useAuth } from '@clerk/react';
import React, { useState, useEffect } from 'react';
import SidebarLayout from '../../layouts/SidebarLayout';
import { superAdminNavigation } from '../../config/navigation';
import { useToast } from '../../context/ToastContext';

export const UsersList = () => {
  const { getToken } = useAuth(); // UsersList
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeUser, setActiveUser] = useState(null); // Controls the Sidecard
  
  // Action states
  const [isResetting, setIsResetting] = useState(false);
  const [isSuspending, setIsSuspending] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [employeeProfile, setEmployeeProfile] = useState(null);
  const [isFetchingProfile, setIsFetchingProfile] = useState(false);
  const [tempPassword, setTempPassword] = useState(null);

  const fetchUsers = async () => {
    try {
      const token = await getToken();
      const res = await fetch('http://localhost:5000/api/users', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch users');
      
      const allUsers = Array.isArray(data) ? data : (data.data || []);
      // Filter out 'Independent / Unassigned' users for the superadmin view
      const activeUsers = allUsers.filter(u => u.injectedOrgName);
      setUsers(activeUsers);

    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleResetPassword = async () => {
    if (!activeUser) return;
    setIsResetting(true);
    setTempPassword(null);
    try {
      const token = await getToken();
      const res = await fetch(`http://localhost:5000/api/users/${activeUser.id}/reset-password`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        showToast('Password reset successfully.', 'success');
        setTempPassword(data.tempPassword);
      } else {
        showToast(data.message || 'Failed to reset password', 'error');
      }
    } catch (err) {
      console.error('Reset error:', err);
      showToast('Network error while resetting password', 'error');
    } finally {
      setIsResetting(false);
    }
  };


  const handleDeleteUser = async () => {
    if (!activeUser || !window.confirm('Are you sure you want to permanently delete this user? This action cannot be undone.')) return;
    setIsDeleting(true);
    try {
      const token = await getToken();
      const res = await fetch(`http://localhost:5000/api/users/${activeUser.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete user');
      
      showToast('User permanently deleted', 'success');
      setActiveUser(null);
      fetchUsers(); // Refresh list
    } catch (error) {
      showToast('Error deleting user', 'error');
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleSuspend = async () => {
    if (!activeUser) return;
    setIsSuspending(true);
    try {
      const token = await getToken();
      const res = await fetch(`http://localhost:5000/api/users/${activeUser.id}/toggle-suspend`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        const action = data.banned ? 'suspended' : 'unsuspended';
        showToast(`User successfully ${action}.`, 'success');
        
        // Update local state to reflect change without full refetch
        const updatedUser = { ...activeUser, banned: data.banned };
        setActiveUser(updatedUser);
        setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
      } else {
        showToast(data.message || 'Failed to update user status', 'error');
      }
    } catch (err) {
      console.error('Suspend error:', err);
      showToast('Network error while updating status', 'error');
    } finally {
      setIsSuspending(false);
    }
  };

  const handleUserClick = async (user) => {
    setActiveUser(user);
    setSelectedUser(user);
    setTempPassword(null);
    
    // Fetch Employee data automatically for Super Admin
    try {
      setIsFetchingProfile(true);
      setEmployeeProfile(null);
      const token = await getToken();
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiUrl}/api/employees/clerk/${user.id}/admin`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data && data.data.agreementStatus) {
           setEmployeeProfile(data.data);
        }
      }
    } catch (err) {
      console.error('Error fetching employee profile:', err);
    } finally {
      setIsFetchingProfile(false);
    }
  };

  // Clear temp password when closing sidecard
  const handleCloseSidecard = () => {
    setSelectedUser(null);
    setTempPassword(null);
  };

  const filteredUsers = users.filter(u => {
    const name = `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase();
    const email = (u.emailAddresses?.[0]?.emailAddress || '').toLowerCase();
    const matchesSearch = name.includes(searchTerm.toLowerCase()) || email.includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <SidebarLayout navigation={superAdminNavigation} title="All Users">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Global User Directory</h1>
          <p className="text-sm text-slate-500">View and manage all users across all organisations.</p>
        </div>
      </div>

      <div className="flex mb-6">
        <div className="flex-1 relative">
          <svg className="w-[18px] h-[18px] absolute left-3 top-[11px] text-slate-400 stroke-current stroke-[1.8] fill-none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input 
            type="text" 
            placeholder="Search users by name or email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm shadow-sm transition-shadow"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-sm text-slate-500 bg-slate-50">
              <th className="px-6 py-4 font-medium">User Details</th>
              <th className="px-6 py-4 font-medium">Organisation</th>
              <th className="px-6 py-4 font-medium">Primary Email</th>
              <th className="px-6 py-4 font-medium">Joined Date</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              [1,2,3,4].map(i => (
                <tr key={i} className="animate-pulse">
                  <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="w-9 h-9 bg-slate-200 rounded-full" /><div className="h-3 bg-slate-200 rounded w-32" /></div></td>
                  <td className="px-6 py-4"><div className="h-3 bg-slate-200 rounded w-20" /></td>
                  <td className="px-6 py-4"><div className="h-3 bg-slate-200 rounded w-40" /></td>
                  <td className="px-6 py-4"><div className="h-3 bg-slate-200 rounded w-24" /></td>
                  <td className="px-6 py-4 text-right"><div className="h-3 bg-slate-200 rounded w-10 ml-auto" /></td>
                </tr>
              ))
            ) : filteredUsers.length === 0 ? (
              <tr><td colSpan="5" className="text-center py-12 text-slate-500">No users found.</td></tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => handleUserClick(user)}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {user.hasImage ? (
                        <img src={user.imageUrl} alt="" className="w-10 h-10 rounded-full border border-slate-200 object-cover" />
                      ) : (
                        <div className="w-10 h-10 shrink-0 rounded-full grid place-items-center text-white font-bold text-sm bg-gradient-to-br from-emerald-600 to-emerald-800 shadow-sm border border-emerald-700/50">
                          {user.firstName?.[0] || ''}{user.lastName?.[0] || ''}
                          {!user.firstName && !user.lastName && (user.emailAddresses?.[0]?.emailAddress?.[0]?.toUpperCase() || 'U')}
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-slate-900 flex items-center gap-2">
                          {user.firstName || user.lastName ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : (
                            <span className="italic text-slate-500 font-normal">
                              {user.emailAddresses?.[0]?.emailAddress?.split('@')[0] || 'Awaiting setup'}
                            </span>
                          )}
                          {user.publicMetadata?.isSuspended && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 border border-red-200 uppercase tracking-wider whitespace-nowrap">
                              Suspended
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700 font-medium">
                    {user.publicMetadata?.role === 'superadmin' ? 'Hajj Savings (Superadmin)' : (user.injectedOrgName || 'Independent / Unassigned')}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700">
                    {user.emailAddresses?.[0]?.emailAddress}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {new Date(user.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-emerald-600 hover:text-emerald-800 text-sm font-medium">View</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Sidecar Overlay */}
      <>
        <div 
          className={`fixed inset-0 bg-[#09100d]/50 backdrop-blur-[2px] z-[60] transition-opacity duration-[250ms] ease-in-out ${selectedUser ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
          onClick={handleCloseSidecard}
        />
        
        {/* Sidecar Panel */}
        <aside 
          className={`fixed top-0 right-0 h-screen w-[440px] max-w-[94vw] z-[70] bg-[#fbfdfc] border-l border-[#e8edeb] flex flex-col transform transition-transform duration-[320ms] ease-[cubic-bezier(0.4,0,0.2,1)] shadow-[-30px_0_60px_-30px_rgba(14,26,22,.4)] ${selectedUser ? 'translate-x-0' : 'translate-x-full'}`}
          role="dialog" 
        >
          {activeUser && (
            <>
              {/* Premium Green Header */}
              <div className="p-[8px_16px_10px] text-white bg-emerald-900 shrink-0">
                <div className="flex items-center gap-[10px]">
                  <span className="text-[10px] tracking-[0.14em] uppercase text-white/50 font-bold">User Profile</span>
                  <button 
                    className="ml-auto w-[24px] h-[24px] rounded-[6px] border border-white/20 bg-white/10 text-[#e3ede9] grid place-items-center cursor-pointer hover:bg-white/20 hover:text-white transition-colors"
                    onClick={handleCloseSidecard}
                    aria-label="Close"
                  >
                    <svg viewBox="0 0 24 24" className="w-[12px] h-[12px] stroke-current stroke-[2] fill-none"><path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18"/></svg>
                  </button>
                </div>
                <div className="flex items-center gap-[12px] mt-[6px]">
                  <div className="w-[38px] h-[38px] shrink-0 rounded-[12px] grid place-items-center text-white font-extrabold text-[14px] tracking-[-0.4px] bg-gradient-to-br from-[#17a377] to-[#0a6b50] shadow-[0_6px_16px_-8px_rgba(23,163,119,.9)]">
                    {activeUser.firstName?.[0] || 'U'}
                  </div>
                  <div>
                    <h3 className="m-0 text-[16px] tracking-[-0.4px] font-bold leading-tight">
                      {activeUser.firstName || activeUser.lastName ? `${activeUser.firstName || ''} ${activeUser.lastName || ''}`.trim() : (
                        <span className="italic font-normal">Awaiting setup</span>
                      )}
                    </h3>
                    <a href={`mailto:${activeUser.emailAddresses?.[0]?.emailAddress}`} className="inline-block mt-[1px] text-[#9ff0d2] text-[12px] font-medium no-underline hover:underline">
                      {activeUser.emailAddresses?.[0]?.emailAddress}
                    </a>
                    <div className="flex gap-[6px] mt-[4px] flex-wrap">
                      <span className={`text-[9.5px] font-semibold px-[7px] py-[2px] rounded-full border ${activeUser.publicMetadata?.isSuspended ? 'bg-white/10 text-red-200 border-white/20' : 'bg-white/10 text-[#dbe8e3] border-white/20'}`}>
                        {activeUser.publicMetadata?.isSuspended ? 'Suspended' : 'Active'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Scrollable Body */}
              <div className="flex-1 overflow-y-auto p-[18px_20px_24px]">
                
                <div className="text-[10.5px] tracking-[0.14em] uppercase text-[#93a19c] font-bold m-[10px_0_9px]">Account details</div>
                
                <div className="bg-white border border-[#e8edeb] rounded-[16px] overflow-hidden shadow-[0_1px_2px_rgba(14,26,22,.04),0_8px_24px_-18px_rgba(14,26,22,.35)]">
                  
                  <div className="flex items-center gap-[12px] p-[13px_15px] border-b border-[#e8edeb]">
                    <div>
                      <div className="text-[13.4px] font-semibold tracking-[-0.1px] text-[#0e1a16]">Clerk User ID</div>
                      <div className="text-[11.6px] text-[#93a19c] mt-[2px] font-mono break-all">{activeUser.id}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-[12px] p-[13px_15px]">
                    <div>
                      <div className="text-[13.4px] font-semibold tracking-[-0.1px] text-[#0e1a16]">Last Sign In</div>
                      <div className="text-[11.8px] text-[#93a19c] mt-[2px]">
                        {activeUser.lastSignInAt ? new Date(activeUser.lastSignInAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }) : 'Never'}
                      </div>
                    </div>
                  </div>

                </div>

                {tempPassword && (
                  <div className="mt-[20px] bg-[#fdf6e6] border border-[#f2e3c2] rounded-[16px] overflow-hidden shadow-[0_1px_2px_rgba(14,26,22,.04)]">
                    <div className="p-[13px_15px] border-b border-[#f2e3c2]/50">
                      <div className="text-[13.4px] font-semibold tracking-[-0.1px] text-[#6f4a0e]">Temporary Password Generated</div>
                      <div className="text-[11.8px] text-[#8a5b12] mt-[2px] opacity-80">Share securely. The user must change it upon login.</div>
                    </div>
                    <div className="p-[15px] bg-white text-center">
                       <span className="font-mono text-lg tracking-widest font-bold text-[#6f4a0e]">{tempPassword}</span>
                    </div>
                  </div>
                )}
              
              {isFetchingProfile ? (
                <div className="flex justify-center items-center py-6 mt-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div>
                </div>
              ) : employeeProfile ? (
                <div className="mt-[24px]">
                  <div className="text-[10.5px] tracking-[0.14em] uppercase text-[#9ca3af] font-bold m-[10px_0_9px]">Hajj Savings Profile</div>
                  
                  <div className="bg-white border border-[#e5e7eb] rounded-[16px] p-[16px_17px] shadow-[0_1px_2px_rgba(14,26,22,.04),0_8px_24px_-18px_rgba(14,26,22,.35)] mb-4">
                    <div className="flex items-end justify-between gap-[12px]">
                      <div>
                        <div className="text-[11px] text-[#9ca3af] font-semibold">Total savings balance</div>
                        <b className="block mt-[4px] text-[27px] font-extrabold tracking-[-1px] tabular-nums leading-none text-[#111827]">£{(employeeProfile.balance || 0).toFixed(2)}</b>
                      </div>
                      <div className="text-right">
                        <div className="text-[11px] text-[#9ca3af] font-semibold">Monthly contribution</div>
                        <b className="text-[16px] tracking-[-0.4px] text-[#4b5563]">£{(employeeProfile.monthlyContribution || 0).toFixed(2)}</b>
                      </div>
                    </div>
                  </div>

                  <div className="text-[10.5px] tracking-[0.14em] uppercase text-[#9ca3af] font-bold m-[20px_0_9px]">Compliance & Status</div>
                  
                  <div className="bg-white border border-[#e5e7eb] rounded-[16px] overflow-hidden shadow-[0_1px_2px_rgba(14,26,22,.04),0_8px_24px_-18px_rgba(14,26,22,.35)]">
                    <div className="flex items-center gap-[12px] p-[13px_15px] border-b border-[#e5e7eb]">
                      <div className="w-[30px] h-[30px] shrink-0 rounded-[9px] grid place-items-center bg-[#ecfdf5] text-[#059669]">
                        <svg viewBox="0 0 24 24" className="w-[15px] h-[15px] stroke-current stroke-[1.8] fill-none"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                      </div>
                      <div>
                        <div className="text-[13.4px] font-semibold tracking-[-0.1px] text-[#111827]">Shariah agreement</div>
                        <div className="text-[11.8px] text-[#6b7280] mt-[2px]">Master agreement v2</div>
                      </div>
                      <div className="ml-auto text-right flex flex-col items-end gap-[4px]">
                        {employeeProfile.agreementStatus === 'signed' ? (
                          <span className="text-[11px] font-bold px-[10px] py-[4px] rounded-full whitespace-nowrap bg-[#ecfdf5] text-[#059669] border border-[#a7f3d0]">Signed</span>
                        ) : (
                          <span className="text-[11px] font-bold px-[10px] py-[4px] rounded-full whitespace-nowrap bg-[#fefce8] text-[#ca8a04] border border-[#fef08a]">Pending</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-[12px] p-[13px_15px] border-b border-[#e5e7eb]">
                      <div className="w-[30px] h-[30px] shrink-0 rounded-[9px] grid place-items-center bg-[#ecfdf5] text-[#059669]">
                        <svg viewBox="0 0 24 24" className="w-[15px] h-[15px] stroke-current stroke-[1.8] fill-none"><rect x="3" y="6" width="18" height="12" rx="2"/><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h3"/></svg>
                      </div>
                      <div>
                        <div className="text-[13.4px] font-semibold tracking-[-0.1px] text-[#111827]">Subscription</div>
                        <div className="text-[11.8px] text-[#6b7280] mt-[2px]">Direct debit · Stripe</div>
                      </div>
                      <div className="ml-auto text-right flex flex-col items-end gap-[4px]">
                        {employeeProfile.subscriptionStatus === 'active' ? (
                          <span className="text-[11px] font-bold px-[10px] py-[4px] rounded-full whitespace-nowrap bg-[#ecfdf5] text-[#059669] border border-[#a7f3d0]">Active</span>
                        ) : (
                          <span className="text-[11px] font-bold px-[10px] py-[4px] rounded-full whitespace-nowrap bg-[#f3f4f6] text-[#6b7280] border border-[#e5e7eb]">Inactive</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-[12px] p-[13px_15px]">
                      <div className="w-[30px] h-[30px] shrink-0 rounded-[9px] grid place-items-center bg-[#ecfdf5] text-[#059669]">
                        <svg viewBox="0 0 24 24" className="w-[15px] h-[15px] stroke-current stroke-[1.8] fill-none"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4h16v6a8 8 0 01-16 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M9 20h6M12 18v2"/></svg>
                      </div>
                      <div>
                        <div className="text-[13.4px] font-semibold tracking-[-0.1px] text-[#111827]">Hajj award</div>
                        <div className="text-[11.8px] text-[#6b7280] mt-[2px]">Monthly draw eligibility</div>
                      </div>
                      <div className="ml-auto text-right flex flex-col items-end gap-[4px]">
                        <span className="text-[11px] font-bold px-[10px] py-[4px] rounded-full whitespace-nowrap bg-[#f3f4f6] text-[#6b7280] border border-[#e5e7eb]">
                          {employeeProfile.awardStatus ? employeeProfile.awardStatus.charAt(0).toUpperCase() + employeeProfile.awardStatus.slice(1) : 'None'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
              </div>

              
              
              {/* Action Footer */}
              <div className="p-[13px_20px] border-t border-[#e8edeb] bg-white grid grid-cols-3 gap-[9px] shrink-0">
                <button 
                  onClick={handleResetPassword}
                  disabled={isResetting || activeUser.publicMetadata?.isSuspended}
                  className="cursor-pointer font-inherit font-semibold text-[13.4px] p-[11px_16px] rounded-[11px] inline-flex items-center justify-center gap-[8px] w-full bg-white border border-[#e8edeb] text-[#0e1a16] hover:bg-[#f4f8f6] transition-colors disabled:opacity-50"
                >
                  {isResetting && (
                    <svg className="animate-spin h-[14px] w-[14px]" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  )}
                  {isResetting ? 'Resetting...' : 'Reset Password'}
                </button>
                
                <button 
                  onClick={handleToggleSuspend}
                  disabled={isSuspending}
                  className={`cursor-pointer font-inherit font-semibold text-[13.4px] p-[11px_16px] rounded-[11px] inline-flex items-center justify-center gap-[8px] w-full bg-white border transition-colors disabled:opacity-50 ${
                    activeUser.publicMetadata?.isSuspended 
                      ? 'border-[#e8edeb] text-[#0e1a16] hover:bg-[#f4f8f6]' 
                      : 'border-[#f6cfcc] text-[#a3271f] hover:bg-[#fdeceb]'
                  }`}
                >
                  {isSuspending && (
                    <svg className="animate-spin h-[14px] w-[14px]" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  )}
                  {isSuspending ? 'Updating...' : (activeUser.publicMetadata?.isSuspended ? 'Unsuspend User' : 'Suspend User')}
                </button>
                
                <button 
                  onClick={handleDeleteUser}
                  disabled={isDeleting}
                  className="cursor-pointer font-inherit font-semibold text-[13.4px] p-[11px_16px] rounded-[11px] inline-flex items-center justify-center gap-[8px] w-full bg-red-600 border border-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {isDeleting && (
                    <svg className="animate-spin h-[14px] w-[14px]" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  )}
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </>
          )}
        </aside>
      </>

    
</SidebarLayout>
  );
};
