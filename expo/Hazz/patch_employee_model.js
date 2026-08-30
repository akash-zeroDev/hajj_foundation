const fs = require('fs');
const path = './server/models/Employee.js';
let content = fs.readFileSync(path, 'utf8');

const newFields = `
  firstName: { type: String },
  lastName: { type: String },
  phone: { type: String },
  agreementStatus: {
`;
content = content.replace(/agreementStatus: \{/, newFields);
fs.writeFileSync(path, content);
