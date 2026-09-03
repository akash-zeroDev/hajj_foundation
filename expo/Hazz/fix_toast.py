import re

with open('src/pages/admin/AdminEmployees.jsx', 'r') as f:
    code = f.read()

# Add import for useToast
if "import { useToast }" not in code:
    code = code.replace("import { useOrganization, useAuth } from '@clerk/react';", "import { useOrganization, useAuth } from '@clerk/react';\nimport { useToast } from '../../context/ToastContext';")

# Add showToast hook inside component
if "const { showToast } = useToast();" not in code:
    code = code.replace("const { getToken } = useAuth();", "const { getToken } = useAuth();\n  const { showToast } = useToast();")

with open('src/pages/admin/AdminEmployees.jsx', 'w') as f:
    f.write(code)
