import re

with open('src/pages/admin/AdminEmployees.jsx', 'r') as f:
    code = f.read()

# State
code = code.replace("  const [confirmSuspendTarget, setConfirmSuspendTarget] = useState(null);\n  const [isSuspending, setIsSuspending] = useState(false);\n", "")

# Function executeSuspend
pattern = r"  const executeSuspend = async \(\) => \{.*?\};\n"
code = re.sub(pattern, "", code, flags=re.DOTALL)

# Prop onSuspend and isSuspending
code = code.replace(
    "        onSuspend={() => {\n          const target = selectedMember.publicUserData?.userId || selectedMember.clerkUserId || selectedMember.id;\n          console.log('Suspend clicked for:', target, selectedMember);\n          setConfirmSuspendTarget(target);\n        }}\n        onDownloadStatement={handleDownloadStatement}\n        isRemoving={isRemoving}\n        isSuspending={isSuspending}\n      />",
    "        onDownloadStatement={handleDownloadStatement}\n        isRemoving={isRemoving}\n      />"
)

# Modal Suspend
modal_pattern = r"      \{\/\* Suspend Employee Modal \*\/\}.*?\{\/\* Remove Employee Modal \*\/\}"
code = re.sub(modal_pattern, "      {/* Remove Employee Modal */}", code, flags=re.DOTALL)

# Badge in table
old_td = """                    <td className="px-6 py-4">
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

new_td = """                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${member.role === 'org:admin' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-slate-50 text-slate-700 border-slate-200'}`}>
                        {member.role === 'org:admin' ? 'Administrator' : 'Employee'}
                      </span>
                    </td>"""
code = code.replace(old_td, new_td)

with open('src/pages/admin/AdminEmployees.jsx', 'w') as f:
    f.write(code)
