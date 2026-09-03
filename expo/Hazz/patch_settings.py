with open('src/pages/admin/Settings.jsx', 'r') as f:
    code = f.read()

import_lucide = "import { Check, Lock } from 'lucide-react';"
code = code.replace("import React, { useState, useEffect } from 'react';", "import React, { useState, useEffect } from 'react';\n" + import_lucide)

code = code.replace('<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>', '<Check className="w-4 h-4" />')
code = code.replace('<svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>', '<Lock className="w-4 h-4 text-slate-400" />')

with open('src/pages/admin/Settings.jsx', 'w') as f:
    f.write(code)
