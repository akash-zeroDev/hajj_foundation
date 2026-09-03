import re

with open('src/pages/superadmin/UsersList.jsx', 'r') as f:
    code = f.read()

# 1. Fix the Suspend UI state update
old_suspend_state = """        const updatedUser = { ...activeUser, banned: data.banned };
        setActiveUser(updatedUser);"""
new_suspend_state = """        const updatedUser = { 
          ...activeUser, 
          banned: data.banned,
          publicMetadata: {
            ...activeUser.publicMetadata,
            isSuspended: data.banned
          }
        };
        setActiveUser(updatedUser);"""
code = code.replace(old_suspend_state, new_suspend_state)

# 2. Add the delete confirmation modal
modal_jsx = """
      {/* Delete Confirmation Modal */}
      {isConfirmingDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsConfirmingDelete(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm text-center animate-modal-pop">
            <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full mb-4 bg-red-100">
              <svg className="h-7 w-7 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            
            <h3 className="text-xl font-bold text-slate-900">Delete User?</h3>
            <p className="text-sm text-slate-500 mt-2 mb-6">
              This action cannot be undone. This will permanently remove the user from the system.
            </p>
            
            <div className="flex gap-3 justify-center">
              <button 
                onClick={() => setIsConfirmingDelete(false)}
                className="px-6 py-2.5 rounded-xl font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDeleteUser}
                className="px-6 py-2.5 rounded-xl font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-[0_4px_12px_rgba(220,38,38,0.3)]"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

</SidebarLayout>"""

code = code.replace("</SidebarLayout>", modal_jsx)

with open('src/pages/superadmin/UsersList.jsx', 'w') as f:
    f.write(code)
