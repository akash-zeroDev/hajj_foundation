import re

with open('src/pages/superadmin/UsersList.jsx', 'r') as f:
    code = f.read()

# Add X to imports
code = code.replace("Award } from 'lucide-react';", "Award, X } from 'lucide-react';")

# Replace SVG
old_svg = """<svg viewBox="0 0 24 24" className="w-[12px] h-[12px] stroke-current stroke-[2] fill-none"><path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18"/></svg>"""
new_svg = '<X className="w-[12px] h-[12px] stroke-[2]" />'

code = code.replace(old_svg, new_svg)

with open('src/pages/superadmin/UsersList.jsx', 'w') as f:
    f.write(code)

