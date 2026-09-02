require('dotenv').config();
const mongoose = require('mongoose');
const Employee = require('./models/Employee');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const all = await Employee.find({});
  console.log('All employees:', all.map(e => ({ name: e.firstName, email: e.email, isRemoved: e.isRemoved })));
  process.exit(0);
});
