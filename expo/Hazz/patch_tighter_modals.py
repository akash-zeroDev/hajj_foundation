import re

with open('src/pages/admin/AdminEmployees.jsx', 'r') as f:
    code = f.read()

# 1. Suspend Modal
old_suspend = """          <div className="relative bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-200 p-6 w-full max-w-[420px] animate-modal-pop">
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center h-10 w-10 shrink-0 rounded-full bg-red-50 border border-red-100 text-red-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-slate-900 mt-0.5">Toggle Suspension</h3>
                <p className="text-[13.5px] text-slate-600 mt-1.5 leading-relaxed">
                  Are you sure you want to change the suspension status for this employee? Suspended employees cannot access the portal.
                </p>
              </div>
            </div>
            <div className="mt-7 flex justify-end gap-3 border-t border-slate-100 pt-5">
              <button onClick={() => setConfirmSuspendTarget(null)} className="px-4 py-2 rounded-lg border border-slate-200 text-[13px] font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors">Cancel</button>
              <button onClick={executeSuspend} disabled={isSuspending} className="px-4 py-2 rounded-lg bg-red-600 text-white text-[13px] font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center min-w-[80px]">
                {isSuspending ? <span className="w-[14px] h-[14px] border-2 border-white border-t-transparent rounded-full animate-spin"></span> : 'Confirm'}
              </button>
            </div>
          </div>"""

new_suspend = """          <div className="relative bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-200 w-full max-w-[360px] overflow-hidden animate-modal-pop">
            <div className="p-5 flex items-start gap-3">
              <div className="flex items-center justify-center h-8 w-8 shrink-0 rounded-full bg-red-50 text-red-600">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div className="flex-1 mt-[3px]">
                <h3 className="text-[14px] font-bold text-slate-900 leading-none">Toggle Suspension</h3>
                <p className="text-[12.5px] text-slate-500 mt-2 leading-relaxed">
                  Are you sure you want to change the suspension status for this employee? Suspended employees cannot access the portal.
                </p>
              </div>
            </div>
            <div className="bg-slate-50 border-t border-slate-100 p-3 flex justify-end gap-2">
              <button onClick={() => setConfirmSuspendTarget(null)} className="px-3.5 py-1.5 rounded-md border border-slate-200 text-[12px] font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors">Cancel</button>
              <button onClick={executeSuspend} disabled={isSuspending} className="px-3.5 py-1.5 rounded-md bg-red-600 text-white text-[12px] font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center min-w-[70px]">
                {isSuspending ? <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : 'Confirm'}
              </button>
            </div>
          </div>"""

# 2. Remove Modal
old_remove = """          <div className="relative bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-200 p-6 w-full max-w-[420px] animate-modal-pop">
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center h-10 w-10 shrink-0 rounded-full bg-red-50 border border-red-100 text-red-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-slate-900 mt-0.5">Remove Employee</h3>
                <p className="text-[13.5px] text-slate-600 mt-1.5 leading-relaxed">
                  Are you sure you want to remove this employee from the organisation? This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="mt-7 flex justify-end gap-3 border-t border-slate-100 pt-5">
              <button onClick={() => setConfirmRemoveTarget(null)} className="px-4 py-2 rounded-lg border border-slate-200 text-[13px] font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors">Cancel</button>
              <button onClick={executeRemove} disabled={isRemoving} className="px-4 py-2 rounded-lg bg-red-600 text-white text-[13px] font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center min-w-[80px]">
                {isRemoving ? <span className="w-[14px] h-[14px] border-2 border-white border-t-transparent rounded-full animate-spin"></span> : 'Remove'}
              </button>
            </div>
          </div>"""

new_remove = """          <div className="relative bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-200 w-full max-w-[360px] overflow-hidden animate-modal-pop">
            <div className="p-5 flex items-start gap-3">
              <div className="flex items-center justify-center h-8 w-8 shrink-0 rounded-full bg-red-50 text-red-600">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div className="flex-1 mt-[3px]">
                <h3 className="text-[14px] font-bold text-slate-900 leading-none">Remove Employee</h3>
                <p className="text-[12.5px] text-slate-500 mt-2 leading-relaxed">
                  Are you sure you want to remove this employee from the organisation? This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="bg-slate-50 border-t border-slate-100 p-3 flex justify-end gap-2">
              <button onClick={() => setConfirmRemoveTarget(null)} className="px-3.5 py-1.5 rounded-md border border-slate-200 text-[12px] font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors">Cancel</button>
              <button onClick={executeRemove} disabled={isRemoving} className="px-3.5 py-1.5 rounded-md bg-red-600 text-white text-[12px] font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center min-w-[70px]">
                {isRemoving ? <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : 'Remove'}
              </button>
            </div>
          </div>"""

# 3. Revoke Modal
old_revoke = """          <div className="relative bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-200 p-6 w-full max-w-[420px] animate-modal-pop">
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center h-10 w-10 shrink-0 rounded-full bg-amber-50 border border-amber-100 text-amber-600">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-slate-900 mt-0.5">Revoke Invitation</h3>
                <p className="text-[13.5px] text-slate-600 mt-1.5 leading-relaxed">
                  Are you sure you want to revoke this invitation? The link they received will no longer work.
                </p>
              </div>
            </div>
            <div className="mt-7 flex justify-end gap-3 border-t border-slate-100 pt-5">
              <button onClick={() => setConfirmRevokeTarget(null)} className="px-4 py-2 rounded-lg border border-slate-200 text-[13px] font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors">Cancel</button>
              <button onClick={executeRevoke} disabled={isRevoking} className="px-4 py-2 rounded-lg bg-amber-600 text-white text-[13px] font-semibold hover:bg-amber-700 transition-colors disabled:opacity-50 flex items-center justify-center min-w-[80px]">
                {isRevoking ? <span className="w-[14px] h-[14px] border-2 border-white border-t-transparent rounded-full animate-spin"></span> : 'Revoke'}
              </button>
            </div>
          </div>"""

new_revoke = """          <div className="relative bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-200 w-full max-w-[360px] overflow-hidden animate-modal-pop">
            <div className="p-5 flex items-start gap-3">
              <div className="flex items-center justify-center h-8 w-8 shrink-0 rounded-full bg-amber-50 text-amber-600">
                <AlertCircle className="h-4 w-4" />
              </div>
              <div className="flex-1 mt-[3px]">
                <h3 className="text-[14px] font-bold text-slate-900 leading-none">Revoke Invitation</h3>
                <p className="text-[12.5px] text-slate-500 mt-2 leading-relaxed">
                  Are you sure you want to revoke this invitation? The link they received will no longer work.
                </p>
              </div>
            </div>
            <div className="bg-slate-50 border-t border-slate-100 p-3 flex justify-end gap-2">
              <button onClick={() => setConfirmRevokeTarget(null)} className="px-3.5 py-1.5 rounded-md border border-slate-200 text-[12px] font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors">Cancel</button>
              <button onClick={executeRevoke} disabled={isRevoking} className="px-3.5 py-1.5 rounded-md bg-amber-600 text-white text-[12px] font-semibold hover:bg-amber-700 transition-colors disabled:opacity-50 flex items-center justify-center min-w-[70px]">
                {isRevoking ? <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : 'Revoke'}
              </button>
            </div>
          </div>"""

code = code.replace(old_suspend, new_suspend)
code = code.replace(old_remove, new_remove)
code = code.replace(old_revoke, new_revoke)

with open('src/pages/admin/AdminEmployees.jsx', 'w') as f:
    f.write(code)

