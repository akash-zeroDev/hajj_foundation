import re

# 1. employeeRoutes.js
with open('server/routes/employeeRoutes.js', 'r') as f:
    routes = f.read()
routes = routes.replace("router.post('/:clerkId/toggle-suspend', requireOrgAdmin, employeeController.toggleSuspend);\n", "")
with open('server/routes/employeeRoutes.js', 'w') as f:
    f.write(routes)

# 2. employeeController.js
with open('server/controllers/employeeController.js', 'r') as f:
    controller = f.read()

pattern = r"exports\.toggleSuspend = async \(req, res\) => \{.*?\};\n"
controller = re.sub(pattern, "", controller, flags=re.DOTALL)

with open('server/controllers/employeeController.js', 'w') as f:
    f.write(controller)
