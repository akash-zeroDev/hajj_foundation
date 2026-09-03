with open('server/controllers/organisationController.js', 'r') as f:
    code = f.read()

import_statement = "const NotificationService = require('../services/NotificationService');\n"
if "NotificationService" not in code:
    code = code.replace("const Organisation = require('../models/Organisation');", "const Organisation = require('../models/Organisation');\nconst NotificationService = require('../services/NotificationService');")

update_success = """    if (!org) {
      return res.status(404).json({ success: false, message: 'Organisation not found' });
    }
    
    res.status(200).json({ success: true, data: org });"""

update_success_new = """    if (!org) {
      return res.status(404).json({ success: false, message: 'Organisation not found' });
    }
    
    // Send notification to Super Admins
    await NotificationService.notifySuperAdmin({
      senderId: clerkOrgId,
      senderName: org.name,
      type: 'ORG_DETAILS_UPDATED',
      title: 'Organisation Details Updated',
      message: `${org.name} has updated their profile details.`,
      actionUrl: `/superadmin/organisations/${org._id}`
    });

    res.status(200).json({ success: true, data: org });"""

code = code.replace(update_success, update_success_new)

with open('server/controllers/organisationController.js', 'w') as f:
    f.write(code)
