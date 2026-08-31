const https = require('https');
const dotenv = require('dotenv');
dotenv.config({ path: 'server/.env' });

const options = {
  hostname: 'api.clerk.com',
  path: '/v1/users',
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
    'Content-Type': 'application/json'
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    try {
      const users = JSON.parse(data);
      if (!Array.isArray(users)) {
        console.log('Error fetching users:', users);
        return;
      }
      const superadmins = users.filter(u => u.public_metadata && u.public_metadata.role === 'superadmin');
      if (superadmins.length === 0) {
        console.log('No superadmin found!');
      } else {
        superadmins.forEach(admin => {
          const email = admin.email_addresses[0].email_address;
          console.log('Superadmin email:', email);
        });
      }
    } catch (e) {
      console.log('Parse error:', e);
    }
  });
});

req.on('error', (e) => {
  console.error(e);
});
req.end();
