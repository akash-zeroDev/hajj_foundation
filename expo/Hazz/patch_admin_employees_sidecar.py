import re

with open('src/pages/admin/AdminEmployees.jsx', 'r') as f:
    content = f.read()

# Add import
import_str = "import { getOrganizationMembershipList } from '../../utils/clerkHelpers';"
new_import = "import { getOrganizationMembershipList } from '../../utils/clerkHelpers';\nimport EmployeeProfileSidecar from '../../components/EmployeeProfileSidecar';"
content = content.replace(import_str, new_import)

# Find where sidecar starts
overlay_idx = content.find('<div\n          className={`fixed inset-0 bg-[#09100d]/50')
overlay_start = content.rfind('{/* Employee Details Side Panel */}', 0, overlay_idx)
if overlay_start == -1:
    overlay_start = content.rfind('<>', 0, overlay_idx)

# Find where it ends
footer_idx = content.find('<div className="p-[13px_20px] border-t border-[#e8edeb] bg-white grid gap-[9px] shrink-0">')
aside_end = content.find('</aside>', footer_idx) + 8
end_idx = content.find('</>', aside_end) + 3

sidecar_html = content[overlay_start:end_idx]

# Replace with the component
new_sidecar = """      {/* Employee Details Side Panel */}
      <EmployeeProfileSidecar
        isOpen={!!selectedMember}
        onClose={() => setSelectedMember(null)}
        activeMember={selectedMember}
        employeeProfile={employeeProfile}
        isFetchingProfile={isFetchingProfile}
        onRemove={() => setConfirmRemoveTarget(selectedMember.publicUserData.userId)}
        onDownloadStatement={handleDownloadStatement}
        isRemoving={isRemoving}
      />"""

content = content.replace(sidecar_html, new_sidecar)

with open('src/pages/admin/AdminEmployees.jsx', 'w') as f:
    f.write(content)
print("AdminEmployees patched.")
