const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY); // Note: Need to add this to .env
const Organisation = require('../models/Organisation');

// Creates a Stripe Checkout Session for the Employer Annual Fee
exports.createAnnualFeeCheckout = async (req, res) => {
  try {
    const { orgId } = req.body;
    
    // Find the organisation by Mongo ID
    const org = await Organisation.findById(orgId);
    if (!org) {
      return res.status(404).json({ message: 'Organisation not found' });
    }

    // Double check that they haven't already paid
    if (org.annualFeeStatus === 'paid') {
      return res.status(400).json({ message: 'Annual fee is already paid.' });
    }

    // Use default £12300 if not specified
    const feeAmount = org.annualFee || 12300; 

    // Create the Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'gbp', // British Pounds
            product_data: {
              name: 'Hajj Savings Fund - Annual Platform License',
              description: `Annual subscription fee for ${org.name}`,
            },
            unit_amount: feeAmount * 100, // Stripe requires the amount in the smallest currency unit (pence)
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      // We will redirect them back to their dashboard. The URL query params let the frontend show a success/error toast.
      success_url: `http://localhost:5173/admin?payment=success`,
      cancel_url: `http://localhost:5173/admin?payment=cancelled`,
      metadata: {
        orgId: org._id.toString(), // We store this so the Webhook knows which company paid
        type: 'annual_fee'
      }
    });

    // Return the secure Stripe Hosted Checkout URL to the frontend
    res.status(200).json({ url: session.url });

  } catch (error) {
    console.error('Stripe Checkout Error:', error);
    res.status(500).json({ message: 'Failed to initialize payment gateway' });
  }
};
