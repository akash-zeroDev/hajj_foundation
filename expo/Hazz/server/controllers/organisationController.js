const Employee = require('../models/Employee');
const cloudinary = require('cloudinary').v2;
const { createClerkClient } = require('@clerk/clerk-sdk-node');
const Organisation = require('../models/Organisation');
const NotificationService = require('../services/NotificationService');

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
        resource_type: 'image', 
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
      redirectUrl: 'http://localhost:5173/dashboard',
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
      agreementUrl,
      adminEmail,
      adminFirstName,
      adminLastName,
      adminPhone
    });

    await newOrg.save();

    res.status(201).json({
      success: true,
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
    
    const { search, agreementStatus, feeStatus, sort, isSuspended } = req.query;
    
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

    if (isSuspended === 'true') {
      query.isSuspended = true;
    } else if (isSuspended === 'false') {
      query.isSuspended = false;
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

    res.status(200).json(Array.isArray(memberships) ? memberships : (memberships?.data || []));
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

    try {
        await clerk.organizations.updateOrganization({
            organizationId: org.clerkOrganizationId,
            publicMetadata: { isSuspended: org.isSuspended }
        });
    } catch (clerkErr) {
        console.error('Failed to sync suspension to Clerk:', clerkErr);
    }

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

    // Sync with clerk to remove orphaned employees
    try {
      const memberships = await clerk.organizations.getOrganizationMembershipList({ organizationId: req.params.clerkId });
      const membersArray = Array.isArray(memberships) ? memberships : (memberships?.data || []);
      if (membersArray.length >= 0) {
        const activeClerkUserIds = membersArray.map(m => m.publicUserData?.userId).filter(Boolean);
        await Employee.updateMany({ organisationId: org._id, clerkUserId: { $nin: activeClerkUserIds } }, { $set: { isRemoved: true } });
        await Employee.updateMany({ organisationId: org._id, clerkUserId: { $in: activeClerkUserIds } }, { $set: { isRemoved: false } });
      }
    } catch (e) {
      console.error('Failed to sync members from clerk', e.message);
    }

    // Aggregation logic for stats
    const totalEmployees = await Employee.countDocuments({ organisationId: org._id, isRemoved: { $ne: true } });
    
    const savingsAgg = await Employee.aggregate([
      { $match: { organisationId: org._id } },
      { $group: { _id: null, total: { $sum: '$balance' } } }
    ]);
    const totalCombinedSavings = savingsAgg.length > 0 ? savingsAgg[0].total : 0;
    
    const hajjJourneysWon = await Employee.countDocuments({ organisationId: org._id, awardStatus: { $in: ['won', 'claimed'] }, isRemoved: { $ne: true } });
    
    // Monthly onboarding data (Last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5); // To get a full 6 month window
    
    const activityAgg = await Employee.aggregate([
      { $match: { organisationId: org._id, createdAt: { $gte: sixMonthsAgo } } },
      { $group: {
          _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);
    
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const activityGraphData = activityAgg.map(item => ({
      month: monthNames[item._id.month - 1],
      employees: item.count
    }));

    // Generate fallback data if empty to make graph look nice empty
    if (activityGraphData.length === 0) {
      const currentMonth = new Date().getMonth();
      activityGraphData.push(
        { month: monthNames[(currentMonth - 2 + 12) % 12], employees: 0 },
        { month: monthNames[(currentMonth - 1 + 12) % 12], employees: 0 },
        { month: monthNames[currentMonth], employees: 0 }
      );
    }

    const pendingAgreements = await Employee.countDocuments({ organisationId: org._id, agreementStatus: 'pending', isRemoved: { $ne: true } });
    const recentEmployees = await Employee.find({ organisationId: org._id, isRemoved: { $ne: true } }).sort({ createdAt: -1 }).limit(4);

    const orgObj = org.toObject();
    orgObj.dashboardStats = {
      totalEmployees,
      totalCombinedSavings,
      hajjJourneysWon,
      pendingAgreements,
      recentEmployees,
      activityGraphData
    };

    res.status(200).json(orgObj);
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

exports.getEmployeeAgreements = async (req, res) => {
  try {
    const clerkOrgId = req.params.clerkOrgId;
    const org = await Organisation.findOne({ clerkOrganizationId: clerkOrgId });
    if (!org) {
      return res.status(404).json({ message: 'Organisation not found in database.' });
    }

    // Sync with clerk to remove orphaned employees
    try {
      const memberships = await clerk.organizations.getOrganizationMembershipList({ organizationId: clerkOrgId });
      const membersArray = Array.isArray(memberships) ? memberships : (memberships?.data || []);
      if (membersArray.length >= 0) {
        const activeClerkUserIds = membersArray.map(m => m.publicUserData?.userId).filter(Boolean);
        await Employee.updateMany({ organisationId: org._id, clerkUserId: { $nin: activeClerkUserIds } }, { $set: { isRemoved: true } });
        await Employee.updateMany({ organisationId: org._id, clerkUserId: { $in: activeClerkUserIds } }, { $set: { isRemoved: false } });
      }
    } catch (e) {
      console.error('Failed to sync members from clerk', e.message);
    }

    const employees = await Employee.find({ organisationId: org._id })
      .select('firstName lastName agreementStatus updatedAt clerkUserId email isRemoved balance monthlyContribution')
      .sort({ updatedAt: -1 });

    res.status(200).json({ success: true, data: employees });
  } catch (error) {
    console.error('Error fetching employee agreements:', error);
    res.status(500).json({ message: 'Server error fetching agreements' });
  }
};


exports.updateOrganisationDetails = async (req, res) => {
  try {
    const { clerkOrgId } = req.params;
    const { name, registeredAddress } = req.body;
    
    // We only allow name and registeredAddress to be updated
    const org = await Organisation.findOneAndUpdate(
      { clerkOrganizationId: clerkOrgId },
      { name, registeredAddress },
      { new: true }
    );
    
    if (!org) {
      return res.status(404).json({ success: false, message: 'Organisation not found' });
    }
    
    // Send notification to Super Admins
    await NotificationService.notifySuperAdmin({
      senderId: clerkOrgId,
      senderName: org.name,
      type: 'ORG_DETAILS_UPDATED',
      title: 'Organisation Details Updated',
      message: `${org.name} has updated their profile details.`,
      actionUrl: `/superadmin/organisations/${org._id}`
    });

    res.status(200).json({ success: true, data: org });
  } catch (error) {
    console.error('Error updating organisation details:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getEmployeeAgreements = async (req, res) => {
  try {
    const { clerkId } = req.params;
    
    // Find the org in Mongo
    const org = await Organisation.findOne({ clerkOrganizationId: clerkId });
    if (!org) {
      return res.status(404).json({ success: false, message: 'Organisation not found' });
    }

    // Sync with clerk to remove orphaned employees
    try {
      const memberships = await clerk.organizations.getOrganizationMembershipList({ organizationId: clerkId });
      const membersArray = Array.isArray(memberships) ? memberships : (memberships?.data || []);
      if (membersArray.length >= 0) {
        const activeClerkUserIds = membersArray.map(m => m.publicUserData?.userId).filter(Boolean);
        const Employee = require('../models/Employee');
        await Employee.updateMany({ organisationId: org._id, clerkUserId: { $nin: activeClerkUserIds } }, { $set: { isRemoved: true } });
        await Employee.updateMany({ organisationId: org._id, clerkUserId: { $in: activeClerkUserIds } }, { $set: { isRemoved: false } });
      }
    } catch (e) {
      console.error('Failed to sync members from clerk', e.message);
    }

    // Find all employees that belong to this org
    const Employee = require('../models/Employee');
    const employees = await Employee.find({ organisationId: org._id }).populate('signedDocumentId').sort({ createdAt: -1 });
    
    res.status(200).json({ success: true, data: employees });
  } catch (error) {
    console.error('Error fetching employee agreements:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
