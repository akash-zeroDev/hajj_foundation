const mongoose = require('mongoose');
const GlobalDocument = require('./models/GlobalDocument');
require('dotenv').config();

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/rbac_db');
    const doc = await GlobalDocument.findOne({ isActive: true }).sort({ createdAt: -1 });
    
    if (!doc) {
      console.log("No active document found in database.");
      process.exit(0);
    }
    
    console.log("Found Active Document URL:", doc.fileUrl);
    
    // Fetch the headers to verify Cloudinary is serving it correctly
    const response = await fetch(doc.fileUrl, { method: 'HEAD' });
    console.log("\n--- Cloudinary Response Headers ---");
    console.log("Status:", response.status, response.statusText);
    console.log("Content-Type:", response.headers.get('content-type'));
    console.log("Content-Disposition:", response.headers.get('content-disposition') || 'None (Good for inline rendering!)');
    
  } catch (error) {
    console.error("Error:", error);
  } finally {
    process.exit(0);
  }
}
run();
