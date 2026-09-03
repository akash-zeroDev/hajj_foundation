import re

with open('src/components/EmployeeProfileSidecar.jsx', 'r') as f:
    code = f.read()

# Replace the entire bottom section from "{(onRemove || onDownloadStatement)" to the end of the file
pattern = r"\{\(onRemove \|\| onDownloadStatement\) && !activeMember\.isRemoved && \((.*?)export default EmployeeProfileSidecar;"

new_bottom = """{(onRemove || onSuspend) && !activeMember.isRemoved && (
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
        )}
      </aside>
    </>
  );
};

export default EmployeeProfileSidecar;"""

new_code = re.sub(pattern, new_bottom, code, flags=re.DOTALL)

with open('src/components/EmployeeProfileSidecar.jsx', 'w') as f:
    f.write(new_code)
