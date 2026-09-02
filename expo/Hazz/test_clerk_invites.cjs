const { createClerkClient } = require('@clerk/clerk-sdk-node');
require('dotenv').config({ path: '.env' });
const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

async function run() {
    try {
        const invites = await clerk.organizations.getOrganizationInvitationList({
            organizationId: 'org_2lbwE9V8h9pY9pY9pY9pY9pY9pY' // Doesn't matter, just want to see if it throws method not found
        });
        console.log("Success!");
    } catch (e) {
        console.error(e.message);
    }
}
run();
