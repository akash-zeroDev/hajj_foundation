import re

with open('src/pages/superadmin/UsersList.jsx', 'r') as f:
    code = f.read()

# Make sure lucide-react imports exist
if "import { FileSignature, CreditCard, Award } from 'lucide-react';" not in code:
    code = code.replace("import CustomSelect from '../../components/CustomSelect';", "import CustomSelect from '../../components/CustomSelect';\nimport { FileSignature, CreditCard, Award } from 'lucide-react';")

# 1. Shariah Agreement
old_shariah = """<svg viewBox="0 0 24 24" className="w-[15px] h-[15px] stroke-current stroke-[1.8] fill-none"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>"""
new_shariah = '<FileSignature className="w-[15px] h-[15px] stroke-[1.8]" />'
code = code.replace(old_shariah, new_shariah)

# 2. Subscription
old_sub = """<svg viewBox="0 0 24 24" className="w-[15px] h-[15px] stroke-current stroke-[1.8] fill-none"><rect x="3" y="6" width="18" height="12" rx="2"/><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h3"/></svg>"""
new_sub = '<CreditCard className="w-[15px] h-[15px] stroke-[1.8]" />'
code = code.replace(old_sub, new_sub)

# 3. Hajj Award
old_award = """<svg viewBox="0 0 24 24" className="w-[15px] h-[15px] stroke-current stroke-[1.8] fill-none"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4h16v6a8 8 0 01-16 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M9 20h6M12 18v2"/></svg>"""
new_award = '<Award className="w-[15px] h-[15px] stroke-[1.8]" />'
code = code.replace(old_award, new_award)

with open('src/pages/superadmin/UsersList.jsx', 'w') as f:
    f.write(code)

