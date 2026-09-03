with open('server/controllers/employeeController.js', 'r') as f:
    code = f.read()

new_invite_method = """
exports.inviteEmployee = async (req, res) => {
  try {
    const { emailAddress, role } = req.body;
    const auth = getAuth(req);
    const orgId = auth.orgId; // The Clerk Organization ID

    if (!orgId) {
      return res.status(400).json({ success: false, message: 'Must be in an organization to invite members' });
    }

    if (auth.orgRole !== 'org:admin') {
      return res.status(403).json({ success: false, message: 'Must be an admin to invite members' });
    }

    // Use the backend SDK to invite, which supports redirectUrl!
    const invitation = await clerk.organizations.createOrganizationInvitation({
      organizationId: orgId,
      emailAddress,
      role: role || 'org:member',
      redirectUrl: 'http://localhost:5173/dashboard'
    });

    res.status(200).json({ success: true, data: invitation });
  } catch (error) {
    console.error('Error inviting employee:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to send invite' });
  }
};
"""

code += new_invite_method

with open('server/controllers/employeeController.js', 'w') as f:
    f.write(code)

with open('server/routes/employeeRoutes.js', 'r') as f:
    routes = f.read()

routes = routes.replace(
    "router.patch('/:id/bank-settings', requireSelf, employeeController.updateBankSettings);",
    "router.patch('/:id/bank-settings', requireSelf, employeeController.updateBankSettings);\nrouter.post('/invite', requireOrgAdmin, employeeController.inviteEmployee);"
)

with open('server/routes/employeeRoutes.js', 'w') as f:
    f.write(routes)
