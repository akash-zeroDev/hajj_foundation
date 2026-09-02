with open('src/pages/superadmin/UsersList.jsx', 'r') as f:
    content = f.read()

anchor = """                        <div className="font-medium text-slate-900">
                          {user.firstName || user.lastName ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : ("""

replacement = """                        <div className="font-medium text-slate-900 flex items-center gap-2">
                          {user.firstName || user.lastName ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : (
                            <span className="italic text-slate-500 font-normal">
                              {user.emailAddresses?.[0]?.emailAddress?.split('@')[0] || 'Awaiting setup'}
                            </span>
                          )}
                          {user.banned && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 border border-red-200 uppercase tracking-wider whitespace-nowrap">
                              Suspended
                            </span>
                          )}"""

# We only replace the first two lines, wait I need to be careful.
# I'll just use a smarter replace.
content = content.replace(
    '<div className="font-medium text-slate-900">', 
    '<div className="font-medium text-slate-900 flex items-center gap-2">'
)
content = content.replace(
    "{user.emailAddresses?.[0]?.emailAddress?.split('@')[0] || 'Awaiting setup'}\n                            </span>\n                          )}",
    "{user.emailAddresses?.[0]?.emailAddress?.split('@')[0] || 'Awaiting setup'}\n                            </span>\n                          )}\n                          {user.banned && (\n                            <span className=\"px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 border border-red-200 uppercase tracking-wider whitespace-nowrap\">\n                              Suspended\n                            </span>\n                          )}"
)

with open('src/pages/superadmin/UsersList.jsx', 'w') as f:
    f.write(content)
