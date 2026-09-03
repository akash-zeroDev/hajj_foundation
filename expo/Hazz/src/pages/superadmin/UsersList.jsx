import { useAuth } from '@clerk/react';
import React, { useState, useEffect } from 'react';
import SidebarLayout from '../../layouts/SidebarLayout';
import SearchFilterBar from '../../components/SearchFilterBar';
import CustomSelect from '../../components/CustomSelect';
import { FileSignature, CreditCard, Award, X } from 'lucide-react';
import { superAdminNavigation } from '../../config/navigation';
import { useToast } from '../../context/ToastContext';

export const UsersList = () => {
  const { getToken } = useAuth(); // UsersList
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeUser, setActiveUser] = useState(null); // Controls the Sidecard
  
  // Action states
  const [isResetting, setIsResetting] = useState(false);
  const [isSuspending, setIsSuspending] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [employeeProfile, setEmployeeProfile] = useState(null);
  const [isFetchingProfile, setIsFetchingProfile] = useState(false);
  const [tempPassword, setTempPassword] = useState(null);

  const handleCopyId = async (id) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(id);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = id;
        textArea.style.position = "absolute";
        textArea.style.left = "-999999px";
        document.body.prepend(textArea);
        textArea.select();
        try {
          document.execCommand('copy');
        } catch (error) {
          console.error(error);
        } finally {
          textArea.remove();
        }
      }
      showToast('ID Copied', 'success');
    } catch (err) {
      console.error('Failed to copy', err);
      showToast('Failed to copy ID', 'error');
    }
  };

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
    if (!activeUser) return;
    setIsConfirmingDelete(true);
  };
  
  const confirmDeleteUser = async () => {
    setIsConfirmingDelete(false);
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
      setSelectedUser(null);
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
        const updatedUser = { 
          ...activeUser, 
          banned: data.banned,
          publicMetadata: {
            ...activeUser.publicMetadata,
            isSuspended: data.banned
          }
        };
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
    
    const isSuspended = u.banned || u.publicMetadata?.isSuspended;
    const matchesStatus = filterStatus === 'all' || (filterStatus === 'active' && !isSuspended) || (filterStatus === 'suspended' && isSuspended);
    
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    if (sortOrder === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
    return new Date(a.createdAt) - new Date(b.createdAt);
  });

  return (
    <SidebarLayout navigation={superAdminNavigation} title="All Users">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Global User Directory</h1>
          <p className="text-sm text-slate-500">View and manage all users across all organisations.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <SearchFilterBar 
          searchTerm={searchTerm} 
          setSearchTerm={setSearchTerm} 
          placeholder="Search users by name or email..." 
          containerClassName="flex-1" 
        />
        <div className="flex flex-wrap gap-3">
          <CustomSelect
            className="min-w-[140px]"
            value={filterStatus}
            onChange={setFilterStatus}
            options={[
              { value: "all", label: "All Status" },
              { value: "active", label: "Active" },
              { value: "suspended", label: "Suspended" }
            ]}
          />
          <CustomSelect
            className="min-w-[140px]"
            value={sortOrder}
            onChange={setSortOrder}
            options={[
              { value: "newest", label: "Newest First" },
              { value: "oldest", label: "Oldest First" }
            ]}
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
              <tr><td colSpan="5" className="text-center py-12 text-slate-500">Loading users...</td></tr>
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
              <div className="bg-white text-slate-900 shrink-0 relative overflow-hidden border-b border-slate-100" style={{ minHeight: '130px', padding: '24px' }}>
                <div className="absolute top-0 right-0 w-[60%] h-full opacity-[0.15] pointer-events-none" style={{ backgroundImage: 'url(/assets/arches.png)', backgroundSize: 'cover', backgroundPosition: 'right bottom' }}></div>
                
                <button 
                  className="absolute top-[16px] right-[16px] w-[24px] h-[24px] grid place-items-center text-slate-400 hover:text-slate-700 transition-colors z-10"
                  onClick={handleCloseSidecard}
                >
                  <X className="w-[18px] h-[18px]" />
                </button>
                
                <div className="flex items-center gap-[16px] relative z-10 mt-[10px]">
                  <div className="w-[56px] h-[56px] shrink-0 rounded-full grid place-items-center text-white font-semibold text-[20px] bg-[#1a493a]">
                    {activeUser.firstName?.[0] || 'U'}{activeUser.lastName?.[0] || ''}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="m-0 text-[18px] font-bold leading-tight text-slate-900">
                      {activeUser.firstName || activeUser.lastName ? `${activeUser.firstName || ''} ${activeUser.lastName || ''}`.trim() : (
                        <span className="italic font-normal">Awaiting setup</span>
                      )}
                    </h3>
                    <a href={`mailto:${activeUser.emailAddresses?.[0]?.emailAddress}`} className="inline-block mt-[4px] text-slate-500 text-[13px] no-underline hover:underline truncate w-full">
                      {activeUser.emailAddresses?.[0]?.emailAddress}
                    </a>
                    <div className="mt-[6px]">
                      <span className={`text-[10px] font-semibold px-[8px] py-[2px] rounded-full inline-flex items-center gap-[6px] ${activeUser.publicMetadata?.isSuspended ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700'}`}>
                        <span className={`w-[5px] h-[5px] rounded-full ${activeUser.publicMetadata?.isSuspended ? 'bg-red-600' : 'bg-emerald-600'}`}></span>
                        {activeUser.publicMetadata?.isSuspended ? 'Suspended' : 'Active'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto bg-white p-[24px]">
                <div className="space-y-[28px]">
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-[12px]">Account Details</h4>
                    <div className="border border-slate-100 rounded-xl bg-white overflow-hidden shadow-sm">
                      <div className="flex items-center gap-[16px] p-[16px] border-b border-slate-100">
                        <div className="w-[36px] h-[36px] shrink-0 rounded-lg bg-emerald-50/50 flex items-center justify-center text-emerald-700 border border-emerald-100/50">
                          <CreditCard className="w-[18px] h-[18px]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] font-bold text-slate-900">Clerk User ID</div>
                          <div className="text-[12px] text-slate-500 truncate mt-[2px]">{activeUser.id}</div>
                        </div>
                        <button onClick={() => handleCopyId(activeUser.id)} className="text-slate-400 hover:text-slate-700 p-2">
                          <svg className="w-[14px] h-[14px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                        </button>
                      </div>

                      <div className="flex items-center gap-[16px] p-[16px]">
                        <div className="w-[36px] h-[36px] shrink-0 rounded-lg bg-slate-50 flex items-center justify-center text-slate-600 border border-slate-200/60">
                          <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] font-bold text-slate-900">Last Sign In</div>
                        </div>
                        <div className="text-[12px] text-slate-500">
                          {activeUser.lastSignInAt ? new Date(activeUser.lastSignInAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Never'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {employeeProfile && (
                    <div>
                      <h4 className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-[12px]">Hajj Savings Profile</h4>
                      <div className="border border-slate-100 rounded-xl bg-white p-[20px] flex items-center justify-between shadow-sm">
                        <div className="flex-1 text-center">
                          <div className="text-[11px] font-medium text-slate-500 mb-[4px]">Total savings balance</div>
                          <div className="text-[22px] font-bold text-[#1a493a]">£{employeeProfile.totalSavings?.toFixed(2) || '0.00'}</div>
                        </div>
                        <div className="w-[1px] h-[40px] bg-slate-100 mx-[10px]"></div>
                        <div className="flex-1 text-center">
                          <div className="text-[11px] font-medium text-slate-500 mb-[4px]">Monthly contribution</div>
                          <div className="text-[22px] font-bold text-[#1a493a]">£{employeeProfile.monthlyContribution?.toFixed(2) || '0.00'}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {employeeProfile && (
                    <div>
                      <h4 className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-[12px]">Compliance & Status</h4>
                      <div className="border border-slate-100 rounded-xl bg-white overflow-hidden shadow-sm">
                        
                        <div className="flex items-center gap-[16px] p-[16px] border-b border-slate-100">
                          <div className="w-[36px] h-[36px] shrink-0 rounded-lg bg-emerald-50/50 flex items-center justify-center text-emerald-700 border border-emerald-100/50">
                            <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[13px] font-bold text-slate-900">Shariah agreement</div>
                            <div className="text-[12px] text-slate-500 truncate mt-[2px]">Master agreement v2</div>
                          </div>
                          <div className="ml-auto flex items-center">
                            {employeeProfile.agreementStatus === 'signed' ? (
                              <span className="text-[11px] font-semibold px-[12px] py-[4px] rounded-full bg-white text-emerald-600 border border-emerald-200">Signed</span>
                            ) : (
                              <span className="text-[11px] font-semibold px-[12px] py-[4px] rounded-full bg-white text-amber-600 border border-amber-200">Pending</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-[16px] p-[16px] border-b border-slate-100">
                          <div className="w-[36px] h-[36px] shrink-0 rounded-lg bg-emerald-50/50 flex items-center justify-center text-emerald-700 border border-emerald-100/50">
                            <CreditCard className="w-[18px] h-[18px]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[13px] font-bold text-slate-900">Subscription</div>
                            <div className="text-[12px] text-slate-500 truncate mt-[2px]">Direct debit • Stripe</div>
                          </div>
                          <div className="ml-auto flex items-center">
                            {employeeProfile.subscriptionStatus === 'active' ? (
                              <span className="text-[11px] font-semibold px-[12px] py-[4px] rounded-full bg-white text-emerald-600 border border-emerald-200">Active</span>
                            ) : (
                              <span className="text-[11px] font-semibold px-[12px] py-[4px] rounded-full bg-white text-slate-500 border border-slate-200">Inactive</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-[16px] p-[16px]">
                          <div className="w-[36px] h-[36px] shrink-0 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500 border border-slate-200/60">
                            <Award className="w-[18px] h-[18px]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[13px] font-bold text-slate-900">Hajj award</div>
                            <div className="text-[12px] text-slate-500 truncate mt-[2px]">Monthly draw eligibility</div>
                          </div>
                          <div className="ml-auto flex items-center">
                            <span className="text-[11px] font-semibold px-[12px] py-[4px] rounded-full bg-slate-50 text-slate-500 border border-slate-200">
                              {employeeProfile.awardStatus ? employeeProfile.awardStatus.charAt(0).toUpperCase() + employeeProfile.awardStatus.slice(1) : 'None'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
                            
              {/* Action Footer */}
              <div className="p-[20px_24px_24px] bg-white grid grid-cols-3 gap-[10px] shrink-0">
                <button 
                  onClick={handleResetPassword}
                  disabled={isResetting || activeUser.publicMetadata?.isSuspended}
                  className="font-semibold text-[11px] py-[10px] rounded-lg inline-flex items-center justify-center gap-[6px] w-full bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  {isResetting ? (
                    <svg className="animate-spin h-[14px] w-[14px]" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  ) : (
                    <svg className="w-[13px] h-[13px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                  )}
                  Reset Password
                </button>
                
                <button 
                  onClick={handleToggleSuspend}
                  disabled={isSuspending}
                  className={`font-semibold text-[11px] py-[10px] rounded-lg inline-flex items-center justify-center gap-[6px] w-full bg-white border transition-colors disabled:opacity-50 ${
                    activeUser.publicMetadata?.isSuspended 
                      ? 'border-slate-200 text-slate-700 hover:bg-slate-50' 
                      : 'border-red-200 text-red-600 hover:bg-red-50'
                  }`}
                >
                  {isSuspending ? (
                    <svg className="animate-spin h-[14px] w-[14px]" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  ) : (
                    <svg className="w-[13px] h-[13px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
                  )}
                  {activeUser.publicMetadata?.isSuspended ? 'Unsuspend' : 'Suspend User'}
                </button>
                
                <button 
                  onClick={handleDeleteUser}
                  disabled={isDeleting}
                  className="font-semibold text-[11px] py-[10px] rounded-lg inline-flex items-center justify-center gap-[6px] w-full bg-[#da3b3b] text-white hover:bg-[#c93232] transition-colors disabled:opacity-50"
                >
                  {isDeleting ? (
                    <svg className="animate-spin h-[14px] w-[14px]" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  ) : (
                    <svg className="w-[13px] h-[13px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                  )}
                  Delete User
                </button>
              </div>
            </>
          )}
        </aside>
      </>

    

      {/* Delete Confirmation Modal */}
      {isConfirmingDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsConfirmingDelete(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm text-center animate-modal-pop">
            <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full mb-4 bg-red-100">
              <svg className="h-7 w-7 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            
            <h3 className="text-xl font-bold text-slate-900">Delete User?</h3>
            <p className="text-sm text-slate-500 mt-2 mb-6">
              This action cannot be undone. This will permanently remove the user from the system.
            </p>
            
            <div className="flex gap-3 justify-center">
              <button 
                onClick={() => setIsConfirmingDelete(false)}
                className="px-6 py-2.5 rounded-xl font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDeleteUser}
                className="px-6 py-2.5 rounded-xl font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-[0_4px_12px_rgba(220,38,38,0.3)]"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

</SidebarLayout>
  );
};
