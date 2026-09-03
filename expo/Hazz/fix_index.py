with open('server/index.js', 'r') as f:
    code = f.read()

code = code.replace(
    "const auditRoutes = require('./routes/auditRoutes');",
    "const auditRoutes = require('./routes/auditRoutes');\nconst notificationRoutes = require('./routes/notificationRoutes');"
)

code = code.replace(
    "app.use('/api/audit-logs', auditRoutes);",
    "app.use('/api/audit-logs', auditRoutes);\napp.use('/api/notifications', notificationRoutes);"
)

with open('server/index.js', 'w') as f:
    f.write(code)
