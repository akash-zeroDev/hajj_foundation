import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/react';
import SidebarLayout from '../../layouts/SidebarLayout';
import { superAdminNavigation } from '../../config/navigation';

export const AwardsManagement = () => {
  const { getToken } = useAuth();
  const [draws, setDraws] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Draw form state
  const [drawName, setDrawName] = useState('');
  const [numWinners, setNumWinners] = useState(1);
  const [isDrawing, setIsDrawing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchDraws = async () => {
    try {
      setIsLoading(true);
      const token = await getToken();
      const res = await fetch('http://localhost:5000/api/awards', {
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
      const res = await fetch('http://localhost:5000/api/awards/run-draw', {
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

  const handleAction = async (drawId, action) => {
    if (!window.confirm(`Are you sure you want to ${action} this draw?`)) return;
    try {
      const token = await getToken();
      const res = await fetch(`http://localhost:5000/api/awards/${action}-draw/${drawId}`, {
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
      alert('An error occurred.');
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
          <button 
            type="submit"
            disabled={isDrawing}
            className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isDrawing ? 'Executing...' : 'Run Random Draw'}
          </button>
        </form>
        {errorMsg && <p className="text-red-500 text-sm mt-3 font-medium">{errorMsg}</p>}
      </div>

      {/* Pending Approvals */}
      {pendingDraws.length > 0 && (
        <div className="mb-8 border-2 border-amber-400 bg-amber-50 rounded-xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-amber-200 bg-amber-100 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-amber-900">Pending Approvals</h2>
              <p className="text-amber-700 text-sm mt-0.5">These draws have been executed but winners are not yet notified.</p>
            </div>
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </span>
          </div>
          
          <div className="divide-y divide-amber-200">
            {pendingDraws.map(draw => (
              <div key={draw._id} className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-amber-900">{draw.drawName}</h3>
                    <p className="text-amber-700 text-sm">Executed on {new Date(draw.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="flex gap-3 w-full sm:w-auto">
                    <button 
                      onClick={() => handleAction(draw._id, 'discard')}
                      className="flex-1 px-4 py-2 bg-white text-red-600 border border-red-200 hover:bg-red-50 font-medium rounded-lg transition"
                    >
                      Discard Draw
                    </button>
                    <button 
                      onClick={() => handleAction(draw._id, 'approve')}
                      className="flex-1 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg shadow-sm transition"
                    >
                      Approve Winners
                    </button>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg border border-amber-200 overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-amber-50 text-amber-800 font-medium border-b border-amber-200">
                      <tr>
                        <th className="px-4 py-2">#</th>
                        <th className="px-4 py-2">Employee Name</th>
                        <th className="px-4 py-2">Organisation</th>
                        <th className="px-4 py-2">Email</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-amber-100">
                      {draw.winners.map((winner, idx) => (
                        <tr key={winner._id}>
                          <td className="px-4 py-2 font-medium text-amber-900">{idx + 1}</td>
                          <td className="px-4 py-2">{winner.firstName} {winner.lastName}</td>
                          <td className="px-4 py-2">{winner.companyName || 'Unknown'}</td>
                          <td className="px-4 py-2 text-slate-500">{winner.email}</td>
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
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-slate-500">Loading history...</td>
                </tr>
              ) : pastDraws.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-slate-500">No past draws found.</td>
                </tr>
              ) : (
                pastDraws.map(draw => (
                  <tr key={draw._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900">
                      {draw.drawName}
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </SidebarLayout>
  );
};
