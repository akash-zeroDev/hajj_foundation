const { createClerkClient } = require('@clerk/clerk-sdk-node');
const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
const Employee = require('../models/Employee');
const Organisation = require('../models/Organisation');


exports.getEmployeeProfile = async (req, res) => {
  try {
    const { clerkId } = req.params;
    const { clerkOrgId } = req.query; 

    if (!clerkId || !clerkOrgId) {
      return res.status(400).json({ success: false, message: 'Missing Clerk IDs' });
    }

    let employee = await Employee.findOne({ clerkUserId: clerkId }).populate('organisationId').populate('signedDocumentId');

    if (!employee) {

      const org = await Organisation.findOne({ clerkOrganizationId: clerkOrgId });
      if (!org) {
        return res.status(404).json({ success: false, message: 'Organisation not found in database' });
      }


      employee = new Employee({
        clerkUserId: clerkId,
        organisationId: org._id,
        agreementStatus: 'pending',
        balance: 0
      });
      await employee.save();
      
      
      employee = await Employee.findById(employee._id).populate('organisationId').populate('signedDocumentId');
    }

    res.status(200).json({ success: true, data: employee });
  } catch (error) {
    console.error('Error fetching employee profile:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


exports.completeOnboarding = async (req, res) => {
  try {
    const { id } = req.params; 
    const { monthlyContribution, firstName, lastName, phone, signedDocumentId } = req.body;

    if (!monthlyContribution || monthlyContribution < 10) {
      return res.status(400).json({ success: false, message: 'Minimum contribution is £10' });
    }

    if (!firstName || !lastName || !phone) {
      return res.status(400).json({ success: false, message: 'First Name, Last Name, and Phone are fully required' });
    }

    
    const employee = await Employee.findByIdAndUpdate(
      id,
      { 
        agreementStatus: 'signed',
        signedDocumentId: signedDocumentId || undefined,
        monthlyContribution: Number(monthlyContribution),
        firstName,
        lastName,
        phone
      },
      { new: true }
    );

    if (employee) {

      try {
        await clerk.users.updateUser(employee.clerkUserId, {
          firstName,
          lastName
        });
      } catch (clerkErr) {
        console.error('Failed to sync name to Clerk:', clerkErr);
      }
    }


    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    res.status(200).json({ success: true, data: employee });
  } catch (error) {
    console.error('Error completing onboarding:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
  

exports.updateEmployeeProfile = async (req, res) => {
  try {
    const { clerkId } = req.params;
    const { firstName, lastName, phone } = req.body;

    const employee = await Employee.findOneAndUpdate(
      { clerkUserId: clerkId },
      { firstName, lastName, phone },
      { new: true }
    );

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    // Sync with Clerk
    try {
      await clerk.users.updateUser(clerkId, {
        firstName,
        lastName
      });
    } catch (clerkErr) {
      console.error('Failed to sync name to Clerk during update:', clerkErr);
    }

    res.status(200).json({ success: true, data: employee });
  } catch (error) {
    console.error('Error updating employee profile:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getEmployeeForAdmin = async (req, res) => {
  try {
    const { clerkId } = req.params;
    
    // Find the employee in the database
    const employee = await Employee.findOne({ clerkUserId: clerkId })
      .populate('organisationId')
      .populate('signedDocumentId');

    if (!employee) {
      // If the employee hasn't logged in yet, they might not exist in Mongo.
      // We return a skeleton representation.
      return res.status(200).json({ 
        success: true, 
        data: {
          clerkUserId: clerkId,
          agreementStatus: 'pending',
          balance: 0,
          monthlyContribution: 0,
          awardStatus: 'none',
          subscriptionStatus: 'inactive'
        } 
      });
    }

    res.status(200).json({ success: true, data: employee });
  } catch (error) {
    console.error('Error fetching employee for admin:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
