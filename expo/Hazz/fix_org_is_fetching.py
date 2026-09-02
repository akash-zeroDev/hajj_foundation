with open('src/pages/superadmin/OrganisationDetails.jsx', 'r') as f:
    content = f.read()

content = content.replace("isFetchingProfile={isFetchingProfile}", "isFetchingProfile={false}")

with open('src/pages/superadmin/OrganisationDetails.jsx', 'w') as f:
    f.write(content)
