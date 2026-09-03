with open('src/pages/admin/AdminEmployees.jsx', 'r') as f:
    code = f.read()

import_lucide = "import { Plus, AlertTriangle, AlertCircle } from 'lucide-react';"
code = code.replace("import React, { useState, useEffect } from 'react';", "import React, { useState, useEffect } from 'react';\n" + import_lucide)

# Plus
code = code.replace('<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>', '<Plus className="w-5 h-5" />')

# Red alert
old_red_alert = """<svg className="h-7 w-7 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>"""
code = code.replace(old_red_alert, '<AlertTriangle className="h-7 w-7 text-red-600" />')

# Amber alert
old_amber_alert = """<svg className="h-7 w-7 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>"""
code = code.replace(old_amber_alert, '<AlertCircle className="h-7 w-7 text-amber-600" />')


with open('src/pages/admin/AdminEmployees.jsx', 'w') as f:
    f.write(code)
