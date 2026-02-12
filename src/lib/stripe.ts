import Stripe from 'stripe';

// Use dummy key if missing to prevent build/runtime crash
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy', {
    typescript: true,
});
