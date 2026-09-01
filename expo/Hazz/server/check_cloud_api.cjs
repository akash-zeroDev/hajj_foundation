require('dotenv').config();
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function run() {
  try {
    const result = await cloudinary.search
      .expression('folder:hajj_agreements')
      .sort_by('created_at','desc')
      .max_results(1)
      .execute();
      
    if (result.resources.length === 0) {
      console.log("No files found in the 'hajj_agreements' folder on Cloudinary.");
      return;
    }
    
    const latestFile = result.resources[0];
    console.log("Latest Upload found on Cloudinary:");
    console.log("Public ID:", latestFile.public_id);
    console.log("Format:", latestFile.format);
    console.log("Resource Type:", latestFile.resource_type);
    console.log("Secure URL:", latestFile.secure_url);
    console.log("Created At:", latestFile.created_at);
    
    // Check headers
    const res = await fetch(latestFile.secure_url, { method: 'HEAD' });
    console.log("\n--- File Delivery Headers ---");
    console.log("Status:", res.status);
    console.log("Content-Type:", res.headers.get('content-type'));
    
  } catch(e) {
    console.error(e);
  }
}
run();
