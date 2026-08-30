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
        resource_type: 'raw', 
        public_id: `agreement_${Date.now()}.pdf`
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
    
    let agreementUrl = '';
    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.buffer);
      agreementUrl = uploadResult.secure_url;
    }

    const clerkOrg = await clerk.organizations.createOrganization({
      name: orgName,
      createdBy: req.auth?.userId || null 
    });

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
    res.status(500).json({ message: error.message || 'Internal server error during onboarding' });
  }
};

exports.getOrganisations = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const { search, agreementStatus, feeStatus, sort } = req.query;
    
    const query = { isArchived: { $ne: true } };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { companyNumber: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (agreementStatus && agreementStatus !== 'all') {
      query.agreementStatus = agreementStatus;
    }
    
    if (feeStatus && feeStatus !== 'all') {
      query.annualFeeStatus = feeStatus;
    }

    let sortObj = { createdAt: -1 }; 
    if (sort === 'oldest') sortObj = { createdAt: 1 };
    if (sort === 'name-asc') sortObj = { name: 1 };
    if (sort === 'name-desc') sortObj = { name: -1 };
    if (sort === 'fee-high') sortObj = { annualFee: -1 };
    if (sort === 'fee-low') sortObj = { annualFee: 1 };

    const total = await Organisation.countDocuments(query);
    const orgs = await Organisation.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      organisations: orgs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalOrganisations: total
    });
  } catch (error) {
    console.error('Error fetching organisations:', error);
    res.status(500).json({ message: 'Internal server error fetching organisations' });
  }
};

exports.getOrganisationById = async (req, res) => {
  try {
    const org = await Organisation.findById(req.params.id);
    if (!org) {
      return res.status(404).json({ message: 'Organisation not found' });
    }
    res.status(200).json(org);
  } catch (error) {
    console.error('Error fetching organisation by id:', error);
    res.status(500).json({ message: 'Internal server error fetching organisation' });
  }
};

exports.getOrganisationEmployees = async (req, res) => {
  try {
    const org = await Organisation.findById(req.params.id);
    if (!org) {
      return res.status(404).json({ message: 'Organisation not found' });
    }

    // Fetch the membership list directly from Clerk for this specific organisation
    const memberships = await clerk.organizations.getOrganizationMembershipList({
      organizationId: org.clerkOrganizationId,
    });

    // In Clerk SDK v4, memberships is an array directly
    res.status(200).json(Array.isArray(memberships) ? memberships : memberships.data);
  } catch (error) {
    console.error('Error fetching organisation employees:', error);
    res.status(500).json({ message: 'Internal server error fetching employees' });
  }
};

exports.updateOrganisation = async (req, res) => {
  try {
    const { name, companyNumber, registeredAddress, annualFee } = req.body;
    
    const org = await Organisation.findById(req.params.id);
    if (!org) return res.status(404).json({ message: 'Organisation not found' });

    org.name = name || org.name;
    org.companyNumber = companyNumber || org.companyNumber;
    org.registeredAddress = registeredAddress || org.registeredAddress;
    org.annualFee = annualFee ? Number(annualFee) : org.annualFee;

    await org.save();
    
    // Optional: Sync name with Clerk
    if (name) {
      await clerk.organizations.updateOrganization({
        organizationId: org.clerkOrganizationId,
        name: name
      });
    }

    res.status(200).json(org);
  } catch (error) {
    console.error('Error updating organisation:', error);
    res.status(500).json({ message: 'Internal server error updating organisation' });
  }
};

exports.toggleSuspension = async (req, res) => {
  try {
    const org = await Organisation.findById(req.params.id);
    if (!org) return res.status(404).json({ message: 'Organisation not found' });

    org.isSuspended = !org.isSuspended;
    await org.save();

    res.status(200).json(org);
  } catch (error) {
    console.error('Error toggling suspension:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.archiveOrganisation = async (req, res) => {
  try {
    const org = await Organisation.findById(req.params.id);
    if (!org) {
      return res.status(404).json({ message: 'Organisation not found' });
    }

    org.isArchived = true;
    org.isSuspended = true; // Archiving essentially blocks them too
    await org.save();

    res.status(200).json({ message: 'Organisation archived successfully' });
  } catch (error) {
    console.error('Error archiving organisation:', error);
    res.status(500).json({ message: 'Internal server error archiving organisation' });
  }
};

exports.getOrganisationByClerkId = async (req, res) => {
  try {
    const org = await Organisation.findOne({ clerkOrganizationId: req.params.clerkId });
    if (!org) {
      return res.status(404).json({ message: 'Organisation not found' });
    }
    res.status(200).json(org);
  } catch (error) {
    console.error('Error fetching org by clerk id:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.acceptAgreement = async (req, res) => {
  try {
    const org = await Organisation.findOneAndUpdate(
      { clerkOrganizationId: req.params.clerkId },
      { agreementStatus: 'signed' },
      { new: true }
    );
    if (!org) return res.status(404).json({ message: 'Organisation not found' });
    
    res.status(200).json(org);
  } catch (error) {
    console.error('Error accepting agreement:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
