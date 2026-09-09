const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  const GlobalDocument = require('./models/GlobalDocument');
  const Organisation = require('./models/Organisation');
  const Employee = require('./models/Employee');
  
  try {
     let employee = await Employee.findOne({ clerkUserId: "user_3IuALciLe0hzsEvsMbDOcTrTXBi" }).populate('organisationId').populate('signedDocumentId');
     console.log(JSON.stringify(employee, null, 2));
  } catch (e) {
     console.error("ERROR:", e);
  }
  mongoose.disconnect();
}
check();
