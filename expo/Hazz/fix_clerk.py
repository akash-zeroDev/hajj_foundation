with open('server/controllers/organisationController.js', 'r') as f:
    content = f.read()

content = content.replace("await clerkClient.organizations.updateOrganization(org.clerkId, {", "await clerk.organizations.updateOrganization({\n            organizationId: org.clerkOrganizationId,")

with open('server/controllers/organisationController.js', 'w') as f:
    f.write(content)
