const mongoose = require('mongoose');
const Employee = require('./models/Employee');
const Transaction = require('./models/Transaction');
const Organisation = require('./models/Organisation');
require('dotenv').config({path: './.env'});

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const empCount = await Employee.countDocuments();
    console.log("Total Employees:", empCount);
    
    const txCount = await Transaction.countDocuments();
    console.log("Total Transactions:", txCount);
    
    const orgCount = await Organisation.countDocuments();
    console.log("Total Organisations:", orgCount);
    
    const orgs = await Organisation.find().select('name annualFeeStatus').limit(5);
    console.log("Orgs:", orgs);

    mongoose.disconnect();
});
