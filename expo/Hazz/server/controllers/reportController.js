const Employee = require('../models/Employee');
const Organisation = require('../models/Organisation');
const Transaction = require('../models/Transaction');

exports.getOperationalStats = async (req, res) => {
  try {
    const totalOrgs = await Organisation.countDocuments();
    const suspendedOrgs = await Organisation.countDocuments({ status: 'suspended' });
    
    const totalEmployees = await Employee.countDocuments();
    const compliantEmployees = await Employee.countDocuments({ agreementStatus: 'signed' });
    const pendingEmployees = totalEmployees - compliantEmployees;
    
    const totalAUM = await Employee.aggregate([
      { $group: { _id: null, total: { $sum: "$balance" } } }
    ]);
    
    const totalRevenue = await Organisation.aggregate([
      { $match: { annualFeeStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: "$annualFee" } } }
    ]);

    const stats = {
      organizations: {
        total: totalOrgs,
        active: totalOrgs - suspendedOrgs,
        suspended: suspendedOrgs
      },
      employees: {
        total: totalEmployees,
        compliant: compliantEmployees,
        pending: pendingEmployees
      },
      financials: {
        aum: totalAUM[0]?.total || 0,
        revenue: totalRevenue[0]?.total || 0
      },
      timestamp: new Date()
    };

    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    console.error('Error generating operational stats:', error);
    res.status(500).json({ message: 'Server error generating stats' });
  }
};

exports.getLedgerExport = async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate('orgId', 'name clerkOrganizationId')
      .populate('employeeId', 'firstName lastName email clerkUserId')
      .sort({ createdAt: -1 });

    const formattedData = transactions.map(tx => ({
      transactionId: tx._id,
      date: tx.createdAt,
      type: tx.type, // 'revenue' or 'savings'
      amount: tx.amount,
      currency: tx.currency,
      status: tx.status,
      stripePaymentIntentId: tx.stripePaymentIntentId,
      entityName: tx.type === 'revenue' 
        ? tx.orgId?.name 
        : `${tx.employeeId?.firstName} ${tx.employeeId?.lastName}`,
      entityType: tx.type === 'revenue' ? 'Employer' : 'Employee'
    }));

    res.status(200).json({ success: true, data: formattedData });
  } catch (error) {
    console.error('Error exporting ledger:', error);
    res.status(500).json({ message: 'Server error generating ledger export' });
  }
};
