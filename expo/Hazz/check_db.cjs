const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/rbac_db');
    
    // Check Award Draws
    const AwardDraw = require('./server/models/AwardDraw');
    require('./server/models/Organisation');
    require('./server/models/Employee');
    
    const draws = await AwardDraw.find().populate({ path: 'winners', populate: { path: 'organisationId', select: 'name' } });
    console.log(JSON.stringify(draws, null, 2));
    
  } catch(e) { console.error(e) } finally { process.exit() }
}
run();
