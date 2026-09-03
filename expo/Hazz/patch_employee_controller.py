with open('server/controllers/employeeController.js', 'r') as f:
    code = f.read()

new_func = """
exports.toggleSuspend = async (req, res) => {
  try {
    const { clerkId } = req.params;
    
    const auth = getAuth(req);
    // Superadmin bypasses org check, otherwise must match org
    const userCaller = await clerk.users.getUser(auth.userId);
    const isSuperAdmin = userCaller.publicMetadata?.role === 'superadmin';
    
    if (!isSuperAdmin) {
      if (!auth.orgId) {
          return res.status(403).json({ success: false, message: 'Forbidden: No active organization' });
      }
      const org = await Organisation.findOne({ clerkOrganizationId: auth.orgId });
      if (!org) return res.status(404).json({ success: false, message: 'Org not found' });
      
      const employee = await Employee.findOne({ clerkUserId: clerkId, organisationId: org._id });
      if (!employee) {
          return res.status(404).json({ success: false, message: 'Employee not found in your organisation' });
      }
    }
    
    const userToSuspend = await clerk.users.getUser(clerkId);
    const isCurrentlySuspended = userToSuspend.publicMetadata?.isSuspended === true;
    
    const updatedUser = await clerk.users.updateUserMetadata(clerkId, {
        publicMetadata: {
            isSuspended: !isCurrentlySuspended
        }
    });

    res.status(200).json({ success: true, banned: updatedUser.publicMetadata.isSuspended });
  } catch (error) {
    console.error('Error toggling suspend:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to toggle suspend status' });
  }
};
"""
code += new_func

with open('server/controllers/employeeController.js', 'w') as f:
    f.write(code)
