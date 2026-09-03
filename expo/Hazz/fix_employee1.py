with open('server/controllers/employeeController.js', 'r') as f:
    code = f.read()

import_statement = "const Employee = require('../models/Employee');\nconst NotificationService = require('../services/NotificationService');\n"
code = code.replace("const Employee = require('../models/Employee');", import_statement)

onboarding_success = """    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    res.status(200).json({ success: true, data: employee });"""

onboarding_success_new = """    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    // Send notification to Org Admin
    await NotificationService.notifyOrgAdmins({
      orgId: employee.organisationId,
      senderId: employee.clerkUserId,
      senderName: `${firstName} ${lastName}`,
      type: 'EMPLOYEE_ONBOARDING_COMPLETED',
      title: 'Employee Onboarding Complete',
      message: `${firstName} ${lastName} has signed the master agreement and completed onboarding.`,
      actionUrl: `/admin/employees`
    });

    res.status(200).json({ success: true, data: employee });"""

code = code.replace(onboarding_success, onboarding_success_new)

with open('server/controllers/employeeController.js', 'w') as f:
    f.write(code)
