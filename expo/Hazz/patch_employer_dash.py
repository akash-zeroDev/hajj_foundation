import re

with open('src/pages/Dashboards.jsx', 'r') as f:
    code = f.read()

import_lucide = "import { FileText, Plus, Users, ChevronUp, PoundSterling, Trophy, AlertTriangle, Check, CreditCard } from 'lucide-react';"
code = code.replace("import React, { useState, useEffect } from 'react';", "import React, { useState, useEffect } from 'react';\n" + import_lucide)

# Line 122 (FileText)
code = re.sub(r'<svg viewBox="0 0 24 24" className="w-5 h-5 stroke-current stroke-\[2\] fill-none"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7.*?/svg>', '<FileText className="w-5 h-5" />', code)

# Line 186 (Plus)
code = re.sub(r'<svg className="w-4 h-4 stroke-current stroke-\[2\] fill-none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14"/></svg>', '<Plus className="w-4 h-4 stroke-[3]" />', code)

# Line 197 (Users)
code = re.sub(r'<svg viewBox="0 0 24 24" className="w-\[17px\] h-\[17px\] stroke-current stroke-\[1\.8\] fill-none"><circle cx="9" cy="8" r="3\.2"/><path strokeLinecap="round" strokeLinejoin="round" d="M3 20c0-3\.3 2\.7-5 6-5s6 1\.7 6 5"/></svg>', '<Users className="w-[17px] h-[17px]" />', code)

# Line 202 (ChevronUp)
code = re.sub(r'<svg viewBox="0 0 24 24" className="w-\[13px\] h-\[13px\] stroke-current stroke-\[2\.2\] fill-none"><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7"/></svg>', '<ChevronUp className="w-[13px] h-[13px]" />', code)

# Line 210 (PoundSterling)
code = re.sub(r'<svg viewBox="0 0 24 24" className="w-\[17px\] h-\[17px\] stroke-current stroke-\[1\.8\] fill-none"><circle cx="12" cy="12" r="8"/><path strokeLinecap="round" strokeLinejoin="round" d="M14 9\.5A2\.5 2\.5 0 1012 15"/></svg>', '<PoundSterling className="w-[17px] h-[17px]" />', code)

# Line 219 (Trophy)
code = re.sub(r'<svg viewBox="0 0 24 24" className="w-\[17px\] h-\[17px\] stroke-current stroke-\[1\.8\] fill-none"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4h16v6a8 8 0 01-16 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M9 20h6M12 18v2"/></svg>', '<Trophy className="w-[17px] h-[17px]" />', code)

# Line 279 (AlertTriangle)
code = re.sub(r'<svg viewBox="0 0 24 24" className="w-\[16px\] h-\[16px\] stroke-current stroke-\[1\.9\] fill-none"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4l9 16H3z"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 10v4M12 17h\.01"/></svg>', '<AlertTriangle className="w-[16px] h-[16px]" />', code)

# Line 286 (Check)
code = re.sub(r'<svg viewBox="0 0 24 24" className="w-\[16px\] h-\[16px\] stroke-current stroke-\[1\.9\] fill-none"><path strokeLinecap="round" strokeLinejoin="round" d="M20 6L9 17l-5-5"/></svg>', '<Check className="w-[16px] h-[16px] stroke-[3]" />', code)

# Line 293 (AlertTriangle)
code = re.sub(r'<svg viewBox="0 0 24 24" className="w-\[16px\] h-\[16px\] stroke-current stroke-\[1\.9\] fill-none"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h\.01m-6\.938 4h13\.856c1\.54 0 2\.502-1\.667 1\.732-3L13\.732 4c-\.77-1\.333-2\.694-1\.333-3\.464 0L3\.34 16c-\.77 1\.333\.192 3 1\.732 3z"/></svg>', '<AlertTriangle className="w-[16px] h-[16px]" />', code)

# Line 300 (Users)
code = re.sub(r'<svg viewBox="0 0 24 24" className="w-\[16px\] h-\[16px\] stroke-current stroke-\[1\.9\] fill-none"><circle cx="9" cy="8" r="3\.2"/><path strokeLinecap="round" strokeLinejoin="round" d="M3 20c0-3\.3 2\.7-5 6-5s6 1\.7 6 5"/></svg>', '<Users className="w-[16px] h-[16px]" />', code)

# Line 365 (Plus)
code = re.sub(r'<svg viewBox="0 0 24 24" className="w-\[16px\] h-\[16px\] stroke-current stroke-\[1\.9\] fill-none"><path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14"/></svg>', '<Plus className="w-[16px] h-[16px] stroke-[3]" />', code)

# Line 369 (CreditCard)
code = re.sub(r'<svg viewBox="0 0 24 24" className="w-\[16px\] h-\[16px\] stroke-current stroke-\[1\.9\] fill-none"><rect x="3" y="6" width="18" height="12" rx="2"/><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18"/></svg>', '<CreditCard className="w-[16px] h-[16px]" />', code)

# Line 373 (FileText)
code = re.sub(r'<svg viewBox="0 0 24 24" className="w-\[16px\] h-\[16px\] stroke-current stroke-\[1\.9\] fill-none"><path strokeLinecap="round" strokeLinejoin="round" d="M7 3h7l5 5v13H7z"/><path strokeLinecap="round" strokeLinejoin="round" d="M14 3v5h5"/></svg>', '<FileText className="w-[16px] h-[16px]" />', code)


with open('src/pages/Dashboards.jsx', 'w') as f:
    f.write(code)

