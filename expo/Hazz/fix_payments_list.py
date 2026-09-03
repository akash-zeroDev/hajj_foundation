import re

with open('server/controllers/financialController.js', 'r') as f:
    code = f.read()

# Fix populate
code = code.replace(".populate('orgId', 'companyName')", ".populate('orgId', 'name')")
with open('server/controllers/financialController.js', 'w') as f:
    f.write(code)


with open('src/pages/superadmin/PaymentsList.jsx', 'r') as f:
    jsx = f.read()

# Add imports
imports = "import { Banknote, PiggyBank } from 'lucide-react';\nimport SearchFilterBar from '../../components/SearchFilterBar';\n"
jsx = jsx.replace("import { superAdminNavigation } from '../../config/navigation';", "import { superAdminNavigation } from '../../config/navigation';\n" + imports)

# Add search state
jsx = jsx.replace("const [transactions, setTransactions] = useState([]);", "const [transactions, setTransactions] = useState([]);\n  const [searchTerm, setSearchTerm] = useState('');")

# Replace icons
old_rev_icon = """<svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>"""
new_rev_icon = """<Banknote className="w-5 h-5 text-emerald-600" />"""
jsx = jsx.replace(old_rev_icon, new_rev_icon)

old_pool_icon = """<svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>"""
new_pool_icon = """<PiggyBank className="w-5 h-5 text-blue-600" />"""
jsx = jsx.replace(old_pool_icon, new_pool_icon)

# Add search filter bar
old_ledger_header = """<div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-800">Global Ledger</h2>
        </div>"""
new_ledger_header = """<div className="flex flex-col sm:flex-row gap-4 mb-6">
        <SearchFilterBar 
          searchTerm={searchTerm} 
          setSearchTerm={setSearchTerm} 
          placeholder="Search by payer or organisation..." 
          containerClassName="flex-1 max-w-md"
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-800">Global Ledger</h2>
        </div>"""
jsx = jsx.replace(old_ledger_header, new_ledger_header)

# Filter transactions
filter_logic = """
  const filteredTransactions = transactions.filter(tx => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    
    let payerName = '';
    let orgName = '';
    
    if (tx.payerModel === 'Organisation') {
      payerName = tx.payerId?.name || '';
      orgName = tx.payerId?.name || '';
    } else {
      payerName = `${tx.payerId?.firstName || ''} ${tx.payerId?.lastName || ''}`;
      orgName = tx.orgId?.name || '';
    }
    
    return payerName.toLowerCase().includes(term) || orgName.toLowerCase().includes(term);
  });
"""
jsx = jsx.replace("return (", filter_logic + "\n  return (")

# Map over filteredTransactions instead of transactions
jsx = jsx.replace("transactions.map((tx) => (", "filteredTransactions.map((tx) => (")
jsx = jsx.replace("transactions.length === 0", "filteredTransactions.length === 0")

# Table headers
old_thead = """<tr>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Payer</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Status</th>
              </tr>"""
new_thead = """<tr>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Payer</th>
                <th className="px-6 py-3">Organisation</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Status</th>
              </tr>"""
jsx = jsx.replace(old_thead, new_thead)
jsx = jsx.replace('colSpan="5"', 'colSpan="6"')

# Table body row
old_tbody = """<td className="px-6 py-4 whitespace-nowrap">
                      {tx.payerModel === 'Organisation' ? (
                        <div className="font-medium text-slate-900">{tx.payerId?.companyName || 'Unknown Org'}</div>
                      ) : (
                        <div>
                          <div className="font-medium text-slate-900">{tx.payerId?.firstName} {tx.payerId?.lastName}</div>
                          <div className="text-xs text-slate-500">{tx.orgId?.companyName}</div>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">"""
new_tbody = """<td className="px-6 py-4 whitespace-nowrap">
                      {tx.payerModel === 'Organisation' ? (
                        <div className="font-medium text-slate-900">{tx.payerId?.name || 'Unknown Org'}</div>
                      ) : (
                        <div className="font-medium text-slate-900">{tx.payerId?.firstName} {tx.payerId?.lastName}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-slate-600">
                        {tx.payerModel === 'Organisation' ? (tx.payerId?.name || 'Unknown Org') : (tx.orgId?.name || 'Unknown Org')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">"""
jsx = jsx.replace(old_tbody, new_tbody)

with open('src/pages/superadmin/PaymentsList.jsx', 'w') as f:
    f.write(jsx)

