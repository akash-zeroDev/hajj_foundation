const { createClerkClient } = require('@clerk/clerk-sdk-node');
const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

async function checkUser() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const org = await mongoose.model('Organisation', new mongoose.Schema({}, { strict: false })).findOne({ adminEmail: 'ezcjqm5363@minitts.net' });
  console.log('Org found:', org);

  try {
    const users = await clerk.users.getUserList({ emailAddress: ['ezcjqm5363@minitts.net'] });
    console.log('Clerk Users found:', users.data.length);
  } catch(e) {
    console.log('Clerk error:', e.message);
  }
  
  process.exit(0);
}
checkUser();
