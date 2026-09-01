const Organisation = require('../models/Organisation');
const Employee = require('../models/Employee');
const Transaction = require('../models/Transaction');
const AwardDraw = require('../models/AwardDraw');

exports.getSuperAdminOverview = async (req, res) => {
  try {
    // 1. Core Metrics
    const totalOrganisations = await Organisation.countDocuments();
    const totalEmployees = await Employee.countDocuments();
    
    // Aggregate Total Savings Pool (only successful monthly contributions)
    const savingsResult = await Transaction.aggregate([
      { $match: { type: 'monthly_contribution', status: { $in: ['succeeded', 'completed'] } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalSavingsPool = savingsResult.length > 0 ? savingsResult[0].total : 0;

    // Aggregate Platform Revenue (only successful annual fees)
    const revenueResult = await Transaction.aggregate([
      { $match: { type: 'annual_fee', status: { $in: ['succeeded', 'completed'] } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const platformRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    // 2. Chart Data: Savings Growth over the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    
    const monthlySavings = await Transaction.aggregate([
      { 
        $match: { 
          type: 'monthly_contribution', 
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

    // 3. Alerts
    const pendingDraws = await AwardDraw.countDocuments({ status: 'pending_approval' });
    const unpaidOrgs = await Organisation.countDocuments({ feeStatus: { $ne: 'paid' } });
    
    
    const startOfMonth = new Date();
    startOfMonth.setDate(1); startOfMonth.setHours(0,0,0,0);
    const thisMonthOrgs = await Organisation.countDocuments({ createdAt: { $gte: startOfMonth } });

    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const thisWeekEmployees = await Employee.countDocuments({ createdAt: { $gte: startOfWeek } });

    const recentOrgs = await Organisation.aggregate([
      { $sort: { createdAt: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'employees',
          localField: 'clerkOrganizationId',
          foreignField: 'organizationId',
          as: 'employees'
        }
      },
      {
        $project: {
          name: 1,
          createdAt: 1,
          feeStatus: 1,
          employeeCount: { $size: '$employees' }
        }
      }
    ]);


    res.json({
      success: true,
      data: {
        totalOrganisations,
        totalEmployees,
        totalSavingsPool,
        platformRevenue,
        savingsGrowth,
        orgGrowth,
        alerts: {
          pendingDraws,
          unpaidOrgs
        },
        trends: {
          thisMonthOrgs,
          thisWeekEmployees
        },
        recentOrgs
      }
    });

  } catch (error) {
    console.error('Dashboard Overview Error:', error);
    res.status(500).json({ success: false, message: 'Server error generating overview' });
  }
};
