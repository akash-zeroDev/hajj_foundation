with open('server/controllers/paymentController.js', 'r') as f:
    code = f.read()

cancel_sub_success = """    employee.subscriptionStatus = 'cancelled';
    employee.stripeSubscriptionId = null;
    await employee.save();
    
    res.json({ success: true, message: 'Auto Pay cancelled successfully' });"""

cancel_sub_success_new = """    employee.subscriptionStatus = 'cancelled';
    employee.stripeSubscriptionId = null;
    await employee.save();
    
    // Send notification to Org Admin
    await NotificationService.notifyOrgAdmins({
      orgId: employee.organisationId,
      senderId: employee.clerkUserId,
      senderName: `${employee.firstName} ${employee.lastName}`,
      type: 'EMPLOYEE_SUBSCRIPTION_CANCELLED',
      title: 'Employee Auto-Pay Cancelled',
      message: `${employee.firstName} ${employee.lastName} has cancelled their monthly auto-pay.`,
      actionUrl: `/admin/employees`
    });

    res.json({ success: true, message: 'Auto Pay cancelled successfully' });"""

code = code.replace(cancel_sub_success, cancel_sub_success_new)

with open('server/controllers/paymentController.js', 'w') as f:
    f.write(code)
