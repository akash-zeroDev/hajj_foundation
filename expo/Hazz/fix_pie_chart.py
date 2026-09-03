import re

with open('src/pages/superadmin/Reports.jsx', 'r') as f:
    code = f.read()

# Add suspended to PieChart
old_pie = """    const employeePieData = [
      { name: 'Compliant', value: stats.employees.compliant },
      { name: 'Pending', value: stats.employees.pending }
    ];
    const COLORS = ['#10b981', '#f59e0b']; // emerald, amber"""

new_pie = """    const employeePieData = [
      { name: 'Compliant', value: stats.employees.compliant },
      { name: 'Pending', value: stats.employees.pending },
      { name: 'Suspended', value: stats.employees.suspended || 0 }
    ];
    const COLORS = ['#10b981', '#f59e0b', '#ef4444']; // emerald, amber, red"""

code = code.replace(old_pie, new_pie)

# Also update the PDF export to include Suspended Users
old_pdf = """          ['Compliant Employees (Agreements Signed)', stats.employees.compliant.toString()],
          ['Pending Employees (Not Signed)', stats.employees.pending.toString()]"""

new_pdf = """          ['Compliant Employees (Agreements Signed)', stats.employees.compliant.toString()],
          ['Pending Employees (Not Signed)', stats.employees.pending.toString()],
          ['Suspended Users', (stats.employees.suspended || 0).toString()]"""

code = code.replace(old_pdf, new_pdf)

with open('src/pages/superadmin/Reports.jsx', 'w') as f:
    f.write(code)
