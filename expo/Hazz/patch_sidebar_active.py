with open('src/layouts/SidebarLayout.jsx', 'r') as f:
    code = f.read()

old_classes = "? 'bg-green text-ivory shadow-sm'"
new_classes = "? 'bg-[#296043] text-ivory'"

code = code.replace(old_classes, new_classes)

with open('src/layouts/SidebarLayout.jsx', 'w') as f:
    f.write(code)
