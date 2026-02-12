import { Resend } from 'resend';
import { formatPrice } from '@/lib/utils';

// Use dummy key if missing to prevent crash
const resend = new Resend(process.env.RESEND_API_KEY || 're_123');

interface OrderItem {
    product_name: string;
    variant_name: string;
    quantity: number;
    unit_price: number;
}

interface OrderDetails {
    id: string;
    customer_email: string | null; // Profile email or from checkout
    customer_name: string | null;
    items: OrderItem[];
    total: number;
    shipping_address: any;
    order_number?: string; // If you have this field, otherwise use ID
}

export async function sendOrderConfirmation(order: OrderDetails) {
    if (!process.env.RESEND_API_KEY) {
        console.warn('RESEND_API_KEY is missing. Email not sent.');
        return;
    }

    const email = order.customer_email || 'customer@example.com'; // Fallback logic needed if guest

    // Generate simple HTML table for items
    const itemsHtml = order.items.map(item => `
        <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">
                ${item.product_name} <br/>
                <span style="font-size: 12px; color: #666;">${item.variant_name}</span>
            </td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${formatPrice(item.unit_price)}</td>
        </tr>
    `).join('');

    const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h1>Thank you for your order!</h1>
            <p>Hi ${order.customer_name || 'there'},</p>
            <p>We have received your order <strong>#${order.order_number || order.id.slice(0, 8)}</strong> and are getting it ready.</p>
            
            <h2>Order Summary</h2>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background-color: #f9f9f9;">
                        <th style="padding: 8px; text-align: left;">Item</th>
                        <th style="padding: 8px; text-align: center;">Qty</th>
                        <th style="padding: 8px; text-align: right;">Price</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="2" style="padding: 8px; text-align: right; font-weight: bold;">Total</td>
                        <td style="padding: 8px; text-align: right; font-weight: bold;">${formatPrice(order.total)}</td>
                    </tr>
                </tfoot>
            </table>

            <p style="margin-top: 24px;">
                <strong>Shipping to:</strong><br/>
                ${order.shipping_address?.full_name || ''}<br/>
                ${order.shipping_address?.line1 || ''}<br/>
                ${order.shipping_address?.city || ''}, ${order.shipping_address?.state || ''} ${order.shipping_address?.postal_code || ''}
            </p>

            <p style="margin-top: 40px; font-size: 12px; color: #888;">
                Wizard Of Light - Handcrafted Leather Goods<br/>
                <a href="${process.env.NEXT_PUBLIC_SITE_URL}">Visit our store</a>
            </p>
        </div>
    `;

    try {
        await resend.emails.send({
            from: 'Wizard Of Light <orders@wizardoflight.com>', // User needs to verify domain or use onboarding@resend.dev
            to: email, // Validated email
            subject: `Order Confirmation #${order.order_number || order.id.slice(0, 8)}`,
            html: html,
        });
        console.log(`Order confirmation sent to ${email}`);
    } catch (error) {
        console.error('Failed to send email:', error);
    }
}
