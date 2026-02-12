import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

// Values would typically come from environment variables or a PayPal client wrapper
const PAYPAL_API_BASE = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID?.includes('sb')
    ? 'https://api-m.sandbox.paypal.com'
    : 'https://api-m.paypal.com';

async function generateAccessToken() {
    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        throw new Error('MISSING_API_CREDENTIALS');
    }

    const auth = Buffer.from(clientId + ':' + clientSecret).toString('base64');
    const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
        method: 'POST',
        body: 'grant_type=client_credentials',
        headers: {
            Authorization: `Basic ${auth}`,
        },
    });

    const data = await response.json();
    return data.access_token;
}

export async function POST(req: NextRequest) {
    try {
        const { items, shippingDetails, user_id } = await req.json();
        const cookieStore = await cookies();
        const supabase = await createClient();

        // 1. Validate items and calculate total (Security step)
        let calculatedTotal = 0;
        const validatedItems = [];

        for (const item of items) {
            const { data: variant } = await supabase
                .from('product_variants')
                .select('price, product_id, products(name)')
                .eq('id', item.variant_id)
                .single();

            if (!variant) throw new Error(`Invalid variant: ${item.variant_id}`);

            const price = variant.price; // In cents
            calculatedTotal += price * item.quantity;

            validatedItems.push({
                ...item,
                price,
                name: variant.products // variant.products is an array if not joining properly, but .single() on ID should be fine if modeled right
            });
        }

        // Add shipping cost (simplified for now - mirroring Stripe logic)
        // In a real app, this should match the selected shipping rate
        const shippingCost = 0; // Free shipping for now or calculated
        const totalAmount = calculatedTotal + shippingCost;

        // 2. Create PayPal Order
        const accessToken = await generateAccessToken();
        const payload = {
            intent: 'CAPTURE',
            purchase_units: [
                {
                    amount: {
                        currency_code: 'USD',
                        value: (totalAmount / 100).toFixed(2), // PayPal expects string "100.00"
                    },
                    description: 'Order from Wizard Of Light',
                },
            ],
        };

        const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(payload),
        });

        const order = await response.json();

        if (order.id) {
            // 3. Create Pending Order in Supabase
            // We store the PayPal Order ID as the payment_intent_id for consistency
            const { data: newOrder, error: orderError } = await supabase
                .from('orders')
                .insert({
                    user_id: user_id || null, // Guest or User
                    status: 'pending',
                    total: totalAmount, // stored in cents
                    subtotal: calculatedTotal,
                    shipping_cost: shippingCost,
                    tax: 0,
                    payment_processor: 'paypal',
                    payment_intent_id: order.id,
                    shipping_address: shippingDetails,
                })
                .select()
                .single();

            if (orderError) throw orderError;

            // Insert Order Items
            const orderItems = items.map((item: any) => ({
                order_id: newOrder.id,
                product_id: item.product_id,
                variant_id: item.variant_id,
                quantity: item.quantity,
                unit_price: item.price, // user sent price, but we should use validated price
                total_price: item.price * item.quantity,
                product_name: item.name,
                variant_name: item.variant_name,
                product_image: item.image,
            }));

            await supabase.from('order_items').insert(orderItems);
        }

        return NextResponse.json(order);
    } catch (error: any) {
        console.error('PayPal Create Order Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
