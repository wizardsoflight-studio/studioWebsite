import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createServerClient } from '@supabase/ssr';

export async function POST(request: Request) {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
        return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    let event;
    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error('Webhook signature verification failed:', err);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Use service role for webhook processing (no user cookie)
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { cookies: { getAll: () => [], setAll: () => { } } }
    );

    switch (event.type) {
        case 'checkout.session.completed': {
            const session = event.data.object;
            const orderId = session.metadata?.order_id;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const shippingDetails = (session as any).shipping_details;

            if (orderId) {
                // Update order status
                await supabase
                    .from('orders')
                    .update({
                        status: 'paid',
                        payment_intent_id: session.payment_intent as string,
                        shipping_address: shippingDetails
                            ? {
                                full_name: shippingDetails.name || '',
                                line1: shippingDetails.address?.line1 || '',
                                line2: shippingDetails.address?.line2 || null,
                                city: shippingDetails.address?.city || '',
                                state: shippingDetails.address?.state || '',
                                postal_code: shippingDetails.address?.postal_code || '',
                                country: shippingDetails.address?.country || '',
                                phone: null,
                            }
                            : undefined,
                    })
                    .eq('id', orderId);

                // Decrement stock for each order item
                const { data: orderItems } = await supabase
                    .from('order_items')
                    .select('variant_id, quantity')
                    .eq('order_id', orderId);

                if (orderItems) {
                    for (const item of orderItems) {
                        await supabase.rpc('decrement_stock', {
                            p_variant_id: item.variant_id,
                            p_quantity: item.quantity,
                        });
                    }
                }

                // Send Email Notification
                const { data: fullOrder } = await supabase
                    .from('orders')
                    .select('*, order_items(*)')
                    .eq('id', orderId)
                    .single();

                if (fullOrder) {
                    const { sendOrderConfirmation } = await import('@/lib/email');
                    await sendOrderConfirmation({
                        id: fullOrder.id,
                        order_number: fullOrder.order_number,
                        customer_email: session.customer_details?.email || null,
                        customer_name: session.customer_details?.name || null,
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
            break;
        }

        case 'checkout.session.expired': {
            const session = event.data.object;
            const orderId = session.metadata?.order_id;

            if (orderId) {
                await supabase
                    .from('orders')
                    .update({ status: 'cancelled' })
                    .eq('id', orderId);
            }
            break;
        }

        default:
            // Unhandled event type
            break;
    }

    return NextResponse.json({ received: true });
}
