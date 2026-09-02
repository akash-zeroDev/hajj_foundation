with open('src/pages/admin/AdminEmployees.jsx', 'r') as f:
    content = f.read()

anchor = "const [allDbEmployees, setAllDbEmployees] = useState([]);"
new_state = anchor + "\n  const [isRemoving, setIsRemoving] = useState(false);"

content = content.replace(anchor, new_state)

with open('src/pages/admin/AdminEmployees.jsx', 'w') as f:
    f.write(content)
