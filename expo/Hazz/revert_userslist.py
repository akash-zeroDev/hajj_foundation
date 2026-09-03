import re

with open('src/pages/superadmin/UsersList.jsx', 'r') as f:
    code = f.read()

new_badge = """                          {user.publicMetadata?.isSuspended && (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold border bg-red-50 text-red-600 border-red-200">
                              Suspended
                            </span>
                          )}"""

old_badge = """                          {user.publicMetadata?.isSuspended && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 border border-red-200 uppercase tracking-wider whitespace-nowrap">
                              Suspended
                            </span>
                          )}"""

code = code.replace(new_badge, old_badge)

with open('src/pages/superadmin/UsersList.jsx', 'w') as f:
    f.write(code)
