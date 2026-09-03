with open('src/pages/admin/AgreementsTracking.jsx', 'r') as f:
    code = f.read()

import_lucide = "import { Send, Users, CheckCircle, Clock, Search, Check, Loader2 } from 'lucide-react';"
code = code.replace("import React, { useState, useEffect } from 'react';", "import React, { useState, useEffect } from 'react';\n" + import_lucide)

# Button spinner
code = code.replace('<svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>', '<Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" />')

# Button Icon
code = code.replace('<svg viewBox="0 0 24 24"><path d="M4 5h16v11H8l-4 4z"/></svg>', '<Send className="w-[18px] h-[18px] mr-1.5" />')

# Total enrolled
code = code.replace('<svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-5 6-5s6 1.7 6 5"/><path d="M17 8.5a2.8 2.8 0 010 5.5"/></svg>', '<Users className="w-full h-full" />')

# Fully compliant
code = code.replace('<svg viewBox="0 0 24 24"><path d="M5 12l5 5L20 7"/></svg>', '<CheckCircle className="w-full h-full" />')

# Pending signature KPI
code = code.replace('<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 8v4l3 2"/></svg>', '<Clock className="w-full h-full" />')

# Search icon
code = code.replace('<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6"/><path d="M20 20l-4.2-4.2"/></svg>', '<Search className="w-[14px] h-[14px]" />')

# Tags
code = code.replace('<span className="agt-tag"><svg viewBox="0 0 24 24"><path d="M5 12l5 5L20 7"/></svg>Signed</span>', '<span className="agt-tag"><Check className="w-3 h-3" />Signed</span>')
code = code.replace('<span className="agt-tag agt-warn"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 8v4"/></svg>Pending</span>', '<span className="agt-tag agt-warn"><Clock className="w-3 h-3" />Pending</span>')

with open('src/pages/admin/AgreementsTracking.jsx', 'w') as f:
    f.write(code)
