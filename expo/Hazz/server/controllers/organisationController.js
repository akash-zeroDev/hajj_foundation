const cloudinary = require('cloudinary').v2;
const { createClerkClient } = require('@clerk/clerk-sdk-node');
const Organisation = require('../models/Organisation');

// Initialize Clerk client
const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'hajj_agreements',
        resource_type: 'raw', // since it's a PDF
        type: 'private' // keep it private
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

exports.onboardOrganisation = async (req, res) => {
  try {
    const { orgName, companyNumber, address, adminFirstName, adminLastName, adminEmail, adminPhone, annualFee } = req.body;
    
    // 1. Upload the PDF to Cloudinary (if provided)
    let agreementUrl = '';
    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.buffer);
      agreementUrl = uploadResult.secure_url;
    }

    // 2. Create the Organization in Clerk
    const clerkOrg = await clerk.organizations.createOrganization({
      name: orgName,
      createdBy: req.auth?.userId || null // the superadmin creating it, if available
    });

    // 3. Create an Organization Invitation for the Admin
    // Clerk will automatically send them an email to join as org:admin
    await clerk.organizations.createOrganizationInvitation({
      organizationId: clerkOrg.id,
      emailAddress: adminEmail,
      role: 'org:admin',
      publicMetadata: {
        firstName: adminFirstName,
        lastName: adminLastName,
        phone: adminPhone
      }
    });

    // 4. Save everything to MongoDB
    const newOrg = new Organisation({
      clerkOrganizationId: clerkOrg.id,
      name: orgName,
      companyNumber,
      registeredAddress: address,
      annualFee: Number(annualFee),
      agreementUrl
    });

    await newOrg.save();

    res.status(201).json({
      message: 'Organisation successfully onboarded and invitation sent!',
      organisation: newOrg
    });

  } catch (error) {
    console.error('Error onboarding organisation:', error);
    // If it fails, ideally we would rollback Clerk/Cloudinary, but for now just return 500
    res.status(500).json({ message: error.message || 'Internal server error during onboarding' });
  }
};
