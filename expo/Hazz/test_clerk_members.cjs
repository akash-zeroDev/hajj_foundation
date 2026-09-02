require('dotenv').config();
const { createClerkClient } = require('@clerk/clerk-sdk-node');
const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

async function test() {
  try {
    const orgs = await clerk.organizations.getOrganizationList();
    if (orgs.data.length > 0) {
      const orgId = orgs.data[0].id;
      const mems = await clerk.organizations.getOrganizationMembershipList({ organizationId: orgId });
      console.log('Success:', mems.data.map(m => m.publicUserData.userId));
    } else {
      console.log('No orgs found');
    }
  } catch (e) {
    console.error('Error:', e);
  }
}
test();
