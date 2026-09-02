const { createClerkClient } = require('@clerk/clerk-sdk-node');
require('dotenv').config();

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

async function test() {
  try {
    const org = await clerk.organizations.createOrganization({
      name: 'Test Org 123',
      createdBy: 'user_2bF3K1x00Tq...' // just need an org
    });
    console.log('Org created:', org.id);

    const inv = await clerk.organizations.createOrganizationInvitation({
      organizationId: org.id,
      emailAddress: 'testinvite999@example.com',
      role: 'org:admin',
      redirectUrl: 'http://localhost:5173/dashboard'
    });
    
    console.log('Invitation created:');
    console.log(inv);
    
    // We can revoke the invite and delete org later if we want
  } catch(e) {
    console.log(e);
  }
}
test();
