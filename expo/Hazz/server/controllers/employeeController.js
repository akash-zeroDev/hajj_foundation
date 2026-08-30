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

    let employee = await Employee.findOne({ clerkUserId: clerkId }).populate('organisationId');

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
      
      
      employee = await Employee.findById(employee._id).populate('organisationId');
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
    const { monthlyContribution, firstName, lastName, phone } = req.body;

    if (!monthlyContribution || monthlyContribution < 10) {
      return res.status(400).json({ success: false, message: 'Minimum contribution is £10' });
    }

    if (!firstName || !lastName) {
      return res.status(400).json({ success: false, message: 'First Name and Last Name are required' });
    }

    
    const employee = await Employee.findByIdAndUpdate(
      id,
      { 
        agreementStatus: 'signed',
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
