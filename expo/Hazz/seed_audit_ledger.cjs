const mongoose = require('mongoose');
const AuditLog = require('./server/models/AuditLog');
const Transaction = require('./server/models/Transaction');
const Organisation = require('./server/models/Organisation');

require('dotenv').config();

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hazz');
  
  // Find an org
  const org = await Organisation.findOne();
  if (org) {
    const tx = new Transaction({
      amount: 12300,
      currency: 'GBP',
      type: 'employer_fee',
      status: 'succeeded',
      stripeSessionId: 'cs_test_mock_123',
      payerId: org._id,
      payerModel: 'Organisation',
      orgId: org._id
    });
    await tx.save();
    console.log("Mock transaction created.");
  }

  const log = new AuditLog({
    clerkUserId: 'user_admin_mock_123',
    action: 'DOWNLOADED_LEDGER_CSV',
    details: 'Superadmin downloaded the global financial ledger.',
    ipAddress: '192.168.1.1'
  });
  await log.save();
  console.log("Mock audit log created.");

  process.exit(0);
}

seed();
