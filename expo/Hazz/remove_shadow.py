with open('src/components/PrimaryButton.jsx', 'r') as f:
    code = f.read()

old_bg = "bg-[#296043] shadow-[0_6px_16px_-8px_rgba(41,96,67,0.7)] hover:bg-[#1e4531]"
new_bg = "bg-[#296043] hover:bg-[#1e4531]"

code = code.replace(old_bg, new_bg)

with open('src/components/PrimaryButton.jsx', 'w') as f:
    f.write(code)
