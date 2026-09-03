with open('src/pages/Dashboards.jsx', 'r') as f:
    code = f.read()

code = code.replace('bg-[rgba(11,122,91,.10)]', 'bg-[#296043]/10')
code = code.replace('text-[#138a64]', 'text-[#296043]')
code = code.replace('bg-[#e6f5ef]', 'bg-[#296043]/10')
code = code.replace('text-[#17a377]', 'text-[#296043]')

with open('src/pages/Dashboards.jsx', 'w') as f:
    f.write(code)
