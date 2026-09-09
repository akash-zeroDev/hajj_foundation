import React, { useState, useEffect, useRef } from 'react';
import SidebarLayout from '../../layouts/SidebarLayout';
import PrimaryButton from '../../components/PrimaryButton';
import { useAuth } from '@clerk/react';
import { useToast } from '../../context/ToastContext';
import { superAdminNavigation } from '../../config/navigation';

const DocumentManagement = () => {
  const { getToken } = useAuth();
  const { showToast } = useToast();
  
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Upload State
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [forceResign, setForceResign] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/documents`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setDocuments(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch documents', error);
      showToast('Failed to load documents.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!title || !file) {
      showToast('Please provide a title and select a file.', 'error');
      return;
    }

    setIsUploading(true);
    try {
      const token = await getToken();
      const formData = new FormData();
      formData.append('title', title);
      formData.append('agreementFile', file);
      formData.append('forceResign', forceResign);

      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/documents/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      const data = await res.json();

      if (data.success) {
        showToast('Document uploaded successfully!', 'success');
        setTitle('');
        setFile(null);
        setForceResign(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
        fetchDocuments(); // Refresh the list
      } else {
        throw new Error(data.message || 'Upload failed');
      }
    } catch (error) {
      console.error(error);
      showToast(error.message || 'Failed to upload document.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const activeDoc = documents.find(d => d.isActive);

  return (
    <SidebarLayout navigation={superAdminNavigation} title="Document Management">
      <div className="mb-6">
        <h3 className="text-[23px] font-bold tracking-[-0.5px] text-slate-900 m-0">Shariah Documents</h3>
        <p className="mt-1.5 text-[13.5px] text-[#5c6b65]">Upload and version control the Global Master Agreements for all employees.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 items-start mb-4">
        {/* Upload Card */}
        <div className="bg-white rounded-[14px] border border-[#e6ecea] shadow-[0_1px_2px_rgba(14,26,22,0.04),0_8px_24px_-18px_rgba(14,26,22,0.35)]">
          <div className="px-[18px] py-[16px] border-b border-[#e6ecea]">
            <h4 className="text-[15px] font-bold tracking-[-0.2px] m-0 text-[#0e1a16]">Upload New Master Agreement</h4>
            <p className="mt-[3px] text-[12.5px] text-[#8a9994]">This will automatically become the new active template for all future signups.</p>
          </div>
          
          <div className="p-[18px]">
            <form onSubmit={handleUpload} className="grid gap-[16px]">
              
              <div className="grid gap-[6px]">
                <label className="text-[12.5px] font-semibold text-[#5c6b65]">Document title</label>
                <input 
                  type="text" 
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Master Shariah Agreement 2026 (v2)"
                  className="w-full text-[14px] px-[13px] py-[11px] border border-[#e6ecea] rounded-[10px] bg-white text-[#0e1a16] outline-none focus:border-[#17a377] focus:ring-[3px] focus:ring-[rgba(23,163,119,0.14)] transition-all"
                />
              </div>

              <div className="grid gap-[6px]">
                <label className="text-[12.5px] font-semibold text-[#5c6b65]">PDF file</label>
                <label className="flex items-center gap-[13px] p-[18px] border-[1.5px] border-dashed border-[#cfdcd7] rounded-[12px] bg-[#fafcfb] cursor-pointer hover:border-[#17a377] hover:bg-[rgba(23,163,119,0.06)] transition-all">
                  <div className="w-[38px] h-[38px] rounded-[11px] flex-shrink-0 grid place-items-center bg-[rgba(11,122,91,0.10)] text-[#0b7a5b]">
                    <svg className="w-[19px] h-[19px] stroke-current stroke-[1.8px] fill-none" viewBox="0 0 24 24"><path d="M12 16V4"/><path d="M8 8l4-4 4 4"/><path d="M4 16v3a1 1 0 001 1h14a1 1 0 001-1v-3"/></svg>
                  </div>
                  <div>
                    <b className="block text-[13.5px] text-[#0e1a16]">{file ? file.name : "Choose a file or drag it here"}</b>
                    <small className="text-[#8a9994] text-[12px]">{file ? (file.size / 1048576).toFixed(2) + " MB · ready" : "PDF only · max 10 MB"}</small>
                  </div>
                  <input type="file" className="hidden" accept=".pdf" required ref={fileInputRef} onChange={handleFileChange} />
                </label>
              </div>

              <label className="flex gap-[12px] p-[14px] rounded-[12px] bg-[#fdf6e6] border border-[#f2e3c2] text-[#8a5b12] cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={forceResign} 
                  onChange={(e) => setForceResign(e.target.checked)} 
                  className="appearance-none w-[17px] h-[17px] flex-shrink-0 mt-[2px] border-[1.5px] border-[#d9bd85] rounded-[5px] bg-white cursor-pointer checked:bg-[#0b7a5b] checked:border-[#0b7a5b] relative checked:after:content-[''] checked:after:absolute checked:after:w-[9px] checked:after:h-[5px] checked:after:border-l-[2px] checked:after:border-b-[2px] checked:after:border-white checked:after:-rotate-45 checked:after:left-[2.5px] checked:after:top-[3px]" 
                />
                <div>
                  <b className="block text-[13.2px] font-bold text-[#6f4a0e]">Force existing employees to re-sign</b>
                  <p className="mt-[4px] text-[12.6px] leading-[1.55]">If checked, every existing employee will be locked out of their dashboard until they read and sign this new version. If left unchecked, they are grandfathered into their old contract.</p>
                </div>
              </label>

              <div className="flex items-center pt-[16px] border-t border-[#e6ecea]">
                <PrimaryButton 
                  type="submit" 
                  isLoading={isUploading}
                  icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12l5 5L20 7" /></svg>}
                  className="ml-auto"
                >
                  {isUploading ? 'Uploading...' : 'Publish new version'}
                </PrimaryButton>
              </div>
            </form>
          </div>
        </div>

      </div>

      {/* History Table */}
      <div className="bg-white rounded-[14px] border border-[#e6ecea] shadow-[0_1px_2px_rgba(14,26,22,0.04),0_8px_24px_-18px_rgba(14,26,22,0.35)]">
        <div className="px-[18px] py-[16px] border-b border-[#e6ecea]">
          <h4 className="text-[15px] font-bold tracking-[-0.2px] m-0 text-[#0e1a16]">Document Version History</h4>
          <p className="mt-[3px] text-[12.5px] text-[#8a9994]">Every published version stays available for audit.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-[#fafcfb]">
                <th className="px-[18px] py-[13px] border-b border-[#e6ecea] text-[11px] tracking-[0.1em] uppercase text-[#8a9994] font-bold">Version</th>
                <th className="px-[18px] py-[13px] border-b border-[#e6ecea] text-[11px] tracking-[0.1em] uppercase text-[#8a9994] font-bold">Title</th>
                <th className="px-[18px] py-[13px] border-b border-[#e6ecea] text-[11px] tracking-[0.1em] uppercase text-[#8a9994] font-bold">Status</th>
                <th className="px-[18px] py-[13px] border-b border-[#e6ecea] text-[11px] tracking-[0.1em] uppercase text-[#8a9994] font-bold">Date published</th>
                <th className="px-[18px] py-[13px] border-b border-[#e6ecea] text-[11px] tracking-[0.1em] uppercase text-[#8a9994] font-bold">Link</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [1,2,3].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-[18px] py-4"><div className="h-3 bg-slate-200 rounded w-12" /></td>
                    <td className="px-[18px] py-4"><div className="h-3 bg-slate-200 rounded w-40" /></td>
                    <td className="px-[18px] py-4"><div className="h-5 bg-slate-200 rounded-full w-16" /></td>
                    <td className="px-[18px] py-4"><div className="h-3 bg-slate-200 rounded w-24" /></td>
                    <td className="px-[18px] py-4"><div className="h-3 bg-slate-200 rounded w-16" /></td>
                  </tr>
                ))
              ) : documents.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-[18px] py-8 text-center text-[#8a9994]">No documents uploaded yet.</td>
                </tr>
              ) : (
                documents.map(doc => (
                  <tr key={doc._id} className="hover:bg-[#fafcfb] group transition-colors">
                    <td className="px-[18px] py-[13px] border-b border-[#e6ecea] text-[13.2px] text-[#0e1a16] group-last:border-0"><b className="font-semibold">v{doc.version}</b></td>
                    <td className="px-[18px] py-[13px] border-b border-[#e6ecea] text-[13.2px] text-[#0e1a16] group-last:border-0">{doc.title}</td>
                    <td className="px-[18px] py-[13px] border-b border-[#e6ecea] text-[13.2px] group-last:border-0">
                      <span className={`inline-block text-[11px] font-bold px-[9px] py-[3px] rounded-full ${doc.isActive ? 'bg-[rgba(23,163,119,0.14)] text-[#0b7a5b]' : 'bg-[#eef1f0] text-[#8a9994]'}`}>
                        {doc.isActive ? 'Active' : 'Archived'}
                      </span>
                    </td>
                    <td className="px-[18px] py-[13px] border-b border-[#e6ecea] text-[13.2px] text-[#5c6b65] tabular-nums group-last:border-0">
                      {new Date(doc.createdAt).toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="px-[18px] py-[13px] border-b border-[#e6ecea] text-[13.2px] group-last:border-0">
                      <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="text-[#0b7a5b] font-semibold no-underline hover:underline">View PDF</a>
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

export default DocumentManagement;
export { DocumentManagement };
