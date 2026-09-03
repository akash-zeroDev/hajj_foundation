import re

with open('src/pages/admin/AdminEmployees.jsx', 'r') as f:
    code = f.read()

# Add state
code = code.replace(
    "const [confirmRemoveTarget, setConfirmRemoveTarget] = useState(null);",
    "const [confirmRemoveTarget, setConfirmRemoveTarget] = useState(null);\n  const [confirmSuspendTarget, setConfirmSuspendTarget] = useState(null);\n  const [isSuspending, setIsSuspending] = useState(false);"
)

# Add executeSuspend function
new_func = """  const executeSuspend = async () => {
    if (!confirmSuspendTarget) return;
    setIsSuspending(true);
    try {
      const token = await getToken();
      const res = await fetch(`http://localhost:5000/api/employees/clerk/${confirmSuspendTarget}/toggle-suspend`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to suspend employee');
      
      showToast(data.banned ? 'Employee suspended' : 'Employee restored', 'success');
      
      // Update local state
      setAllDbEmployees(prev => prev.map(e => {
        if (e.clerkUserId === confirmSuspendTarget) {
          return { ...e, publicMetadata: { ...e.publicMetadata, isSuspended: data.banned } };
        }
        return e;
      }));
      
      if (selectedMember) {
        setSelectedMember(prev => ({
          ...prev,
          publicMetadata: { ...prev.publicMetadata, isSuspended: data.banned }
        }));
      }
      
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsSuspending(false);
      setConfirmSuspendTarget(null);
    }
  };

  const handleRemove = """

code = code.replace("  const handleRemove = ", new_func)

# Add the Suspend modal
modal_code = """      {/* Suspend Employee Modal */}
      {confirmSuspendTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <style>{`
            @keyframes modal-pop { 0% { opacity: 0; transform: scale(0.95) translateY(10px); } 100% { opacity: 1; transform: scale(1) translateY(0); } }
            @keyframes backdrop-fade { 0% { opacity: 0; } 100% { opacity: 1; } }
            .animate-modal-pop { animation: modal-pop 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
            .animate-backdrop { animation: backdrop-fade 0.3s ease-out forwards; }
          `}</style>
          
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm animate-backdrop" onClick={() => setConfirmSuspendTarget(null)}></div>
          
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm text-center animate-modal-pop">
            <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full mb-4 bg-red-100">
              <AlertTriangle className="h-7 w-7 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Toggle Suspension?</h3>
            <p className="text-sm text-slate-500 mt-2 mb-8 leading-relaxed">
              Are you sure you want to change the suspension status for this employee? Suspended employees cannot access the portal.
            </p>
            <div className="flex gap-3 w-full">
              <button onClick={() => setConfirmSuspendTarget(null)} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition">Cancel</button>
              <button onClick={executeSuspend} disabled={isSuspending} className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 shadow-sm shadow-red-200 transition disabled:opacity-50">
                {isSuspending ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Employee Modal */}"""

code = code.replace("      {/* Remove Employee Modal */}", modal_code)

# Add onSuspend and isSuspending to EmployeeProfileSidecar
sidecar_old = """        onRemove={() => setConfirmRemoveTarget(selectedMember.publicUserData?.userId || selectedMember.clerkUserId)}
        onDownloadStatement={handleDownloadStatement}
        isRemoving={isRemoving}"""

sidecar_new = """        onRemove={() => setConfirmRemoveTarget(selectedMember.publicUserData?.userId || selectedMember.clerkUserId)}
        onSuspend={() => setConfirmSuspendTarget(selectedMember.publicUserData?.userId || selectedMember.clerkUserId)}
        onDownloadStatement={handleDownloadStatement}
        isRemoving={isRemoving}
        isSuspending={isSuspending}"""

code = code.replace(sidecar_old, sidecar_new)

with open('src/pages/admin/AdminEmployees.jsx', 'w') as f:
    f.write(code)
