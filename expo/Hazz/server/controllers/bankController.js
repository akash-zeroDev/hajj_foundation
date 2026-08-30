const BankAccount = require('../models/BankAccount');
const logAudit = require('../utils/auditLogger');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.getBankAccounts = async (req, res) => {
  try {
    const banks = await BankAccount.find();
    res.status(200).json({ success: true, data: banks });
  } catch (error) {
    console.error('Fetch banks error:', error);
    res.status(500).json({ message: 'Server error fetching bank accounts' });
  }
};

exports.updateBankAccount = async (req, res) => {
  try {
    const { accountType, accountHolderName, sortCode, accountNumber } = req.body;

    if (!accountType || !accountHolderName || !sortCode || !accountNumber) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // In a production environment with Stripe Connect, you would call:
    // const externalAccount = await stripe.accounts.createExternalAccount(
    //   connected_account_id, { external_account: { object: 'bank_account', country: 'GB', currency: 'gbp', account_holder_name: accountHolderName, routing_number: sortCode, account_number: accountNumber } }
    // );
    
    // For this implementation, we will securely extract the last 4 digits
    // and generate a mock Stripe ID to simulate the successful API transaction.
    const last4 = accountNumber.slice(-4);
    const mockStripeId = 'ba_' + Math.random().toString(36).substr(2, 9);
    
    // Determine a mock bank name based on sort code (very simplified)
    const bankName = sortCode.startsWith('40') ? 'HSBC' : 
                     sortCode.startsWith('20') ? 'Barclays' : 
                     'UK Bank PLC';

    // Upsert the bank account in our database
    const updatedBank = await BankAccount.findOneAndUpdate(
      { accountType },
      {
        accountType,
        accountHolderName,
        bankName,
        last4,
        stripeBankAccountId: mockStripeId,
        isActive: true
      },
      { new: true, upsert: true }
    );

    res.status(200).json({ success: true, data: updatedBank });
  } catch (error) {
    console.error('Update bank error:', error);
    res.status(500).json({ message: 'Server error updating bank account' });
  }
};
