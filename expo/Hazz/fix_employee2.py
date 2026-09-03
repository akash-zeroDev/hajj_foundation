with open('server/controllers/employeeController.js', 'r') as f:
    code = f.read()

update_success = """    // Sync with Clerk
    try {
      await clerk.users.updateUser(clerkId, {
        firstName,
        lastName
      });
    } catch (clerkErr) {
      console.error('Failed to sync name to Clerk during update:', clerkErr);
    }

    res.status(200).json({ success: true, data: employee });"""

update_success_new = """    // Sync with Clerk
    try {
      await clerk.users.updateUser(clerkId, {
        firstName,
        lastName
      });
    } catch (clerkErr) {
      console.error('Failed to sync name to Clerk during update:', clerkErr);
    }

    // Send notification to Org Admin
    await NotificationService.notifyOrgAdmins({
      orgId: employee.organisationId,
      senderId: clerkId,
      senderName: `${firstName} ${lastName}`,
      type: 'EMPLOYEE_PROFILE_UPDATED',
      title: 'Employee Profile Updated',
      message: `${firstName} ${lastName} has updated their profile details.`,
      actionUrl: `/admin/employees`
    });

    res.status(200).json({ success: true, data: employee });"""

code = code.replace(update_success, update_success_new)

with open('server/controllers/employeeController.js', 'w') as f:
    f.write(code)
