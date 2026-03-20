import { formatPrice } from '@/lib/utils';

// Brevo transactional email API
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

const SENDER = {
    name:  process.env.BREVO_SENDER_NAME  || 'Wizard Of Light',
    email: process.env.BREVO_SENDER_EMAIL || 'orders@wizardoflight.com',
};

interface OrderItem {
    product_name: string;
    variant_name: string;
    quantity: number;
    unit_price: number;
}

interface OrderDetails {
    id: string;
    customer_email: string | null;
    customer_name: string | null;
    items: OrderItem[];
    total: number;
    shipping_address: {
        full_name?: string;
        line1?: string;
        city?: string;
        state?: string;
        postal_code?: string;
    };
    order_number?: string;
}

export async function sendOrderConfirmation(order: OrderDetails): Promise<void> {
    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
        console.warn('BREVO_API_KEY is missing — email not sent.');
        return;
    }

    const email = order.customer_email ?? 'customer@example.com';
    const orderRef = order.order_number ?? order.id.slice(0, 8).toUpperCase();

    const itemsHtml = order.items.map(item => `
        <tr>
            <td style="padding:8px;border-bottom:1px solid #ddd;">
                ${item.product_name}<br/>
                <span style="font-size:12px;color:#666;">${item.variant_name}</span>
            </td>
            <td style="padding:8px;border-bottom:1px solid #ddd;text-align:center;">${item.quantity}</td>
            <td style="padding:8px;border-bottom:1px solid #ddd;text-align:right;">${formatPrice(item.unit_price)}</td>
        </tr>
    `).join('');

    const html = `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#1a1a1a;">
            <h1 style="font-size:24px;margin-bottom:8px;">Thank you for your order!</h1>
            <p>Hi ${order.customer_name ?? 'there'},</p>
            <p>We received your order <strong>#${orderRef}</strong> and are getting it ready for you.</p>

            <h2 style="font-size:16px;margin-top:32px;margin-bottom:8px;">Order Summary</h2>
            <table style="width:100%;border-collapse:collapse;">
                <thead>
                    <tr style="background:#f5f5f5;">
                        <th style="padding:8px;text-align:left;">Item</th>
                        <th style="padding:8px;text-align:center;">Qty</th>
                        <th style="padding:8px;text-align:right;">Price</th>
                    </tr>
                </thead>
                <tbody>${itemsHtml}</tbody>
                <tfoot>
                    <tr>
                        <td colspan="2" style="padding:8px;text-align:right;font-weight:bold;">Total</td>
                        <td style="padding:8px;text-align:right;font-weight:bold;">${formatPrice(order.total)}</td>
                    </tr>
                </tfoot>
            </table>

            <p style="margin-top:24px;">
                <strong>Shipping to:</strong><br/>
                ${order.shipping_address?.full_name ?? ''}<br/>
                ${order.shipping_address?.line1 ?? ''}<br/>
                ${order.shipping_address?.city ?? ''}, ${order.shipping_address?.state ?? ''} ${order.shipping_address?.postal_code ?? ''}
            </p>

            <p style="margin-top:40px;font-size:12px;color:#888;">
                Wizard Of Light — Handcrafted Leather Goods, Nebraska<br/>
                <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? ''}">Visit our store</a>
            </p>
        </div>
    `;

    try {
        const res = await fetch(BREVO_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': apiKey,
            },
            body: JSON.stringify({
                sender: SENDER,
                to: [{ email }],
                subject: `Order Confirmation #${orderRef}`,
                htmlContent: html,
            }),
        });

        if (!res.ok) {
            const body = await res.text();
            console.error(`Brevo error ${res.status}:`, body);
        } else {
            console.log(`Order confirmation sent to ${email} via Brevo`);
        }
    } catch (error) {
        console.error('Failed to send order confirmation email:', error);
    }
}
