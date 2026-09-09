import EmployeeProfileSidecar from '../../components/EmployeeProfileSidecar';
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
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/users`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch users');
      
      const allUsers = Array.isArray(data) ? data : (data.data || []);
      // Only show real users (those with an email address) - this excludes Clerk system/org machine accounts
      const activeUsers = allUsers.filter(u => u.emailAddresses && u.emailAddresses.length > 0);
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
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/users/${activeUser.id}/reset-password`, {
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
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/users/${activeUser.id}`, {
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
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/users/${activeUser.id}/toggle-suspend`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        const action = data.banned ? 'suspended' : 'unsuspended';
        showToast(`User successfully ${action}.`, 'success');
        
        // Update local state to reflect change without full refetch
        const updatedUser = { ...activeUser, publicMetadata: { ...(activeUser.publicMetadata || {}), isSuspended: data.banned } };
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
      const apiUrl = import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}`;
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


      <EmployeeProfileSidecar 
        isOpen={!!selectedUser}
        onClose={handleCloseSidecard}
        activeMember={activeUser}
        employeeProfile={employeeProfile}
        isFetchingProfile={isFetchingProfile}
        customFooter={
          <>
            {tempPassword && (
              <div className="px-5 py-4 bg-emerald-50 border-t border-emerald-100 flex flex-col gap-2 shrink-0">
                <div className="flex items-center gap-2 text-emerald-800 text-[13px] font-medium">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  Temporary Password Generated
                </div>
                <div className="bg-white px-3 py-2 rounded-md border border-emerald-200 font-mono text-[14px] font-bold text-center tracking-wider text-emerald-900 select-all">
                  {tempPassword}
                </div>
                <div className="text-[11px] text-emerald-600 text-center leading-tight">
                  Please copy and share this password securely. It will not be shown again.
                </div>
              </div>
            )}
            {/* Action Footer */}
              <div className="p-[13px_20px] border-t border-[#e8edeb] bg-white grid grid-cols-3 gap-[9px] shrink-0">
                <button 
                  onClick={handleResetPassword}
                  disabled={isResetting || activeUser?.publicMetadata?.isSuspended}
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
                    activeUser?.publicMetadata?.isSuspended 
                      ? 'border-[#e8edeb] text-[#0e1a16] hover:bg-[#f4f8f6]' 
                      : 'border-[#f6cfcc] text-[#a3271f] hover:bg-[#fdeceb]'
                  }`}
                >
                  {isSuspending && (
                    <svg className="animate-spin h-[14px] w-[14px]" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  )}
                  {isSuspending ? 'Updating...' : (activeUser?.publicMetadata?.isSuspended ? 'Unsuspend User' : 'Suspend User')}
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
        }
      />
    
    </SidebarLayout>
  );
};
