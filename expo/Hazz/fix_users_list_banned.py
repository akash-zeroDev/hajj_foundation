with open('src/pages/superadmin/UsersList.jsx', 'r') as f:
    content = f.read()

# Replace user.banned with user.publicMetadata?.isSuspended
content = content.replace("user.banned", "user.publicMetadata?.isSuspended")
content = content.replace("activeUser.banned", "activeUser.publicMetadata?.isSuspended")

# Wait, the toggle action in toggleSuspend handler is returning `banned`:
# const action = data.banned ? 'suspended' : 'unsuspended';
# That's fine.

with open('src/pages/superadmin/UsersList.jsx', 'w') as f:
    f.write(content)
