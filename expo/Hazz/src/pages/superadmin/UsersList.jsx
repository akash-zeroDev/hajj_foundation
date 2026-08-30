import { useAuth } from '@clerk/react';
import React, { useState, useEffect } from 'react';
import SidebarLayout from '../../layouts/SidebarLayout';
import SearchFilterBar from '../../components/SearchFilterBar';
import { superAdminNavigation } from '../../config/navigation';

export const UsersList = () => {
  const { getToken } = useAuth(); // UsersList
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeUser, setActiveUser] = useState(null); // Controls the Sidecard

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = await getToken();
        console.log('FRONTEND TOKEN:', token ? token.substring(0, 20) + '...' : 'NULL');
        const res = await fetch('http://localhost:5000/api/users', { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to fetch users');
        setUsers(Array.isArray(data) ? data : (data.data || []));
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

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

      <SearchFilterBar 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm} 
        filterStatus={filterStatus} 
        setFilterStatus={setFilterStatus} 
        statusOptions={[]} 
        placeholder="Search users by name or email..." 
      />

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-sm text-slate-500 bg-slate-50">
              <th className="px-6 py-4 font-medium">User Details</th>
              <th className="px-6 py-4 font-medium">Primary Email</th>
              <th className="px-6 py-4 font-medium">Joined Date</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr><td colSpan="4" className="text-center py-12 text-slate-500">Loading users...</td></tr>
            ) : filteredUsers.length === 0 ? (
              <tr><td colSpan="4" className="text-center py-12 text-slate-500">No users found.</td></tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => { setActiveUser(user); setSelectedUser(user); }}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={user.imageUrl} alt="" className="w-10 h-10 rounded-full border border-slate-200" />
                      <div>
                        <div className="font-medium text-slate-900">
                          {user.firstName || user.lastName ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : (
  <span className="italic text-slate-500 font-normal">
    {user.emailAddresses?.[0]?.emailAddress?.split('@')[0] || 'Awaiting setup'}
  </span>
)}
                        </div>
                        <div className="text-xs text-slate-500">ID: {user.id.substring(0, 15)}...</div>
                      </div>
                    </div>
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

      {/* Sidecard Overlay */}
      <>
        <div 
          className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${selectedUser ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
          onClick={() => setSelectedUser(null)}
        ></div>
        <div className={`fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 overflow-y-auto transform transition-transform duration-300 ease-in-out border-l border-slate-200 flex flex-col ${selectedUser ? 'translate-x-0' : 'translate-x-full'}`}>
          
          <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
            <h2 className="text-lg font-bold text-slate-900">User Profile</h2>
            <button onClick={() => setSelectedUser(null)} className="text-slate-400 hover:text-slate-600 p-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="p-6 flex-grow flex flex-col items-center">
            {activeUser && (
              <>
                <img src={activeUser.imageUrl} alt="" className="w-24 h-24 rounded-full border-4 border-white shadow-md mb-4" />
                <h3 className="text-2xl font-bold text-slate-900">
                  {activeUser.firstName || activeUser.lastName ? `${activeUser.firstName || ''} ${activeUser.lastName || ''}`.trim() : (
                    <span className="italic text-slate-400 font-normal">
                      {activeUser.emailAddresses?.[0]?.emailAddress?.split('@')[0] || 'Awaiting setup'}
                    </span>
                  )}
                </h3>
                <p className="text-emerald-600 font-medium mb-8">{activeUser.emailAddresses?.[0]?.emailAddress}</p>

                <div className="w-full space-y-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Clerk User ID</p>
                    <p className="text-sm font-mono text-slate-800 break-all">{activeUser.id}</p>
                  </div>
                  
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Last Sign In</p>
                    <p className="text-sm text-slate-800">
                      {activeUser.lastSignInAt ? new Date(activeUser.lastSignInAt).toLocaleString() : 'Never'}
                    </p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Account Status</p>
                    <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium border bg-emerald-50 text-emerald-700 border-emerald-200">
                      Active
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="p-6 border-t border-slate-200 bg-slate-50 flex gap-3">
             <button className="flex-1 py-2.5 border border-slate-300 bg-white rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 transition shadow-sm">
               Reset Password
             </button>
             <button className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-bold transition shadow-sm">
               Suspend User
             </button>
          </div>

        </div>
      </>

    </SidebarLayout>
  );
};
