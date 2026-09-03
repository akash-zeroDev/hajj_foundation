import re
with open('server/routes/employeeRoutes.js', 'r') as f:
    code = f.read()

# Add the route before module.exports = router;
new_route = "router.post('/:clerkId/toggle-suspend', requireOrgAdmin, employeeController.toggleSuspend);\nmodule.exports = router;"
code = code.replace("module.exports = router;", new_route)

with open('server/routes/employeeRoutes.js', 'w') as f:
    f.write(code)
