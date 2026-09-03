with open('src/layouts/SidebarLayout.jsx', 'r') as f:
    code = f.read()

import_statement = "import { UserButton, useUser } from '@clerk/react';\nimport NotificationDropdown from '../components/NotificationDropdown';\n"
code = code.replace("import { UserButton, useUser } from '@clerk/react';", import_statement)

header_right = """          <div className="flex items-center gap-4">
             {/* Additional header items could go here */}
             <span className="text-sm text-slate-500 hidden sm:block">"""

header_right_new = """          <div className="flex items-center gap-4">
             <NotificationDropdown />
             <span className="text-sm text-slate-500 hidden sm:block">"""

code = code.replace(header_right, header_right_new)

with open('src/layouts/SidebarLayout.jsx', 'w') as f:
    f.write(code)
