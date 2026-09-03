with open('server/controllers/paymentController.js', 'r') as f:
    code = f.read()

verify_fee_success = """      const existingTx = await Transaction.findOne({ stripeSessionId: session_id });
      if (!existingTx) {
        await Transaction.create({
          amount: session.amount_total / 100,
          currency: 'GBP',
          type: 'employer_fee',
          status: 'succeeded',
          stripeSessionId: session_id,
          payerId: orgId,
          payerModel: 'Organisation',
          orgId: orgId
        });
      }
      return res.status(200).json({ success: true, message: 'Payment verified and updated' });"""

verify_fee_success_new = """      const existingTx = await Transaction.findOne({ stripeSessionId: session_id });
      if (!existingTx) {
        await Transaction.create({
          amount: session.amount_total / 100,
          currency: 'GBP',
          type: 'employer_fee',
          status: 'succeeded',
          stripeSessionId: session_id,
          payerId: orgId,
          payerModel: 'Organisation',
          orgId: orgId
        });

        // Send notification to Super Admins
        await NotificationService.notifySuperAdmin({
          senderId: org.clerkOrganizationId,
          senderName: org.name,
          type: 'ORG_FEE_PAID',
          title: 'Annual Fee Paid',
          message: `${org.name} has successfully paid their annual platform fee of £${session.amount_total / 100}.`,
          actionUrl: `/superadmin/payments`
        });
      }
      return res.status(200).json({ success: true, message: 'Payment verified and updated' });"""

code = code.replace(verify_fee_success, verify_fee_success_new)

with open('server/controllers/paymentController.js', 'w') as f:
    f.write(code)
