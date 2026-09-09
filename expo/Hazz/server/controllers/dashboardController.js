const Organisation = require('../models/Organisation');
const Employee = require('../models/Employee');
const Transaction = require('../models/Transaction');
const AwardDraw = require('../models/AwardDraw');

exports.getSuperAdminOverview = async (req, res) => {
  try {
    // 1. Core Metrics
    const totalOrganisations = await Organisation.countDocuments({ isArchived: { $ne: true }, isSuspended: { $ne: true } });
    // Only count employees who have actually signed up (accepted invite & created Clerk account)
    const totalEmployees = await Employee.countDocuments({ isRemoved: { $ne: true }, clerkUserId: { $exists: true, $ne: '' } });
    
    // Aggregate Total Savings Pool (Match AUM from Employee balances)
    const savingsResult = await Employee.aggregate([
      { $match: { isRemoved: { $ne: true } } },
      { $group: { _id: null, total: { $sum: '$balance' } } }
    ]);
    const totalSavingsPool = savingsResult.length > 0 ? savingsResult[0].total : 0;

    // Aggregate Platform Revenue (Match Reports - Sum of Paid Annual Fees)
    const revenueResult = await Organisation.aggregate([
      { $match: { annualFeeStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: "$annualFee" } } }
    ]);
    const platformRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    // 2. Chart Data: Savings Growth over the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    
    const monthlySavings = await Transaction.aggregate([
      { 
        $match: { 
          type: 'employee_contribution', 
          status: { $in: ['succeeded', 'completed'] },
          createdAt: { $gte: sixMonthsAgo } 
        } 
      },
      {
        $group: {
          _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
          total: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Format for frontend (e.g. "Jan", "Feb")
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let savingsGrowth = [];
    
    // Fill in 0s for missing months in the last 6 months to ensure chart looks good
    let currentTotal = 0;
    for (let i = 0; i < 6; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      const m = d.getMonth() + 1;
      const y = d.getFullYear();
      
      const found = monthlySavings.find(s => s._id.month === m && s._id.year === y);
      if (found) {
        currentTotal += found.total; // Cumulative growth
      }
      savingsGrowth.push({
        name: monthNames[m - 1],
        amount: currentTotal
      });
    }

    // Chart Data: Organisation Onboarding over the last 6 months
    const monthlyOrgs = await Organisation.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    let orgGrowth = [];
    for (let i = 0; i < 6; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      const m = d.getMonth() + 1;
      const y = d.getFullYear();
      
      const found = monthlyOrgs.find(o => o._id.month === m && o._id.year === y);
      orgGrowth.push({
        name: monthNames[m - 1],
        onboarded: found ? found.count : 0
      });
    }

    // 3. Alerts + fee breakdown + compliance + subscription health
    const pendingDraws = await AwardDraw.countDocuments({ status: 'pending_approval' });
    const unpaidOrgs = await Organisation.countDocuments({ annualFeeStatus: { $ne: 'paid' } });
    const paidOrgs = await Organisation.countDocuments({ annualFeeStatus: 'paid' });
    const pendingFeeOrgs = await Organisation.countDocuments({ annualFeeStatus: 'pending' });
    const overdueOrgs = await Organisation.countDocuments({ annualFeeStatus: 'overdue' });
    const suspendedOrgs = await Organisation.countDocuments({ isSuspended: true, isArchived: { $ne: true } });

    const orgSigned = await Organisation.countDocuments({ agreementStatus: 'signed' });
    const orgPendingAgreement = await Organisation.countDocuments({ agreementStatus: 'pending' });
    const empActive = await Employee.countDocuments({ isRemoved: { $ne: true }, clerkUserId: { $exists: true, $ne: '' } });
    const empSigned = await Employee.countDocuments({ agreementStatus: 'signed', isRemoved: { $ne: true } });
    const empPending = await Employee.countDocuments({ agreementStatus: 'pending', isRemoved: { $ne: true } });
    const subActive = await Employee.countDocuments({ subscriptionStatus: 'active', isRemoved: { $ne: true } });
    const subPending = await Employee.countDocuments({ subscriptionStatus: 'pending', isRemoved: { $ne: true } });
    const subPastDue = await Employee.countDocuments({ subscriptionStatus: 'past_due', isRemoved: { $ne: true } });
    const subCanceled = await Employee.countDocuments({ subscriptionStatus: 'canceled', isRemoved: { $ne: true } });
    const autoPayOn = await Employee.countDocuments({ autoPayEnabled: true, isRemoved: { $ne: true } });

    // Average balance + outstanding calculation
    const outstandingResult = await Organisation.aggregate([
      { $match: { annualFeeStatus: { $ne: 'paid' } } },
      { $group: { _id: null, total: { $sum: '$annualFee' } } }
    ]);
    const outstandingAmount = outstandingResult.length ? outstandingResult[0].total : 0;
    const overdueResult = await Organisation.aggregate([
      { $match: { annualFeeStatus: 'overdue' } },
      { $group: { _id: null, total: { $sum: '$annualFee' } } }
    ]);
    const overdueAmount = overdueResult.length ? overdueResult[0].total : 0;
    const avgBalanceResult = await Employee.aggregate([
      { $match: { isRemoved: { $ne: true } } },
      { $group: { _id: null, avg: { $avg: '$balance' } } }
    ]);
    const avgBalance = avgBalanceResult.length ? Math.round(avgBalanceResult[0].avg) : 0;

    // Eligible pool for awards: signed agreement + paid fee orgs -> employees with active subscription
    const eligibleOrgIds = await Organisation.find({ agreementStatus: 'signed', annualFeeStatus: 'paid' }).distinct('_id');
    const eligiblePool = await Employee.countDocuments({ organisationId: { $in: eligibleOrgIds }, subscriptionStatus: 'active', isRemoved: { $ne: true } });
    
    const startOfMonth = new Date();
    startOfMonth.setDate(1); startOfMonth.setHours(0,0,0,0);
    const thisMonthOrgs = await Organisation.countDocuments({ createdAt: { $gte: startOfMonth } });

    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const thisWeekEmployees = await Employee.countDocuments({ createdAt: { $gte: startOfWeek } });

    const recentOrgs = await Organisation.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name companyNumber annualFee annualFeeStatus agreementStatus createdAt isSuspended');

    // banks + audits fetched separately via their own endpoints; include counts here for convenience
    const totalOrgsAll = await Organisation.countDocuments();
    const totalRevenueAllOrgs = await Organisation.aggregate([
      { $group: { _id: null, total: { $sum: '$annualFee' } } }
    ]);
    const totalAnnualSum = totalRevenueAllOrgs.length ? totalRevenueAllOrgs[0].total : 0;
    const collectionRate = totalAnnualSum ? Math.round((platformRevenue / totalAnnualSum) * 100) : 0;


    console.log("DASHBOARD DATA:", { totalOrganisations, totalEmployees, totalSavingsPool }); res.json({
      success: true,
      data: {
        totalOrganisations,
        totalEmployees,
        totalSavingsPool,
        platformRevenue,
        savingsGrowth,
        orgGrowth,
        collection: { paid: paidOrgs, pending: pendingFeeOrgs, overdue: overdueOrgs, total: totalOrgsAll, rate: collectionRate, outstandingAmount, overdueAmount },
        compliance: { orgSigned, orgPending: orgPendingAgreement, orgTotal: totalOrgsAll, empSigned, empPending, empTotal: empActive, suspended: suspendedOrgs },
        subscription: { active: subActive, pending: subPending, pastDue: subPastDue, canceled: subCanceled, autoPayOn, total: empActive },
        financial: { avgBalance, outstandingAmount, overdueAmount, totalAnnualSum },
        alerts: {
          pendingDraws,
          unpaidOrgs
        },
        trends: {
          thisMonthOrgs,
          thisWeekEmployees
        },
        eligiblePool,
        recentOrgs
      }
    });

  } catch (error) {
    console.error('Dashboard Overview Error:', error);
    res.status(500).json({ success: false, message: 'Server error generating overview' });
  }
};
