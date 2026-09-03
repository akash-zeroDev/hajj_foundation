import re

with open('src/pages/superadmin/UsersList.jsx', 'r') as f:
    code = f.read()

old_delete_success = """      showToast('User permanently deleted', 'success');
      setActiveUser(null);
      fetchUsers(); // Refresh list"""

new_delete_success = """      showToast('User permanently deleted', 'success');
      setActiveUser(null);
      setSelectedUser(null);
      fetchUsers(); // Refresh list"""

code = code.replace(old_delete_success, new_delete_success)

with open('src/pages/superadmin/UsersList.jsx', 'w') as f:
    f.write(code)

