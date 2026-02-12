import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service'; // Use service to bypass RLS for updates if needed independently
import { createClient } from '@/lib/supabase/server';

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
        const { orderID } = await req.json();

        // 1. Capture Payment with PayPal
        const accessToken = await generateAccessToken();
        const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${orderID}/capture`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const data = await response.json();

        // 2. Handle Successful Capture
        if (data.status === 'COMPLETED') {
            const supabaseService = createServiceClient();

            // Find order by PayPal ID
            const { data: order, error: findError } = await supabaseService
                .from('orders')
                .select('id, status, shipping_address')
                .eq('payment_intent_id', orderID)
                .single();

            if (findError || !order) {
                console.error('Order not found for capture:', orderID);
                return NextResponse.json({ error: 'Order not found' }, { status: 404 });
            }

            if (order.status === 'paid') {
                return NextResponse.json(data); // Already processed
            }

            // Extract shipping address from PayPal response
            const shipping = data.purchase_units?.[0]?.shipping;
            const paypalAddress = shipping ? {
                full_name: shipping.name?.full_name,
                line1: shipping.address?.address_line_1,
                line2: shipping.address?.address_line_2,
                city: shipping.address?.admin_area_2,
                state: shipping.address?.admin_area_1,
                postal_code: shipping.address?.postal_code,
                country: shipping.address?.country_code,
            } : null;

            // Update Status to Paid and Save Address
            await supabaseService
                .from('orders')
                .update({
                    status: 'paid',
                    shipping_address: paypalAddress || order.shipping_address
                })
                .eq('id', order.id);

            // Decrement Stock
            const { data: items } = await supabaseService
                .from('order_items')
                .select('variant_id, quantity')
                .eq('order_id', order.id);

            if (items) {
                for (const item of items) {
                    await supabaseService.rpc('decrement_stock', {
                        row_id: item.variant_id,
                        quantity: item.quantity
                    });
                }

                // Send Email Notification
                const { data: fullOrder } = await supabaseService
                    .from('orders')
                    .select('*, order_items(*)')
                    .eq('id', order.id)
                    .single();

                if (fullOrder) {
                    const { sendOrderConfirmation } = await import('@/lib/email');
                    await sendOrderConfirmation({
                        id: fullOrder.id,
                        order_number: fullOrder.order_number,
                        customer_email: data.payer?.email_address || null,
                        customer_name: data.payer?.name?.given_name ? `${data.payer.name.given_name} ${data.payer.name.surname}` : null,
                        total: fullOrder.total,
                        shipping_address: fullOrder.shipping_address,
                        items: fullOrder.order_items.map((i: any) => ({
                            product_name: i.product_name,
                            variant_name: i.variant_name,
                            quantity: i.quantity,
                            unit_price: i.unit_price
                        }))
                    });
                }
            }
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('PayPal Capture Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
