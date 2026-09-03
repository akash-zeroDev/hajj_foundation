import re

with open('src/pages/superadmin/Reports.jsx', 'r') as f:
    code = f.read()

if "import { FileDown } from 'lucide-react';" not in code:
    code = code.replace("import { superAdminNavigation } from '../../config/navigation';", "import { superAdminNavigation } from '../../config/navigation';\nimport { FileDown } from 'lucide-react';")

old_csv = """<svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>"""
new_csv = '<FileDown className="w-4 h-4 text-slate-500" />'
code = code.replace(old_csv, new_csv)

old_pdf = """<svg className="w-4 h-4 text-emerald-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>"""
new_pdf = '<FileDown className="w-4 h-4 text-emerald-200" />'
code = code.replace(old_pdf, new_pdf)

with open('src/pages/superadmin/Reports.jsx', 'w') as f:
    f.write(code)
