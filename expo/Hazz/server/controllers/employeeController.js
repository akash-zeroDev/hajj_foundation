const { createClerkClient } = require('@clerk/clerk-sdk-node');
const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
const { getAuth } = require('@clerk/express');
const Employee = require('../models/Employee');
const NotificationService = require('../services/NotificationService');

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

    // Send notification to Org Admin
    await NotificationService.notifyOrgAdmins({
      orgId: employee.organisationId,
      senderId: employee.clerkUserId,
      senderName: `${firstName} ${lastName}`,
      type: 'EMPLOYEE_ONBOARDING_COMPLETED',
      title: 'Employee Onboarding Complete',
      message: `${firstName} ${lastName} has signed the master agreement and completed onboarding.`,
      actionUrl: `/admin/employees`
    });

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

    // Send notification to Org Admin
    await NotificationService.notifyOrgAdmins({
      orgId: employee.organisationId,
      senderId: clerkId,
      senderName: `${firstName} ${lastName}`,
      type: 'EMPLOYEE_PROFILE_UPDATED',
      title: 'Employee Profile Updated',
      message: `${firstName} ${lastName} has updated their profile details.`,
      actionUrl: `/admin/employees`
    });

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

const Transaction = require('../models/Transaction');

exports.updateBankSettings = async (req, res) => {
  try {
    const { id } = req.params;
    const { autoPayEnabled, bankDetails } = req.body;
    
    const employee = await Employee.findById(id);
    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });
    
    employee.autoPayEnabled = autoPayEnabled;
    if (bankDetails) {
      employee.bankDetails = bankDetails;
    }
    
    // Simulate activation & debit (Success only)
    if (autoPayEnabled) {
      employee.subscriptionStatus = 'active';
      
      // Create a successful transaction
      await Transaction.create({
        amount: employee.monthlyContribution,
        currency: 'GBP',
        type: 'employee_contribution',
        status: 'succeeded',
        payerId: employee._id,
        payerModel: 'Employee',
        orgId: employee.organisationId,
        stripeSessionId: 'simulated_success_' + Date.now()
      });
      employee.balance = (employee.balance || 0) + employee.monthlyContribution;
    } else {
      employee.subscriptionStatus = 'pending';
    }

    await employee.save();
    res.status(200).json({ success: true, data: employee });
  } catch (error) {
    console.error('Error updating bank settings:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.inviteEmployee = async (req, res) => {
  try {
    const { emailAddress, role } = req.body;
    const auth = getAuth(req);
    const orgId = auth.orgId; // The Clerk Organization ID

    if (!orgId) {
      return res.status(400).json({ success: false, message: 'Must be in an organization to invite members' });
    }

    if (auth.orgRole !== 'org:admin') {
      return res.status(403).json({ success: false, message: 'Must be an admin to invite members' });
    }

    // Use the backend SDK to invite, which supports redirectUrl!
    const invitation = await clerk.organizations.createOrganizationInvitation({
      organizationId: orgId,
      emailAddress,
      role: role || 'org:member',
      redirectUrl: 'http://localhost:5173/dashboard'
    });

    res.status(200).json({ success: true, data: invitation });
  } catch (error) {
    console.error('Error inviting employee:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to send invite' });
  }
};

exports.remindPendingAgreements = async (req, res) => {
  try {
    const auth = getAuth(req);
    const orgId = auth.orgId;
    if (!orgId) return res.status(400).json({ success: false });
    if (auth.orgRole !== 'org:admin') return res.status(403).json({ success: false });

    const org = await Organisation.findOne({ clerkOrganizationId: orgId });
    if (!org) return res.status(404).json({ success: false });

    const pendingEmployees = await Employee.find({ 
      organisationId: org._id, 
      agreementStatus: 'pending',
      isRemoved: false 
    });

    if (pendingEmployees.length === 0) {
      return res.status(400).json({ success: false, message: 'No pending employees' });
    }

    const promises = pendingEmployees.map(emp => 
      NotificationService.notifyUser({
        userId: emp.clerkUserId,
        senderId: org.clerkOrganizationId,
        senderName: org.name,
        type: 'AGREEMENT_REMINDER',
        title: 'Action Required: Master Agreement',
        message: 'Please review and sign the Shariah master agreement to complete your onboarding.',
        actionUrl: '/dashboard'
      })
    );

    await Promise.all(promises);
    res.status(200).json({ success: true, count: pendingEmployees.length });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};
