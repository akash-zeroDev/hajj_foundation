import re

with open('src/pages/superadmin/DocumentManagement.jsx', 'r') as f:
    code = f.read()

# Find the start of the return statement
start_idx = code.find('  return (')
if start_idx == -1:
    print("Error: Could not find return statement")
    exit(1)

new_return = """  return (
    <SidebarLayout navigation={superAdminNavigation}>
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Page Header */}
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl font-bold text-slate-900">Document Management</h1>
          <p className="text-slate-500 text-sm">Upload and version control the Global Master Agreements for all employees.</p>
        </div>

        {/* Upload Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/50">
            <h2 className="text-lg font-bold text-slate-800">Upload New Master Agreement</h2>
            <p className="text-sm text-slate-500 mt-1">This will automatically become the active template for all future signups.</p>
          </div>
          
          <div className="p-6">
            <form onSubmit={handleUpload} className="space-y-6">
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Document Title</label>
                <input 
                  type="text" 
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Master Shariah Agreement 2026 (v2)"
                  className="w-full text-sm px-4 py-3 border border-slate-300 rounded-lg bg-white text-slate-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all placeholder:text-slate-400"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">PDF File</label>
                <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/50 transition-all group">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center bg-emerald-100 text-emerald-600 mb-4 group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6 stroke-[2px]" />
                  </div>
                  <div className="text-center">
                    <b className="block text-sm font-bold text-slate-700 mb-1">
                      {file ? file.name : "Click to upload or drag and drop"}
                    </b>
                    <span className="text-xs text-slate-500">
                      {file ? `${(file.size / 1048576).toFixed(2)} MB · Ready to publish` : "PDF format only (max. 10MB)"}
                    </span>
                  </div>
                  <input type="file" className="hidden" accept=".pdf" required ref={fileInputRef} onChange={handleFileChange} />
                </label>
              </div>

              <label className="flex gap-4 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 cursor-pointer items-start transition-colors hover:bg-amber-100/50">
                <input 
                  type="checkbox" 
                  checked={forceResign} 
                  onChange={(e) => setForceResign(e.target.checked)} 
                  className="mt-1 w-5 h-5 rounded border-amber-300 text-amber-600 focus:ring-amber-500 cursor-pointer" 
                />
                <div className="flex-1">
                  <b className="block text-sm font-bold text-amber-900 mb-1">Force existing employees to re-sign</b>
                  <p className="text-xs text-amber-700 leading-relaxed">
                    If checked, every existing employee will be locked out of their dashboard until they read and sign this new version. If left unchecked, they remain grandfathered into their old contract.
                  </p>
                </div>
              </label>

              <div className="flex justify-end pt-2">
                <PrimaryButton 
                  type="submit" 
                  isLoading={isUploading}
                  icon={<Check className="w-4 h-4" />}
                  className="px-6 py-2.5"
                >
                  {isUploading ? 'Uploading...' : 'Publish new version'}
                </PrimaryButton>
              </div>
            </form>
          </div>
        </div>

        {/* History Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200 flex flex-col gap-1">
            <h2 className="text-lg font-bold text-slate-800">Version History</h2>
            <p className="text-sm text-slate-500">Every published version is securely retained for auditing purposes.</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Version</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Title</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Status</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Published On</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Document</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                      <div className="flex items-center justify-center gap-3">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-500"></div>
                        Loading history...
                      </div>
                    </td>
                  </tr>
                ) : documents.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500">No documents uploaded yet.</td>
                  </tr>
                ) : (
                  documents.map(doc => (
                    <tr key={doc._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900">v{doc.version}</td>
                      <td className="px-6 py-4 text-slate-700">{doc.title}</td>
                      <td className="px-6 py-4">
                        {doc.isActive ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                            Archived
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-mono text-xs">
                        {new Date(doc.createdAt).toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-6 py-4">
                        <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:text-emerald-700 font-semibold no-underline hover:underline transition-colors">
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

      </div>
    </SidebarLayout>
  );
};

export default DocumentManagement;
"""

code = code[:start_idx] + new_return

with open('src/pages/superadmin/DocumentManagement.jsx', 'w') as f:
    f.write(code)

