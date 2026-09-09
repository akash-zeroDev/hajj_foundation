const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  require('./models/GlobalDocument'); // Simulate express loading it
  const Employee = require('./models/Employee');
  
  // Find TestEmployee
  const employee = await Employee.findOne({ firstName: "TestEmployee" });
  
  // Simulate completeOnboarding
  const populatedEmployee = await Employee.findById(employee._id).populate('signedDocumentId');
  
  console.log("POPULATED:", typeof populatedEmployee.signedDocumentId, populatedEmployee.signedDocumentId ? populatedEmployee.signedDocumentId.fileUrl : 'no file');
  mongoose.disconnect();
}
check();
