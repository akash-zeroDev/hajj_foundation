import re
with open('src/pages/Dashboards.jsx', 'r') as f:
    content = f.read()

# Replace: <span className="hide">Welcome, <b id="who">{user?.primaryEmailAddress?.emailAddress}</b></span>
# With: <span className="hide">Welcome, <b id="who">{employeeData?.firstName ? `${employeeData.firstName} ${employeeData.lastName}` : user?.firstName ? `${user.firstName} ${user.lastName || ''}` : user?.primaryEmailAddress?.emailAddress}</b></span>

content = content.replace(
    '<span className="hide">Welcome, <b id="who">{user?.primaryEmailAddress?.emailAddress}</b></span>',
    '<span className="hide">Welcome, <b id="who">{employeeData?.firstName ? `${employeeData.firstName} ${employeeData.lastName || \'\'}`.trim() : user?.firstName ? `${user.firstName} ${user.lastName || \'\'}`.trim() : user?.primaryEmailAddress?.emailAddress}</b></span>'
)

with open('src/pages/Dashboards.jsx', 'w') as f:
    f.write(content)
