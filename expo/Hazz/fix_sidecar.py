with open('src/components/EmployeeProfileSidecar.jsx', 'r') as f:
    code = f.read()

target = "const userId = activeMember.publicUserData?.userId || activeMember.id;"
replacement = "const userId = activeMember.publicUserData?.userId || activeMember.id;\n  const isSuspended = activeMember.publicMetadata?.isSuspended;"

code = code.replace(target, replacement)

with open('src/components/EmployeeProfileSidecar.jsx', 'w') as f:
    f.write(code)
