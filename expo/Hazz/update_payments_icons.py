import re

with open('src/pages/superadmin/PaymentsList.jsx', 'r') as f:
    code = f.read()

# Replace imports
code = code.replace("import { Banknote, PiggyBank } from 'lucide-react';", "import { Briefcase, Vault } from 'lucide-react';")

# Replace Company Revenue Icon & Colors
old_revenue = """<div className="p-2 bg-emerald-100 rounded-lg">
              <Banknote className="w-5 h-5 text-emerald-600" />
            </div>"""
new_revenue = """<div className="p-2 bg-slate-100 rounded-lg">
              <Briefcase className="w-5 h-5 text-slate-800" />
            </div>"""
code = code.replace(old_revenue, new_revenue)

# Replace Total Savings Pool Icon & Colors
old_pool = """<div className="p-2 bg-blue-100 rounded-lg">
              <PiggyBank className="w-5 h-5 text-blue-600" />
            </div>"""
new_pool = """<div className="p-2 bg-slate-100 rounded-lg">
              <Vault className="w-5 h-5 text-slate-800" />
            </div>"""
code = code.replace(old_pool, new_pool)

with open('src/pages/superadmin/PaymentsList.jsx', 'w') as f:
    f.write(code)

