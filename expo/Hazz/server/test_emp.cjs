const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  require('./models/GlobalDocument');
  const Employee = require('./models/Employee');
  
  const emps = await Employee.find({ firstName: "TestEmployee" });
  console.log(JSON.stringify(emps, null, 2));
  mongoose.disconnect();
}
check();
