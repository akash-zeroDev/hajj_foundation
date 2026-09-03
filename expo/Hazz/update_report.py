import re

with open('server/controllers/reportController.js', 'r') as f:
    code = f.read()

# Add Clerk SDK
if "createClerkClient" not in code:
    code = "const { createClerkClient } = require('@clerk/clerk-sdk-node');\nconst clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });\n" + code

# Add suspended count
old_employee_stats = """    const totalEmployees = await Employee.countDocuments();
    const activeEmployees = await Employee.countDocuments({ isRemoved: { $ne: true } });
    const compliantEmployees = await Employee.countDocuments({ agreementStatus: 'signed', isRemoved: { $ne: true } });
    const pendingEmployees = activeEmployees - compliantEmployees;"""

new_employee_stats = """    const totalEmployees = await Employee.countDocuments();
    const activeEmployees = await Employee.countDocuments({ isRemoved: { $ne: true } });
    const compliantEmployees = await Employee.countDocuments({ agreementStatus: 'signed', isRemoved: { $ne: true } });
    const pendingEmployees = activeEmployees - compliantEmployees;
    
    // Fetch suspended users from Clerk
    let suspendedUsersCount = 0;
    try {
      const usersResponse = await clerk.users.getUserList();
      const allUsers = Array.isArray(usersResponse) ? usersResponse : (usersResponse.data || []);
      suspendedUsersCount = allUsers.filter(u => u.banned || u.publicMetadata?.isSuspended).length;
    } catch (err) {
      console.error('Error fetching suspended users from clerk for reports:', err);
    }"""
    
code = code.replace(old_employee_stats, new_employee_stats)

old_stats_return = """      employees: {
        total: totalEmployees,
        active: activeEmployees,
        compliant: compliantEmployees,
        pending: pendingEmployees
      },"""

new_stats_return = """      employees: {
        total: totalEmployees,
        active: activeEmployees,
        compliant: compliantEmployees,
        pending: pendingEmployees,
        suspended: suspendedUsersCount
      },"""

code = code.replace(old_stats_return, new_stats_return)

with open('server/controllers/reportController.js', 'w') as f:
    f.write(code)
