import { useAuth } from '@clerk/react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SidebarLayout from '../../layouts/SidebarLayout';
import { superAdminNavigation } from '../../config/navigation';

export const OrganisationDetails = () => {
  const { getToken } = useAuth(); // OrganisationDetails
  const { id } = useParams();
  const navigate = useNavigate();
  const [org, setOrg] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Employees State
  const [employees, setEmployees] = useState(null);
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
          const res = await fetch(`http://localhost:5000/api/organisations/${id}/employees`, { headers: { Authorization: `Bearer ${await getToken()}` } });
          if (!res.ok) throw new Error('Failed to fetch employees');
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || 'Failed');
          setEmployees(Array.isArray(data) ? data : []);
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
        <div className="px-6 py-6 sm:px-8 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
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
          <div className="flex gap-2">
            <button 
              onClick={() => setIsConfirmingArchive(true)}
              className="px-4 py-2 border border-slate-300 rounded-lg shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              Archive Org
            </button>
            <button 
              onClick={handleToggleSuspension}
              className={`px-4 py-2 border rounded-lg shadow-sm text-sm font-medium transition ${
                org.isSuspended 
                  ? 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100' 
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {org.isSuspended ? 'Activate Account' : 'Suspend Account'}
            </button>
            <button 
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-emerald-600 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white hover:bg-emerald-700 transition"
            >
              Edit Organisation
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-50/50 px-6 sm:px-8 border-b border-slate-200">
          <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${activeTab === tab.id
                    ? 'border-emerald-600 text-emerald-700'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }
                `}
              >
                {tab.name}
              </button>
            ))}
          </nav>
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
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
            <h3 className="font-bold text-slate-800">Organisation Members</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-sm text-slate-500 bg-white">
                  <th className="px-6 py-4 font-medium">Name</th>
                  <th className="px-6 py-4 font-medium">System Role</th>
                  <th className="px-6 py-4 font-medium">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoadingEmployees ? (
                  <tr><td colSpan="3" className="text-center py-8 text-slate-500">Loading employees...</td></tr>
                ) : (employees || []).length === 0 ? (
                  <tr><td colSpan="3" className="text-center py-8 text-slate-500">No employees found.</td></tr>
                ) : (
                  (employees || []).map((member) => (
                    <tr key={member.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => { setActiveMember(member); setSelectedMember(member); }}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {member.publicUserData.imageUrl && (
                            <img src={member.publicUserData.imageUrl} alt="" className="w-8 h-8 rounded-full border border-slate-200" />
                          )}
                          <div>
                            <div className="font-medium text-slate-900">
                              {member.publicUserData.firstName || member.publicUserData.lastName ? `${member.publicUserData.firstName || ''} ${member.publicUserData.lastName || ''}`.trim() : (
  <span className="italic text-slate-500 font-normal">
    {member.publicUserData.identifier?.split('@')[0] || 'Awaiting setup'}
  </span>
)}
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
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Content: OTHER TABS */}
      {activeTab !== 'overview' && activeTab !== 'employees' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="mt-2 text-sm font-semibold text-slate-900">Module Under Construction</h3>
          <p className="mt-1 text-sm text-slate-500">The {tabs.find(t => t.id === activeTab)?.name} section will be built here next.</p>
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

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
            <div className="fixed inset-0 bg-slate-900/50 transition-opacity" onClick={() => setIsEditing(false)}></div>
            <div className="relative bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-lg w-full p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-6">Edit Organisation Details</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Organisation Name</label>
                  <input 
                    type="text" 
                    value={editFormData.name} 
                    onChange={e => setEditFormData({...editFormData, name: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Company Number</label>
                  <input 
                    type="text" 
                    value={editFormData.companyNumber} 
                    onChange={e => setEditFormData({...editFormData, companyNumber: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Annual Fee (£)</label>
                  <input 
                    type="number" 
                    value={editFormData.annualFee} 
                    onChange={e => setEditFormData({...editFormData, annualFee: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Registered Address</label>
                  <textarea 
                    rows="3"
                    value={editFormData.registeredAddress} 
                    onChange={e => setEditFormData({...editFormData, registeredAddress: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <button 
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveEdit}
                  disabled={isSaving}
                  className="px-4 py-2 bg-emerald-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
    
      {/* Employee Details Side Panel */}
      <>
        <div 
          className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] transition-opacity duration-300 ${selectedMember ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
          onClick={() => setSelectedMember(null)}
        ></div>
        <div className={`fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-[70] overflow-y-auto transform transition-transform duration-300 ease-in-out border-l border-slate-200 flex flex-col ${selectedMember ? 'translate-x-0' : 'translate-x-full'}`}>
          
          <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
            <h2 className="text-lg font-bold text-slate-900">Employee Profile</h2>
            <button onClick={() => setSelectedMember(null)} className="text-slate-400 hover:text-slate-600 p-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="p-6 flex-grow flex flex-col items-center">
            {activeMember && (
              <>
                {activeMember.publicUserData.imageUrl && (
                  <img src={activeMember.publicUserData.imageUrl} alt="" className="w-24 h-24 rounded-full border-4 border-white shadow-md mb-4" />
                )}
                <h3 className="text-2xl font-bold text-slate-900">
                  {activeMember.publicUserData.firstName || activeMember.publicUserData.lastName 
                    ? `${activeMember.publicUserData.firstName || ''} ${activeMember.publicUserData.lastName || ''}`.trim() 
                    : (
                      <span className="italic text-slate-400 font-normal">
                        {activeMember.publicUserData.identifier?.split('@')[0] || 'Awaiting setup'}
                      </span>
                    )
                  }
                </h3>
                <p className="text-emerald-600 font-medium mb-8">{activeMember.publicUserData.identifier}</p>

                <div className="w-full space-y-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Clerk User ID</p>
                    <p className="text-sm font-mono text-slate-800 break-all">{activeMember.publicUserData.userId}</p>
                  </div>
                  
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Role in Organisation</p>
                    <p className="text-sm text-slate-800 capitalize">
                      {activeMember.role === 'org:admin' ? 'Administrator' : 'Employee'}
                    </p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Joined Date</p>
                    <p className="text-sm text-slate-800">
                      {new Date(activeMember.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
          
          <div className="p-6 border-t border-slate-200 bg-slate-50">
            <button 
              onClick={() => setSelectedMember(null)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 transition-colors shadow-sm"
            >
              Close Profile
            </button>
          </div>
        </div>
      </>

    </SidebarLayout>
  );
};
