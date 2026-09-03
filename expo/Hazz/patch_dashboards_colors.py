import re

with open('src/pages/Dashboards.jsx', 'r') as f:
    code = f.read()

# 1. Update the Monthly Award Draw Banner
banner_old = "bg-[radial-gradient(120%_120%_at_100%_0%,rgba(23,163,119,.35),transparent_60%),linear-gradient(135deg,#0b7a5b,#075c44)] flex flex-col md:flex-row md:items-center gap-[22px] shadow-[0_18px_34px_-22px_rgba(7,92,68,.9)]"
banner_new = "bg-[#296043] flex flex-col md:flex-row md:items-center gap-[22px] shadow-[0_18px_34px_-22px_rgba(30,69,49,.9)]"
code = code.replace(banner_old, banner_new)

# 2. Update BarChart cells
code = code.replace('fill="#0b7a5b"', 'fill="#296043"')

# 3. Update icon backgrounds and text colors
code = code.replace('bg-[rgba(23,163,119,.14)]', 'bg-[#296043]/15')
code = code.replace('bg-[rgba(23,163,119,.12)]', 'bg-[#296043]/15')
code = code.replace('text-[#0b7a5b]', 'text-[#296043]')
code = code.replace('bg-[#17a377]/15', 'bg-[#296043]/15')
code = code.replace('text-[#0a6b50]', 'text-[#1e4531]')

# Update "Last 6 months" and "All clear" tags that might use green?
# No, "All clear" is currently `bg-[#e6f5ef] text-[#138a64]`. Let's update `text-[#138a64]` to `text-[#296043]` and `bg-[#e6f5ef]` to `bg-[#296043]/10`
code = code.replace('bg-[#e6f5ef] text-[#138a64]', 'bg-[#296043]/10 text-[#296043]')

with open('src/pages/Dashboards.jsx', 'w') as f:
    f.write(code)
