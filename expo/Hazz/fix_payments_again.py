import re

with open('src/pages/superadmin/PaymentsList.jsx', 'r') as f:
    code = f.read()

# Replace icons
code = code.replace("import { Briefcase, Vault } from 'lucide-react';", "import { Building, Wallet } from 'lucide-react';")
code = code.replace("<Briefcase ", "<Building ")
code = code.replace("<Vault ", "<Wallet ")

# Truncate organisation column
old_org_col = """<td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-slate-600">
                        {tx.payerModel === 'Organisation' ? (tx.payerId?.name || 'Unknown Org') : (tx.orgId?.name || 'Unknown Org')}
                      </div>
                    </td>"""

new_org_col = """<td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-slate-600 truncate max-w-[150px] sm:max-w-[200px]" title={tx.payerModel === 'Organisation' ? (tx.payerId?.name || 'Unknown Org') : (tx.orgId?.name || 'Unknown Org')}>
                        {tx.payerModel === 'Organisation' ? (tx.payerId?.name || 'Unknown Org') : (tx.orgId?.name || 'Unknown Org')}
                      </div>
                    </td>"""

code = code.replace(old_org_col, new_org_col)

# Truncate payer column just in case
old_payer_col = """<td className="px-6 py-4 whitespace-nowrap">
                      {tx.payerModel === 'Organisation' ? (
                        <div className="font-medium text-slate-900">{tx.payerId?.name || 'Unknown Org'}</div>
                      ) : (
                        <div className="font-medium text-slate-900">{tx.payerId?.firstName} {tx.payerId?.lastName}</div>
                      )}
                    </td>"""
                    
new_payer_col = """<td className="px-6 py-4 whitespace-nowrap">
                      {tx.payerModel === 'Organisation' ? (
                        <div className="font-medium text-slate-900 truncate max-w-[150px]" title={tx.payerId?.name || 'Unknown Org'}>{tx.payerId?.name || 'Unknown Org'}</div>
                      ) : (
                        <div className="font-medium text-slate-900 truncate max-w-[150px]" title={`${tx.payerId?.firstName || ''} ${tx.payerId?.lastName || ''}`}>{tx.payerId?.firstName} {tx.payerId?.lastName}</div>
                      )}
                    </td>"""

code = code.replace(old_payer_col, new_payer_col)

with open('src/pages/superadmin/PaymentsList.jsx', 'w') as f:
    f.write(code)

