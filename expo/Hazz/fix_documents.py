with open('src/pages/admin/AdminEmployees.jsx', 'r') as f:
    code = f.read()

# Fix imports
code = code.replace("import jsPDF from 'jspdf';\nimport 'jspdf-autotable';", "import { jsPDF } from 'jspdf';\nimport autoTable from 'jspdf-autotable';")

# Fix autoTable call
code = code.replace("doc.autoTable({", "autoTable(doc, {")

with open('src/pages/admin/AdminEmployees.jsx', 'w') as f:
    f.write(code)
