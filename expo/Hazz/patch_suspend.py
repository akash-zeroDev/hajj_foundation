with open('server/controllers/organisationController.js', 'r') as f:
    content = f.read()

anchor = """    org.isSuspended = !org.isSuspended;
    await org.save();"""

replacement = """    org.isSuspended = !org.isSuspended;
    await org.save();

    try {
        await clerkClient.organizations.updateOrganization(org.clerkId, {
            publicMetadata: { isSuspended: org.isSuspended }
        });
    } catch (clerkErr) {
        console.error('Failed to sync suspension to Clerk:', clerkErr);
    }"""

if "updateOrganization(org.clerkId" not in content:
    content = content.replace(anchor, replacement)
    
with open('server/controllers/organisationController.js', 'w') as f:
    f.write(content)
