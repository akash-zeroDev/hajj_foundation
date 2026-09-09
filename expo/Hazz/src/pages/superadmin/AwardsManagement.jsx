import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '@clerk/react';
import SidebarLayout from '../../layouts/SidebarLayout';
import PrimaryButton from '../../components/PrimaryButton';
import { superAdminNavigation } from '../../config/navigation';

export const AwardsManagement = () => {
  const { showToast } = useToast();
  const { getToken } = useAuth();
  const [draws, setDraws] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Draw form state
  const [drawName, setDrawName] = useState('');
  const [numWinners, setNumWinners] = useState(1);
  const [isDrawing, setIsDrawing] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, action: "", drawId: null });
  const [errorMsg, setErrorMsg] = useState('');
  const [expandedDrawId, setExpandedDrawId] = useState(null);

  const fetchDraws = async () => {
    try {
      setIsLoading(true);
      const token = await getToken();
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/awards`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDraws(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching draws:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDraws();
  }, []);

  const handleRunDraw = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsDrawing(true);
    try {
      const token = await getToken();
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/awards/run-draw`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ drawName, numberOfWinners: parseInt(numWinners) })
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.message || 'Failed to run draw');
      } else {
        setDrawName('');
        setNumWinners(1);
        fetchDraws(); // refresh the list
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('An error occurred while running the draw.');
    } finally {
      setIsDrawing(false);
    }
  };

  const handleActionClick = (drawId, action) => {
    setConfirmModal({ isOpen: true, action, drawId });
  };

  const executeAction = async () => {
    const { drawId, action } = confirmModal;
    setConfirmModal({ isOpen: false, action: "", drawId: null });
    try {
      const token = await getToken();
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/awards/${action}-draw/${drawId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchDraws();
      } else {
        const data = await res.json();
        alert(data.message || `Failed to ${action} draw`);
      }
    } catch (err) {
      console.error(err);
      showToast('An error occurred.', 'error');
    }
  };

  const pendingDraws = draws.filter(d => d.status === 'pending_approval');
  const pastDraws = draws.filter(d => d.status !== 'pending_approval');

  return (
    <SidebarLayout title="Awards Management" navigation={superAdminNavigation}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Hajj Awards Draw</h1>
        <p className="text-slate-500 mt-1">Execute secure random draws to select employees for Hajj.</p>
      </div>

      {/* Control Panel */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-8">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Initiate New Draw</h2>
        <form onSubmit={handleRunDraw} className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-slate-700 mb-1">Draw Name / Reference</label>
            <input 
              type="text" 
              required
              value={drawName}
              onChange={(e) => setDrawName(e.target.value)}
              placeholder="e.g. Hajj 2026 Quarter 3"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          <div className="w-full sm:w-48">
            <label className="block text-sm font-medium text-slate-700 mb-1">Number of Winners</label>
            <input 
              type="number" 
              min="1" 
              required
              value={numWinners}
              onChange={(e) => setNumWinners(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          <PrimaryButton 
            type="submit"
            isLoading={isDrawing}
            className="w-full sm:w-auto"
          >
            {isDrawing ? 'Executing...' : 'Run Random Draw'}
          </PrimaryButton>
        </form>
        {errorMsg && <p className="text-red-500 text-sm mt-3 font-medium">{errorMsg}</p>}
      </div>

      {/* Pending Approvals */}
      {pendingDraws.length > 0 && (
        <div className="mb-8 border border-slate-200 bg-white rounded-2xl overflow-hidden shadow-sm">
          <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold text-slate-900">Pending Approvals</h2>
                
              </div>
              <p className="text-slate-500 text-sm mt-1">These draws have been executed but winners are not yet notified.</p>
            </div>
          </div>
          
          <div className="divide-y divide-slate-100">
            {pendingDraws.map(draw => (
              <div key={draw._id} className="p-6 bg-slate-50/50">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{draw.drawName}</h3>
                    <p className="text-slate-500 text-sm mt-0.5">Executed on {new Date(draw.createdAt).toLocaleString('en-GB')}</p>
                  </div>
                  <div className="flex gap-3 w-full sm:w-auto">
                    <button 
                      onClick={() => handleActionClick(draw._id, 'discard')}
                      className="flex-1 sm:flex-none px-4 py-2.5 bg-white text-slate-600 border border-slate-200 hover:border-red-200 hover:bg-red-50 hover:text-red-600 text-sm font-semibold rounded-lg transition"
                    >
                      Discard Draw
                    </button>
                    <button 
                      onClick={() => handleActionClick(draw._id, 'approve')}
                      className="flex-1 sm:flex-none px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg shadow-sm transition"
                    >
                      Approve Winners
                    </button>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                      <tr>
                        <th className="px-5 py-3">#</th>
                        <th className="px-5 py-3">Employee Name</th>
                        <th className="px-5 py-3">Organisation</th>
                        <th className="px-5 py-3">Email</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {draw.winners.map((winner, idx) => (
                        <tr key={winner._id}>
                          <td className="px-5 py-3 font-medium text-slate-400">{idx + 1}</td>
                          <td className="px-5 py-3 font-medium text-slate-900">{winner.firstName} {winner.lastName}</td>
                          <td className="px-5 py-3 text-slate-600">{winner.organisationId?.name || 'Unknown'}</td>
                          <td className="px-5 py-3 text-slate-500">{winner.email || 'Protected (Clerk)'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Draw History */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-800">Draw History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">Draw Name</th>
                <th className="px-6 py-3">Date Executed</th>
                <th className="px-6 py-3">Winners Selected</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                [1,2,3].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-3 bg-slate-200 rounded w-32" /></td>
                    <td className="px-6 py-4"><div className="h-3 bg-slate-200 rounded w-24" /></td>
                    <td className="px-6 py-4"><div className="h-3 bg-slate-200 rounded w-16" /></td>
                    <td className="px-6 py-4"><div className="h-5 bg-slate-200 rounded-full w-20" /></td>
                  </tr>
                ))
              ) : pastDraws.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-slate-500">No past draws found.</td>
                </tr>
              ) : (
                pastDraws.map(draw => (
                  <React.Fragment key={draw._id}>
                    <tr 
                      className="hover:bg-slate-50 transition-colors cursor-pointer group"
                      onClick={() => setExpandedDrawId(expandedDrawId === draw._id ? null : draw._id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900 group-hover:text-emerald-700">
                        <div className="flex items-center gap-2">
                          <svg className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${expandedDrawId === draw._id ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                          {draw.drawName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                        {new Date(draw.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                        {draw.numberOfWinners} Employees
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {draw.status === 'completed' ? (
                           <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                             Approved
                           </span>
                        ) : (
                           <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                             Discarded
                           </span>
                        )}
                      </td>
                    </tr>
                    {expandedDrawId === draw._id && (
                      <tr className="bg-slate-50/50">
                        <td colSpan="4" className="px-6 py-4 border-b border-slate-200">
                          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm animate-fade-in">
                            <table className="w-full text-sm text-left">
                              <thead className="bg-slate-100 text-slate-600 font-medium border-b border-slate-200">
                                <tr>
                                  <th className="px-4 py-2 w-16">#</th>
                                  <th className="px-4 py-2">Winner Name</th>
                                  <th className="px-4 py-2">Organisation</th>
                                  <th className="px-4 py-2">Email Address</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {draw.winners.map((winner, idx) => (
                                  <tr key={winner._id || idx}>
                                    <td className="px-4 py-2.5 font-medium text-slate-500">{idx + 1}</td>
                                    <td className="px-4 py-2.5 font-bold text-slate-900">{winner.firstName} {winner.lastName}</td>
                                    <td className="px-4 py-2.5 text-slate-600">{winner.organisationId?.name || 'Unknown'}</td>
                                    <td className="px-4 py-2.5 text-slate-500">{winner.email || 'Protected (Clerk)'}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    
      {/* Custom Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all border border-slate-100">
            <div className="p-7">
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                {confirmModal.action === 'discard' ? 'Discard Draw' : 'Approve Winners'}
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Are you sure you want to {confirmModal.action} this draw? 
                {confirmModal.action === 'approve' ? ' The selected winners will be finalized and permanently recorded in the audit logs.' : ' This action will permanently delete the draw and cannot be undone.'}
              </p>
              <div className="mt-8 flex justify-end gap-3">
                <button 
                  onClick={() => setConfirmModal({ isOpen: false, action: "", drawId: null })}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={executeAction}
                  className={`px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all shadow-sm ${confirmModal.action === 'discard' ? 'bg-red-600 hover:bg-red-700 shadow-red-600/20' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'}`}
                >
                  {confirmModal.action === 'discard' ? 'Discard Draw' : 'Approve Winners'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </SidebarLayout>

  );
};
