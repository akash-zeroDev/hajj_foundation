with open('src/pages/admin/AdminEmployees.jsx', 'r') as f:
    code = f.read()

import_lucide = "import { Plus, AlertTriangle, AlertCircle } from 'lucide-react';"
code = code.replace("import { useState, useEffect } from 'react';", "import { useState, useEffect } from 'react';\n" + import_lucide)

with open('src/pages/admin/AdminEmployees.jsx', 'w') as f:
    f.write(code)
