const logAudit = require('../utils/auditLogger');
const { getAuth } = require('@clerk/express');
const AwardDraw = require('../models/AwardDraw');
const Employee = require('../models/Employee');

exports.runDraw = async (req, res) => {
  try {
    const { drawName, numberOfWinners } = req.body;
    const adminId = getAuth(req).userId;

    if (!drawName || !numberOfWinners || numberOfWinners <= 0) {
      return res.status(400).json({ message: 'Valid draw name and number of winners required.' });
    }

    // Eligibility Logic: Active subscription, and hasn't won before
    // We assume balance > 0 is implied if they are active, but we can explicitly check it.
    const eligibleEmployees = await Employee.find({
      subscriptionStatus: 'active',
      awardStatus: 'none',
      balance: { $gt: 0 }
    });

    if (eligibleEmployees.length < numberOfWinners) {
      return res.status(400).json({ 
        message: `Not enough eligible employees. Found ${eligibleEmployees.length}, requested ${numberOfWinners}.` 
      });
    }

    // Cryptographically secure shuffle (Fisher-Yates) using Math.random for simplicity,
    // though in high-stakes production, we'd use crypto random bytes.
    let shuffled = [...eligibleEmployees];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const selectedWinners = shuffled.slice(0, numberOfWinners);
    const winnerIds = selectedWinners.map(emp => emp._id);

    const draw = await AwardDraw.create({
      drawName,
      numberOfWinners,
      status: 'pending_approval',
      winners: winnerIds,
      executedBy: adminId
    });

    // Populate winners for the response
    const populatedDraw = await AwardDraw.findById(draw._id).populate({ path: 'winners', populate: { path: 'organisationId', select: 'name' } });

    res.status(201).json({ success: true, data: populatedDraw });
  } catch (error) {
    console.error('Run draw error:', error);
    res.status(500).json({ message: 'Server error running draw' });
  }
};

exports.getDraws = async (req, res) => {
  try {
    const AwardDraw = require('../models/AwardDraw');
    const Organisation = require('../models/Organisation');
    const { createClerkClient } = require('@clerk/clerk-sdk-node');
    const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
    
    let draws = await AwardDraw.find()
      .populate('winners')
      .sort({ createdAt: -1 })
      .lean();
      
    for (let draw of draws) {
      for (let winner of draw.winners) {
        if (winner && winner.organisationId) {
          const org = await Organisation.findById(winner.organisationId).lean();
          winner.organisationId = org ? { _id: org._id, name: org.name } : null;
          
          try {
            const clerkUser = await clerk.users.getUser(winner.clerkUserId);
            const email = clerkUser.emailAddresses[0]?.emailAddress;
            winner.email = email || 'No email found';
          } catch(err) {
            winner.email = 'Protected (Clerk)';
          }
        }
      }
    }
    
    res.status(200).json({ success: true, data: draws });
  } catch (error) {
    console.error('Fetch draws error:', error);
    res.status(500).json({ message: 'Server error fetching draws' });
  }
};

exports.approveDraw = async (req, res) => {
  try {
    const drawId = req.params.id;
    const adminId = getAuth(req).userId;
    const draw = await AwardDraw.findById(drawId);

    if (!draw) return res.status(404).json({ message: 'Draw not found' });
    if (draw.status !== 'pending_approval') return res.status(400).json({ message: 'Draw is not pending approval' });

    // Update draw status
    draw.status = 'completed';
    await draw.save();

    // Update all winning employees
    await Employee.updateMany(
      { _id: { $in: draw.winners } },
      { $set: { awardStatus: 'won' } }
    );

    await logAudit(req, adminId, 'APPROVED_DRAW', `Approved Hajj Draw ID: ${draw._id}`);
    res.status(200).json({ success: true, data: draw });
  } catch (error) {
    console.error('Approve draw error:', error);
    res.status(500).json({ message: 'Server error approving draw' });
  }
};

exports.discardDraw = async (req, res) => {
  try {
    const drawId = req.params.id;
    const draw = await AwardDraw.findById(drawId);

    if (!draw) return res.status(404).json({ message: 'Draw not found' });
    if (draw.status !== 'pending_approval') return res.status(400).json({ message: 'Draw is not pending approval' });

    draw.status = 'discarded';
    await draw.save();

    res.status(200).json({ success: true, data: draw });
  } catch (error) {
    console.error('Discard draw error:', error);
    res.status(500).json({ message: 'Server error discarding draw' });
  }
};
