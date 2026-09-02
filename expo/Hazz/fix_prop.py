with open('src/pages/admin/AdminEmployees.jsx', 'r') as f:
    content = f.read()

bad_prop = "employeeProfile={activeMember ? allDbEmployees.find(e => e.clerkUserId === (activeMember.publicUserData?.userId || activeMember.clerkUserId)) : null}"
good_prop = "employeeProfile={employeeProfile || (activeMember ? allDbEmployees.find(e => e.clerkUserId === (activeMember.publicUserData?.userId || activeMember.clerkUserId)) : null)}"

content = content.replace(bad_prop, good_prop)

with open('src/pages/admin/AdminEmployees.jsx', 'w') as f:
    f.write(content)
