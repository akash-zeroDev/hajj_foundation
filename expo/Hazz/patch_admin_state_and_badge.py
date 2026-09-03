import re

with open('src/pages/admin/AdminEmployees.jsx', 'r') as f:
    code = f.read()

# 1. Update executeSuspend state updates
old_state_update = """      if (selectedMember) {
        setSelectedMember(prev => ({
          ...prev,
          publicMetadata: { ...prev.publicMetadata, isSuspended: data.banned }
        }));
      }"""

new_state_update = """      if (selectedMember) {
        setSelectedMember(prev => ({
          ...prev,
          publicMetadata: { ...prev.publicMetadata, isSuspended: data.banned }
        }));
        setActiveMember(prev => ({
          ...prev,
          publicMetadata: { ...prev.publicMetadata, isSuspended: data.banned }
        }));
      }

      setMembers(prev => prev.map(m => {
        if (m.publicUserData?.userId === confirmSuspendTarget) {
          return { ...m, publicMetadata: { ...m.publicMetadata, isSuspended: data.banned } };
        }
        return m;
      }));"""

code = code.replace(old_state_update, new_state_update)

# 2. Add Suspended badge to table
old_td = """                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${member.role === 'org:admin' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-slate-50 text-slate-700 border-slate-200'}`}>
                        {member.role === 'org:admin' ? 'Administrator' : 'Employee'}
                      </span>
                    </td>"""

new_td = """                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${member.role === 'org:admin' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-slate-50 text-slate-700 border-slate-200'}`}>
                          {member.role === 'org:admin' ? 'Administrator' : 'Employee'}
                        </span>
                        {member.publicMetadata?.isSuspended && (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold border bg-red-50 text-red-600 border-red-200">
                            Suspended
                          </span>
                        )}
                      </div>
                    </td>"""

code = code.replace(old_td, new_td)

with open('src/pages/admin/AdminEmployees.jsx', 'w') as f:
    f.write(code)
