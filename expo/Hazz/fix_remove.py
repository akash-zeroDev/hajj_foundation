with open('src/pages/admin/AdminEmployees.jsx', 'r') as f:
    content = f.read()

remove_old = """  const executeRemove = async () => {
    if (!confirmRemoveTarget) return;
    try {
      await organization.removeMember(confirmRemoveTarget);
      const mems = await organization.getMemberships();
      setMembers(mems?.data || mems || []);
      if (activeMember && activeMember.publicUserData.userId === confirmRemoveTarget) {
        setActiveMember(null);
        setSelectedMember(null);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setConfirmRemoveTarget(null);
    }
  };"""

remove_new = """  const executeRemove = async () => {
    if (!confirmRemoveTarget) return;
    setIsRemoving(true);
    try {
      await organization.removeMember(confirmRemoveTarget);
      // Also tell backend to soft delete
      await fetch(`http://localhost:5000/api/organisations/${organization.id}/employees/${confirmRemoveTarget}/remove`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${await getToken()}` }
      });
      // Fetch fresh merged members
      let activeMembers = await organization.getMemberships();
      const dbRes = await fetch(`http://localhost:5000/api/organisations/clerk/${organization.id}/employee-agreements`, { headers: { Authorization: `Bearer ${await getToken()}` } });
      if (dbRes.ok) {
          const dbData = await dbRes.json();
          const allDb = dbData.data || [];
          setAllDbEmployees(allDb);
          const removedDb = allDb.filter(emp => emp.isRemoved);
          const removedMocks = removedDb.map(emp => ({
            id: 'removed_' + emp._id,
            role: 'org:member',
            isRemoved: true,
            createdAt: emp.createdAt,
            publicUserData: {
                firstName: emp.firstName || '',
                lastName: emp.lastName || '',
                identifier: emp.email || '',
                hasImage: false
            },
            clerkUserId: emp.clerkUserId
          }));
          activeMembers = [...activeMembers, ...removedMocks];
      }
      setMembers(activeMembers);

      if (activeMember && (activeMember.publicUserData?.userId === confirmRemoveTarget || activeMember.clerkUserId === confirmRemoveTarget)) {
        setActiveMember(null);
        setSelectedMember(null);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setConfirmRemoveTarget(null);
      setIsRemoving(false);
    }
  };"""

if remove_old in content:
    content = content.replace(remove_old, remove_new)
    print("executeRemove patched perfectly.")
else:
    print("Could not find old executeRemove.")

with open('src/pages/admin/AdminEmployees.jsx', 'w') as f:
    f.write(content)
