const { createClerkClient } = require('@clerk/clerk-sdk-node');
const clerk = createClerkClient({ secretKey: 'dummy' });

console.log(Object.keys(clerk));
console.log(Object.keys(clerk.users));
console.log(Object.keys(clerk.emails || {}));
