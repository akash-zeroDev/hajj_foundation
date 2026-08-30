import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@clerk/react';
import SidebarLayout from '../../layouts/SidebarLayout';
import { superAdminNavigation } from '../../config/navigation';

export const DocumentManagement = () => {
  const { getToken } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Upload State
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [forceResign, setForceResign] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  
  const fileInputRef = useRef(null);

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      const token = await getToken();
      const res = await fetch('http://localhost:5000/api/documents', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDocuments(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching documents:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.type !== 'application/pdf') {
        setIsError(true);
        setMessage('Only PDF files are allowed.');
        e.target.value = '';
        setFile(null);
        return;
      }
      if (selected.size > 10 * 1024 * 1024) {
        setIsError(true);
        setMessage('File size must be less than 10MB.');
        e.target.value = '';
        setFile(null);
        return;
      }
      setIsError(false);
      setMessage('');
      setFile(selected);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setIsError(true);
      setMessage('Please select a PDF file to upload.');
      return;
    }
    
    if (forceResign && !window.confirm("WARNING: You checked 'Force Re-sign'. This will instantly lock all existing employees out of their dashboard until they sign this new version. Are you sure?")) {
      return;
    }

    setIsUploading(true);
    setMessage('');
    
    try {
      const token = await getToken();
      const formData = new FormData();
      formData.append('title', title);
      formData.append('forceResign', forceResign);
      formData.append('agreementFile', file);

      const res = await fetch('http://localhost:5000/api/documents/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setIsError(false);
        setMessage(`Success! Version ${data.data.version} is now live.`);
        setTitle('');
        setFile(null);
        setForceResign(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
        fetchDocuments(); // Refresh list
      } else {
        setIsError(true);
        setMessage(data.message || 'Failed to upload document.');
      }
    } catch (err) {
      console.error(err);
      setIsError(true);
      setMessage('A critical error occurred while uploading.');
    } finally {
      setIsUploading(false);
    }
  };

  const activeDoc = documents.find(d => d.isActive);

  return (
    <SidebarLayout title="Document Management" navigation={superAdminNavigation}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Shariah Documents</h1>
        <p className="text-slate-500 mt-1">Upload and version control the Global Master Agreements for all employees.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Left Column: Upload Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h2 className="text-lg font-bold text-slate-800">Upload New Master Agreement</h2>
              <p className="text-sm text-slate-500">This will automatically become the new active template for all future signups.</p>
            </div>
            
            <form onSubmit={handleUpload} className="p-6 space-y-5">
              {message && (
                <div className={`p-4 rounded-lg text-sm font-medium ${isError ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                  {message}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Document Title</label>
                <input 
                  type="text" 
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Master Shariah Agreement 2026 (v2)"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">PDF File</label>
                <input 
                  type="file" 
                  accept=".pdf"
                  required
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                />
              </div>

              <div className="mt-6 p-5 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="forceResign"
                      name="forceResign"
                      type="checkbox"
                      checked={forceResign}
                      onChange={(e) => setForceResign(e.target.checked)}
                      className="focus:ring-amber-500 h-5 w-5 text-amber-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="forceResign" className="font-bold text-amber-900">
                      Force existing employees to re-sign
                    </label>
                    <p className="text-amber-700 mt-1">
                      If checked, every existing employee will be locked out of their dashboard until they read and sign this new version. If left unchecked, they are grandfathered into their old contract.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button 
                  type="submit"
                  disabled={isUploading}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Uploading to Cloud...
                    </>
                  ) : 'Publish New Version'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Active Status */}
        <div className="lg:col-span-1">
           <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col h-full">
             <h3 className="text-sm font-medium text-slate-500 mb-4 uppercase tracking-wide">Currently Active Template</h3>
             {isLoading ? (
               <p className="text-slate-500 animate-pulse">Loading...</p>
             ) : activeDoc ? (
               <div className="flex-1 flex flex-col items-center justify-center text-center">
                 <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                   <span className="text-2xl font-black">v{activeDoc.version}</span>
                 </div>
                 <h4 className="text-lg font-bold text-slate-900 mb-2">{activeDoc.title}</h4>
                 <p className="text-sm text-slate-500 mb-6">Published on {new Date(activeDoc.createdAt).toLocaleDateString()}</p>
                 <a 
                   href={activeDoc.fileUrl} 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition"
                 >
                   View PDF Document ↗
                 </a>
               </div>
             ) : (
               <div className="flex-1 flex flex-col items-center justify-center text-center">
                 <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-4">
                   <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                 </div>
                 <p className="text-slate-500 font-medium">No active templates.</p>
                 <p className="text-sm text-slate-400 mt-1">Onboarding is currently blocked.</p>
               </div>
             )}
           </div>
        </div>
      </div>

      {/* Version History */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-800">Document Version History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">Version</th>
                <th className="px-6 py-3">Title</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Date Published</th>
                <th className="px-6 py-3">Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-500">Loading history...</td>
                </tr>
              ) : documents.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-500">No documents uploaded yet.</td>
                </tr>
              ) : (
                documents.map(doc => (
                  <tr key={doc._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900">
                      v{doc.version}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700">
                      {doc.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {doc.isActive ? (
                         <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                           Active
                         </span>
                      ) : (
                         <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                           Archived
                         </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                      {new Date(doc.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:text-emerald-800 font-medium text-sm">
                        View PDF
                      </a>
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
