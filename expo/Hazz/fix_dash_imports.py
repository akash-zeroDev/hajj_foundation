with open('src/pages/Dashboards.jsx', 'r') as f:
    code = f.read()

import_lucide = "import { FileText, Plus, Users, ChevronUp, PoundSterling, Trophy, AlertTriangle, Check, CreditCard } from 'lucide-react';"

code = code.replace("import { useState, useEffect } from 'react';", "import { useState, useEffect } from 'react';\n" + import_lucide)

with open('src/pages/Dashboards.jsx', 'w') as f:
    f.write(code)
