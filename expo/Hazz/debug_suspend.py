with open('src/pages/admin/AdminEmployees.jsx', 'r') as f:
    code = f.read()

old_prop = "onSuspend={() => setConfirmSuspendTarget(selectedMember.publicUserData?.userId || selectedMember.clerkUserId)}"
new_prop = """onSuspend={() => {
          const target = selectedMember.publicUserData?.userId || selectedMember.clerkUserId || selectedMember.id;
          console.log('Suspend clicked for:', target, selectedMember);
          setConfirmSuspendTarget(target);
        }}"""

code = code.replace(old_prop, new_prop)

with open('src/pages/admin/AdminEmployees.jsx', 'w') as f:
    f.write(code)
