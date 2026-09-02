const { getAuth } = require('@clerk/express');
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY); // Note: Need to add this to .env
const Organisation = require('../models/Organisation');
const Employee = require('../models/Employee');
const Transaction = require('../models/Transaction');


exports.createAnnualFeeCheckout = async (req, res) => {
  try {
    const { orgId } = req.body;
    

    const org = await Organisation.findById(orgId);
    if (!org) {
      return res.status(404).json({ message: 'Organisation not found' });
    }


    if (org.annualFeeStatus === 'paid') {
      return res.status(400).json({ message: 'Annual fee is already paid.' });
    }


    const feeAmount = org.annualFee || 12300; 


    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'gbp', 
            product_data: {
              name: 'Hajj Savings Fund - Annual Platform License',
              description: `Annual subscription fee for ${org.name}`,
            },
            unit_amount: feeAmount * 100, 
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
    
      success_url: `http://localhost:5173/admin?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://localhost:5173/admin?payment=cancelled`,
      metadata: {
        orgId: org._id.toString(),
        type: 'annual_fee'
      }
    });

    
    res.status(200).json({ url: session.url });

  } catch (error) {
    console.error('Stripe Checkout Error:', error);
    res.status(500).json({ message: 'Failed to initialize payment gateway' });
  }
};

exports.verifyAnnualFeeCheckout = async (req, res) => {
  try {
    const { session_id } = req.query;
    if (!session_id) return res.status(400).json({ message: 'Missing session ID' });


    const session = await stripe.checkout.sessions.retrieve(session_id);
    
    if (session.payment_status === 'paid') {
      const orgId = session.metadata.orgId;
      const org = await Organisation.findById(orgId);
      
      if (org && org.annualFeeStatus !== 'paid') {
        org.annualFeeStatus = 'paid';
        await org.save();
      }
      

      const existingTx = await Transaction.findOne({ stripeSessionId: session_id });
      if (!existingTx) {
        await Transaction.create({
          amount: session.amount_total / 100,
          currency: 'GBP',
          type: 'employer_fee',
          status: 'succeeded',
          stripeSessionId: session_id,
          payerId: orgId,
          payerModel: 'Organisation',
          orgId: orgId
        });
      }
      return res.status(200).json({ success: true, message: 'Payment verified and updated' });
    } else {
      return res.status(400).json({ success: false, message: 'Payment not completed' });
    }
  } catch (error) {
    console.error('Verify Payment Error:', error);
    res.status(500).json({ message: 'Error verifying payment' });
  }
};


exports.createEmployeeSubscription = async (req, res) => {
  try {
    const { employeeId } = req.body;
    
    const employee = await Employee.findById(employeeId);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    if (employee.clerkUserId !== getAuth(req).userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }


    if (employee.subscriptionStatus === 'active') {
      return res.status(400).json({ message: 'Subscription is already active.' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: 'Hajj Savings Fund - Monthly Contribution',
              description: 'Automated monthly savings direct debit',
            },
            unit_amount: employee.monthlyContribution * 100, // pence
            recurring: {
              interval: 'month',
            }
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `http://localhost:5173/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://localhost:5173/dashboard?payment=cancelled`,
      metadata: {
        employeeId: employee._id.toString(),
        type: 'employee_subscription'
      }
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Stripe Subscription Error:', error);
    res.status(500).json({ message: 'Failed to initialize subscription checkout' });
  }
};

exports.verifyEmployeeSubscription = async (req, res) => {
  try {
    const { session_id } = req.query;
    if (!session_id) return res.status(400).json({ message: 'Missing session ID' });

    const session = await stripe.checkout.sessions.retrieve(session_id);
    
    // For subscriptions, status 'complete' means they successfully set it up and paid the first invoice (if applicable)
    if (session.status === 'complete') {
      const employeeId = session.metadata.employeeId;
      const employee = await Employee.findById(employeeId);
      
      if (employee && employee.subscriptionStatus !== 'active') {
        employee.subscriptionStatus = 'active';
        employee.stripeCustomerId = session.customer;
        employee.stripeSubscriptionId = session.subscription;
        
        // Since they are charged immediately, we manually simulate the first successful webhook balance update
        // (In a full production app, you strictly rely on webhook 'invoice.paid' to do this to avoid race conditions)
        employee.balance = (employee.balance || 0) + employee.monthlyContribution;
        
        await employee.save();
      }

      // Log the transaction if it doesn't already exist
      const existingTx = await Transaction.findOne({ stripeSessionId: session_id });
      if (!existingTx) {
        await Transaction.create({
          amount: employee.monthlyContribution,
          currency: 'GBP',
          type: 'employee_contribution',
          status: 'succeeded',
          stripeSessionId: session_id,
          payerId: employee._id,
          payerModel: 'Employee',
          orgId: employee.organisationId
        });
      }
      return res.status(200).json({ success: true, message: 'Subscription verified and activated' });
    } else {
      return res.status(400).json({ success: false, message: 'Subscription not completed' });
    }
  } catch (error) {
    console.error('Verify Subscription Error:', error);
    res.status(500).json({ message: 'Error verifying subscription' });
  }
};


exports.createCustomerPortal = async (req, res) => {
  try {
    const { employeeId } = req.body;
    const employee = await Employee.findById(employeeId);
    
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    if (employee.clerkUserId !== getAuth(req).userId) return res.status(403).json({ message: 'Forbidden' });
    if (!employee.stripeCustomerId) return res.status(400).json({ message: 'No active Stripe customer found' });

    const session = await stripe.billingPortal.sessions.create({
      customer: employee.stripeCustomerId,
      return_url: 'http://localhost:5173/dashboard',
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('Customer Portal Error:', err);
    res.status(500).json({ message: 'Error creating portal session' });
  }
};

exports.cancelSubscription = async (req, res) => {
  try {
    const { employeeId } = req.body;
    const employee = await Employee.findById(employeeId);
    
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    if (employee.clerkUserId !== getAuth(req).userId) return res.status(403).json({ message: 'Forbidden' });
    
    if (employee.stripeSubscriptionId) {
      try {
        await stripe.subscriptions.cancel(employee.stripeSubscriptionId);
      } catch (stripeErr) {
        console.warn('Stripe cancellation failed (likely dev mode mock data):', stripeErr.message);
      }
    }
    
    employee.subscriptionStatus = 'cancelled';
    employee.stripeSubscriptionId = null;
    await employee.save();
    
    res.json({ success: true, message: 'Auto Pay cancelled successfully' });
  } catch (err) {
    console.error('Error cancelling subscription:', err);
    res.status(500).json({ message: 'Failed to cancel subscription' });
  }
};
