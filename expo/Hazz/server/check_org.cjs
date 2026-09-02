const mongoose = require('mongoose');
require('dotenv').config();

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const org = await mongoose.connection.collection('organisations').findOne({ 
      adminEmail: 'ezcjqm5363@minitts.net' 
    });
    
    if (org) {
      console.log('--- FOUND ORG ---');
      console.log('Name:', org.name);
      console.log('Admin Email:', org.adminEmail);
      console.log('isArchived:', org.isArchived);
      console.log('isSuspended:', org.isSuspended);
    } else {
      console.log('Org not found in database.');
    }
  } catch(e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}

check();
