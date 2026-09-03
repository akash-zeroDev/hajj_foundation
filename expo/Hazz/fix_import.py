with open('server/controllers/employeeController.js', 'r') as f:
    code = f.read()

code = code.replace("const Employee = require('../models/Employee');", "const { getAuth } = require('@clerk/express');\nconst Employee = require('../models/Employee');")

with open('server/controllers/employeeController.js', 'w') as f:
    f.write(code)
