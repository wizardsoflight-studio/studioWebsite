import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { items, shippingAddress } = body;

        if (!items || items.length === 0) {
            return NextResponse.json(
                { error: 'Cart is empty' },
                { status: 400 }
            );
        }

        const supabase = await createClient();

        // Get current user (optional — guests can checkout too)
        const {
            data: { user },
        } = await supabase.auth.getUser();

        // Validate items against database to prevent price manipulation
        const variantIds = items.map((item: { variantId: string }) => item.variantId);
        const { data: variants } = await supabase
            .from('product_variants')
            .select(`
        id, name, price, stock_count,
        products!inner(id, name, slug, is_nsfw, is_published)
      `)
            .in('id', variantIds);

        if (!variants || variants.length === 0) {
            return NextResponse.json(
                { error: 'No valid products found' },
                { status: 400 }
            );
        }

        // Build validated line items for Stripe
        const lineItems = [];
        const orderItems = [];
        let hasNSFW = false;

        for (const cartItem of items) {
            const variant = variants.find((v: { id: string }) => v.id === cartItem.variantId);
            if (!variant) continue;

            const product = variant.products as unknown as {
                id: string;
                name: string;
                slug: string;
                is_nsfw: boolean;
                is_published: boolean;
            };

            if (!product.is_published) continue;
            if (product.is_nsfw) {
                hasNSFW = true;
                continue; // Skip NSFW items from Stripe (they use PaymentCloud)
            }

            if (variant.stock_count < cartItem.quantity) {
                return NextResponse.json(
                    { error: `${product.name} (${variant.name}) only has ${variant.stock_count} in stock` },
                    { status: 400 }
                );
            }

            lineItems.push({
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: product.name,
                        description: variant.name,
                    },
                    unit_amount: variant.price, // Already in cents
                },
                quantity: cartItem.quantity,
            });

            orderItems.push({
                product_id: product.id,
                variant_id: variant.id,
                quantity: cartItem.quantity,
                unit_price: variant.price,
                total_price: variant.price * cartItem.quantity,
                product_name: product.name,
                variant_name: variant.name,
                product_image: null,
            });
        }

        if (lineItems.length === 0) {
            return NextResponse.json(
                { error: hasNSFW ? 'NSFW products cannot be purchased via Stripe' : 'No valid items to checkout' },
                { status: 400 }
            );
        }

        // Calculate order totals
        const subtotal = orderItems.reduce((sum, item) => sum + item.total_price, 0);

        // Create order in database
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                user_id: user?.id || null,
                status: 'pending',
                subtotal,
                shipping_cost: 0,
                tax: 0,
                total: subtotal,
                payment_processor: 'stripe',
                shipping_address: shippingAddress || null,
            })
            .select()
            .single();

        if (orderError) {
            console.error('Order creation error:', orderError);
            return NextResponse.json(
                { error: 'Failed to create order' },
                { status: 500 }
            );
        }

        // Insert order items
        const itemsWithOrderId = orderItems.map((item) => ({
            ...item,
            order_id: order.id,
        }));

        await supabase.from('order_items').insert(itemsWithOrderId);

        // Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/checkout/cancel`,
            metadata: {
                order_id: order.id,
                order_number: order.order_number || order.id.slice(0, 8),
            },
            customer_email: user?.email || undefined,
            shipping_address_collection: {
                allowed_countries: ['US', 'CA', 'GB', 'AU', 'NZ', 'DE', 'FR'],
            },
        });

        // Update order with Stripe session ID
        await supabase
            .from('orders')
            .update({ payment_intent_id: session.id })
            .eq('id', order.id);

        return NextResponse.json({ url: session.url, sessionId: session.id });
    } catch (error) {
        console.error('Checkout error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
