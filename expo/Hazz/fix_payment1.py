with open('server/controllers/paymentController.js', 'r') as f:
    code = f.read()

import_statement = "const NotificationService = require('../services/NotificationService');\n"
if "NotificationService" not in code:
    code = code.replace("const Employee = require('../models/Employee');", "const Employee = require('../models/Employee');\nconst NotificationService = require('../services/NotificationService');")

verify_sub_success = """      // Log the transaction if it doesn't already exist
      const existingTx = await Transaction.findOne({ stripeSessionId: session_id });
      if (!existingTx) {
        await Transaction.create({
          amount: employee.monthlyContribution,
          currency: 'GBP',
          type: 'employee_contribution',
          status: 'succeeded',
          stripeSessionId: session_id,
          payerId: employee._id,
          payerModel: 'Employee',
          orgId: employee.organisationId
        });
      }
      return res.status(200).json({ success: true, message: 'Subscription verified and activated' });"""

verify_sub_success_new = """      // Log the transaction if it doesn't already exist
      const existingTx = await Transaction.findOne({ stripeSessionId: session_id });
      if (!existingTx) {
        await Transaction.create({
          amount: employee.monthlyContribution,
          currency: 'GBP',
          type: 'employee_contribution',
          status: 'succeeded',
          stripeSessionId: session_id,
          payerId: employee._id,
          payerModel: 'Employee',
          orgId: employee.organisationId
        });

        // Send notification to Org Admin
        await NotificationService.notifyOrgAdmins({
          orgId: employee.organisationId,
          senderId: employee.clerkUserId,
          senderName: `${employee.firstName} ${employee.lastName}`,
          type: 'EMPLOYEE_SUBSCRIPTION_ACTIVATED',
          title: 'Employee Auto-Pay Activated',
          message: `${employee.firstName} ${employee.lastName} has activated their £${employee.monthlyContribution} monthly auto-pay.`,
          actionUrl: `/admin/payments`
        });
      }
      return res.status(200).json({ success: true, message: 'Subscription verified and activated' });"""

code = code.replace(verify_sub_success, verify_sub_success_new)

with open('server/controllers/paymentController.js', 'w') as f:
    f.write(code)
