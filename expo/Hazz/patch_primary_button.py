with open('src/components/PrimaryButton.jsx', 'r') as f:
    code = f.read()

# Current classes:
old_bg = "bg-gradient-to-b from-[#17a377] to-[#0b7a5b] shadow-[0_10px_22px_-12px_rgba(11,122,91,0.9)] hover:brightness-105"
new_bg = "bg-[#1e4531] shadow-[0_6px_16px_-8px_rgba(30,69,49,0.7)] hover:bg-[#153424]"

code = code.replace(old_bg, new_bg)

with open('src/components/PrimaryButton.jsx', 'w') as f:
    f.write(code)
