const fs = require('fs');
const path = './server/models/AuditLog.js';
let content = fs.readFileSync(path, 'utf8');

// Replace the enum array to include the new download tracking actions
content = content.replace(
  /enum: \[\s*'UPDATED_BANK_ROUTING',\s*'UPLOADED_DOCUMENT',\s*'EXECUTED_DRAW',\s*'APPROVED_DRAW',\s*'DISCARDED_DRAW'\s*\]/g,
  \`enum: [
      'UPDATED_BANK_ROUTING',
      'UPLOADED_DOCUMENT',
      'EXECUTED_DRAW',
      'APPROVED_DRAW',
      'DISCARDED_DRAW',
      'DOWNLOADED_LEDGER_CSV',
      'DOWNLOADED_OPS_PDF',
      'DOWNLOADED_SAVINGS_STATEMENT',
      'VIEWED_SIGNED_CONTRACT'
    ]\`
);

fs.writeFileSync(path, content);
