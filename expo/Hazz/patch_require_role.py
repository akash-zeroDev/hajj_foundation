import re

with open('src/components/RequireRole.jsx', 'r') as f:
    content = f.read()

anchor = "return children;"

lock_screen = """
  // Check for User Suspension
  if (user?.publicMetadata?.isSuspended) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-red-100">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg viewBox="0 0 24 24" className="w-8 h-8 stroke-current stroke-2 fill-none"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Account Suspended</h2>
          <p className="text-slate-600 mb-8 leading-relaxed">
            Your account is currently suspended. Please contact the administrator or support team for more information.
          </p>
        </div>
      </div>
    );
  }

  // Check for Organization Suspension (applies to both org:admin and org:member)
  if (role !== 'superadmin' && membership?.organization?.publicMetadata?.isSuspended) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-amber-100">
          <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg viewBox="0 0 24 24" className="w-8 h-8 stroke-current stroke-2 fill-none"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Organisation Suspended</h2>
          <p className="text-slate-600 mb-8 leading-relaxed">
            Your organisation's access is currently suspended. If you are the administrator, please contact support or check your billing status.
          </p>
        </div>
      </div>
    );
  }

  return children;
"""

if "Account Suspended" not in content:
    content = content.replace(anchor, lock_screen)

with open('src/components/RequireRole.jsx', 'w') as f:
    f.write(content)
