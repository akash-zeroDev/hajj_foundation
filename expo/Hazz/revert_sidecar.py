with open('src/components/EmployeeProfileSidecar.jsx', 'r') as f:
    code = f.read()

# Props revert
code = code.replace(
    "isRemoving = false,\n  onSuspend,\n  isSuspending = false\n})",
    "isRemoving = false\n})"
)
code = code.replace(
    "const isSuspended = activeMember.publicMetadata?.isSuspended;",
    ""
)

# Header revert
old_header = """          <div className="absolute top-[16px] right-[16px] flex items-center gap-2 z-10">
            {onDownloadStatement && (
              <button 
                className="w-[26px] h-[26px] grid place-items-center text-slate-400 hover:text-emerald-700 transition-colors border border-slate-200 rounded-md bg-white shadow-sm group relative"
                onClick={onDownloadStatement}
                title="Download Statement"
              >
                <Download className="w-[13px] h-[13px]" />
              </button>
            )}
            <button 
              className="w-[26px] h-[26px] grid place-items-center text-slate-400 hover:text-slate-700 transition-colors border border-slate-200 rounded-md bg-white shadow-sm"
              onClick={onClose}
            >
              <X className="w-[13px] h-[13px]" />
            </button>
          </div>"""

new_header = """          <button 
            className="absolute top-[16px] right-[16px] w-[24px] h-[24px] grid place-items-center text-slate-400 hover:text-slate-700 transition-colors z-10 border border-slate-200 rounded-md bg-white shadow-sm"
            onClick={onClose}
          >
            <X className="w-[14px] h-[14px]" />
          </button>"""
code = code.replace(old_header, new_header)

# Bottom revert
old_bottom = """        {(onRemove || onSuspend) && !activeMember.isRemoved && (
          <div className="p-[20px_24px_24px] bg-white flex gap-[10px] shrink-0 border-t border-slate-100">
            
            {onSuspend && (
              <button 
                onClick={onSuspend}
                disabled={isSuspending}
                className={`flex-1 font-semibold text-[11px] py-[10px] rounded-lg inline-flex items-center justify-center gap-[6px] w-full bg-white border transition-colors disabled:opacity-50 ${
                  isSuspended 
                    ? 'border-slate-200 text-slate-700 hover:bg-slate-50' 
                    : 'border-red-200 text-red-600 hover:bg-red-50'
                }`}
              >
                {isSuspending ? (
                  <span className={`w-[14px] h-[14px] border-2 ${isSuspended ? 'border-slate-700' : 'border-red-600'} border-t-transparent rounded-full animate-spin`}></span>
                ) : (
                  <svg className="w-[13px] h-[13px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
                )}
                {isSuspended ? 'Unsuspend' : 'Suspend'}
              </button>
            )}
            
            {onRemove && (
              <button 
                onClick={onRemove}
                disabled={isRemoving}
                className="flex-1 font-semibold text-[11px] py-[10px] rounded-lg inline-flex items-center justify-center gap-[6px] w-full bg-red-600 border border-transparent text-white hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isRemoving ? (
                  <span className="w-[14px] h-[14px] border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <Trash2 className="w-[14px] h-[14px]" />
                )}
                {isRemoving ? 'Removing...' : 'Remove'}
              </button>
            )}
          </div>
        )}"""

new_bottom = """        {(onRemove || onDownloadStatement) && !activeMember.isRemoved && (
          <div className="p-[20px_24px_24px] bg-white grid gap-[10px] shrink-0 border-t border-slate-100">
            {onDownloadStatement && (
              <button 
                onClick={onDownloadStatement}
                className="font-semibold text-[11px] py-[10px] rounded-lg inline-flex items-center justify-center gap-[6px] w-full bg-slate-100 border border-slate-200 text-slate-800 hover:bg-slate-200 transition-colors"
              >
                <Download className="w-[14px] h-[14px]" />
                Download Statement
              </button>
            )}
            
            {onRemove && (
              <button 
                onClick={onRemove}
                disabled={isRemoving}
                className="font-semibold text-[11px] py-[10px] rounded-lg inline-flex items-center justify-center gap-[6px] w-full bg-white border border-red-200 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                {isRemoving ? (
                  <div className="w-[14px] h-[14px] border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Trash2 className="w-[14px] h-[14px]" />
                )}
                {isRemoving ? 'Removing...' : 'Remove'}
              </button>
            )}
          </div>
        )}"""

code = code.replace(old_bottom, new_bottom)

with open('src/components/EmployeeProfileSidecar.jsx', 'w') as f:
    f.write(code)
