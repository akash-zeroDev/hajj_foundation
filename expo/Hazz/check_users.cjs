require('dotenv').config();
const { createClerkClient } = require('@clerk/clerk-sdk-node');
const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

async function check() {
  const users = await clerk.users.getUserList({ limit: 3 });
  const rawUsers = Array.isArray(users) ? users : (users.data || []);
  console.log(JSON.stringify(rawUsers[0].publicMetadata, null, 2));
  console.log(JSON.stringify(rawUsers[1].publicMetadata, null, 2));
}
check();
