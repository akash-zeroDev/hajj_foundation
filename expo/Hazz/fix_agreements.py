import re

with open('src/pages/admin/AgreementsTracking.jsx', 'r') as f:
    code = f.read()

code = code.replace("import { useToast } from '../../context/ToastContext';\\nimport { useAuth } from '@clerk/react';", "import { useToast } from '../../context/ToastContext';")
code = code.replace("const { showToast } = useToast();\\n  const { getToken } = useAuth();", "const { showToast } = useToast();")

# Specifically fix the double imports
code = re.sub(r"import { useAuth } from '@clerk/react';\n", "", code)
# wait, useAuth was actually in the file already: "import { useAuth, useOrganization } from '@clerk/react';"
# So we can just remove the one I added

with open('src/pages/admin/AgreementsTracking.jsx', 'w') as f:
    f.write(code)

