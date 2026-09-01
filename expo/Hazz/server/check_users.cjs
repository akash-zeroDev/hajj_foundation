require('dotenv').config();
const { createClerkClient } = require('@clerk/clerk-sdk-node');
const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

async function check() {
  const users = await clerk.users.getUserList({ limit: 5 });
  const rawUsers = Array.isArray(users) ? users : (users.data || []);
  rawUsers.forEach(u => {
    console.log(u.emailAddresses[0]?.emailAddress);
    console.log(u.publicMetadata);
  });
}
check();
