import re

with open('src/pages/superadmin/BankAccounts.jsx', 'r') as f:
    code = f.read()

# Make sure imports are present
if "import { Landmark, Lock, Info, Check } from 'lucide-react';" not in code:
    code = code.replace("import { superAdminNavigation } from '../../config/navigation';", "import { superAdminNavigation } from '../../config/navigation';\nimport { Landmark, Lock, Info, Check } from 'lucide-react';")

# 1. Landmark
old_landmark = """<svg className="w-[18px] h-[18px] stroke-current stroke-[1.8] fill-none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 10h16M5 10V8l7-4 7 4v2M6 10v8M10 10v8M14 10v8M18 10v8M3 20h18"/></svg>"""
new_landmark = '<Landmark className="w-[18px] h-[18px] stroke-[1.8]" />'
code = code.replace(old_landmark, new_landmark)

# 2. Lock
old_lock = """<svg className="w-[18px] h-[18px] stroke-current stroke-[1.8] fill-none" viewBox="0 0 24 24"><rect x="4" y="10" width="16" height="10" rx="2"/><path strokeLinecap="round" strokeLinejoin="round" d="M8 10V7a4 4 0 118 0v3"/></svg>"""
new_lock = '<Lock className="w-[18px] h-[18px] stroke-[1.8]" />'
code = code.replace(old_lock, new_lock)

# 3. Info
old_info = """<svg className="w-[17px] h-[17px] flex-shrink-0 mt-[1px] stroke-current stroke-[1.8] fill-none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 11v5M12 8h.01"/></svg>"""
new_info = '<Info className="w-[17px] h-[17px] flex-shrink-0 mt-[1px] stroke-[1.8]" />'
code = code.replace(old_info, new_info)

# 4. Check
old_check = """<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12l5 5L20 7" /></svg>"""
new_check = '<Check className="w-5 h-5" />'
code = code.replace(old_check, new_check)

with open('src/pages/superadmin/BankAccounts.jsx', 'w') as f:
    f.write(code)
