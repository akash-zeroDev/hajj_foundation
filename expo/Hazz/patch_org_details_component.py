import re

with open('src/pages/superadmin/OrganisationDetails.jsx', 'r') as f:
    content = f.read()

import_str = "import SearchFilterBar from '../../components/SearchFilterBar';"
new_import = "import SearchFilterBar from '../../components/SearchFilterBar';\nimport EmployeeProfileSidecar from '../../components/EmployeeProfileSidecar';"
if import_str in content:
    content = content.replace(import_str, new_import)
else:
    content = content.replace("import React, { useState, useEffect } from 'react';", "import React, { useState, useEffect } from 'react';\nimport EmployeeProfileSidecar from '../../components/EmployeeProfileSidecar';")

# Find the old sidecar HTML in OrganisationDetails.jsx
overlay_start = content.find('className={`fixed inset-0 bg-[#09100d]/50')
overlay_start = content.rfind('<div', 0, overlay_start)

# In OrganisationDetails, the sidecar ends right before </SidebarLayout>
# We can find `</SidebarLayout>` at the end of the file
end_idx = content.rfind('</SidebarLayout>')

# Let's extract the exact slice that represents the old sidecar we put there.
# It might start with `<div` or `<>` if we left it.
# Let's just find where `</SidebarLayout>` is, and replace the whole chunk before it.
start_replace = content.rfind('{/* Employee Details Side Panel */}', 0, end_idx)
if start_replace == -1:
    # Look for the overlay div
    start_replace = content.rfind('<div\n        className={`fixed inset-0 bg-[#09100d]/50', 0, end_idx)
    if start_replace == -1:
        start_replace = content.rfind('<>', 0, overlay_start)

old_html = content[start_replace:end_idx]

new_sidecar = """      {/* Employee Details Side Panel */}
      <EmployeeProfileSidecar
        isOpen={!!selectedMember}
        onClose={() => setSelectedMember(null)}
        activeMember={selectedMember}
        employeeProfile={employeeProfile}
        isFetchingProfile={isFetchingProfile}
      />
"""

content = content.replace(old_html, new_sidecar)

with open('src/pages/superadmin/OrganisationDetails.jsx', 'w') as f:
    f.write(content)
print("OrganisationDetails patched.")
