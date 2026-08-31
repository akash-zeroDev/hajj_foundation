const { getAuth } = require('@clerk/express');
const Transaction = require('../models/Transaction');
const Organisation = require('../models/Organisation');
const Employee = require('../models/Employee');

exports.getGlobalTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate('payerId', 'name companyName firstName lastName email clerkUserId')
      .populate('orgId', 'companyName')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: transactions });
  } catch (error) {
    console.error('Fetch global transactions error:', error);
    res.status(500).json({ message: 'Server error fetching transactions' });
  }
};

exports.getOrgTransactions = async (req, res) => {
  try {

    const clerkOrgId = req.params.orgId; 
    const org = await Organisation.findOne({ clerkOrganizationId: clerkOrgId });
    if (!org) {
      return res.status(404).json({ message: 'Organisation not found' });
    }
    
    const transactions = await Transaction.find({ orgId: org._id })
      .populate('payerId', 'firstName lastName email clerkUserId')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: transactions });
  } catch (error) {
    console.error('Fetch org transactions error:', error);
    res.status(500).json({ message: 'Server error fetching org transactions' });
  }
};

exports.getGlobalStats = async (req, res) => {
  try {
    const [revenueStats, savingsStats] = await Promise.all([
      Transaction.aggregate([
        { $match: { type: 'employer_fee', status: 'succeeded' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Transaction.aggregate([
        { $match: { type: 'employee_contribution', status: 'succeeded' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalRevenue: revenueStats.length > 0 ? revenueStats[0].total : 0,
        totalSavingsPool: savingsStats.length > 0 ? savingsStats[0].total : 0,
        currency: 'GBP'
      }
    });
  } catch (error) {
    console.error('Fetch stats error:', error);
    res.status(500).json({ message: 'Server error fetching financial stats' });
  }
};

exports.getEmployeeTransactions = async (req, res) => {
  try {
    const clerkUserId = getAuth(req).userId; 
    const employee = await Employee.findOne({ clerkUserId });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    const transactions = await Transaction.find({ payerId: employee._id })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: transactions });
  } catch (error) {
    console.error('Fetch employee transactions error:', error);
    res.status(500).json({ message: 'Server error fetching employee transactions' });
  }
};
