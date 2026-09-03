with open('src/pages/admin/AdminEmployees.jsx', 'r') as f:
    code = f.read()

code = code.replace(
    "const [isRemoving, setIsRemoving] = useState(false);",
    "const [isRemoving, setIsRemoving] = useState(false);\n  const [isRevoking, setIsRevoking] = useState(false);"
)

old_revoke_fn = """  const executeRevoke = async () => {
    if (!confirmRevokeTarget) return;
    try {
      await confirmRevokeTarget.revoke();
      const invs = await organization.getInvitations({ status: 'pending' });
      const rawInvs = invs?.data || invs || [];
      setInvitations(rawInvs.filter(inv => inv.status === 'pending'));
    } catch (error) {
      console.error(error);
    } finally {
      setConfirmRevokeTarget(null);
    }
  };"""

new_revoke_fn = """  const executeRevoke = async () => {
    if (!confirmRevokeTarget) return;
    setIsRevoking(true);
    try {
      await confirmRevokeTarget.revoke();
      const invs = await organization.getInvitations({ status: 'pending' });
      const rawInvs = invs?.data || invs || [];
      setInvitations(rawInvs.filter(inv => inv.status === 'pending'));
    } catch (error) {
      console.error(error);
    } finally {
      setIsRevoking(false);
      setConfirmRevokeTarget(null);
    }
  };"""

code = code.replace(old_revoke_fn, new_revoke_fn)

with open('src/pages/admin/AdminEmployees.jsx', 'w') as f:
    f.write(code)
