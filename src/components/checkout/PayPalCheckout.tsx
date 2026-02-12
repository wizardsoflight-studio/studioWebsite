'use client';

import { useEffect, useState } from 'react';
import { PayPalScriptProvider, PayPalButtons, ReactPayPalScriptOptions } from '@paypal/react-paypal-js';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';

interface PayPalCheckoutProps {
    shippingDetails: any;
    userId?: string;
}

export default function PayPalCheckout({ shippingDetails, userId }: PayPalCheckoutProps) {
    const { items, clearCart } = useCart();
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);

    const initialOptions: ReactPayPalScriptOptions = {
        clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'test',
        currency: "USD",
        intent: "capture",
    };

    const createOrder = async () => {
        try {
            const response = await fetch('/api/checkout/paypal/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: items,
                    shippingDetails,
                    user_id: userId,
                }),
            });

            const order = await response.json();

            if (order.id) {
                return order.id;
            } else {
                throw new Error('Failed to create PayPal order');
            }
        } catch (err: any) {
            setError(err.message);
            console.error('Payment initialization failed', err);
            throw err;
        }
    };

    const onApprove = async (data: any) => {
        try {
            const response = await fetch('/api/checkout/paypal/capture-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderID: data.orderID,
                }),
            });

            const details = await response.json();

            if (details.status === 'COMPLETED' || details.status === 'approved') { // PayPal sandbox sometimes returns 'approved'
                clearCart();
                router.push('/checkout/success?session_id=' + data.orderID); // Reusing success page, might need tweak
            } else {
                setError('Payment not completed');
            }
        } catch (err: any) {
            setError(err.message);
            console.error('Payment capture failed', err);
        }
    };

    if (!process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID) {
        return <div className="text-red-500">PayPal Client ID missing</div>;
    }

    return (
        <div style={{ marginTop: '1rem', position: 'relative', zIndex: 1 }}>
            <PayPalScriptProvider options={initialOptions}>
                <PayPalButtons
                    style={{ layout: "vertical", color: "gold", shape: "rect", label: "paypal" }}
                    createOrder={createOrder}
                    onApprove={onApprove}
                    onError={(err) => {
                        console.error('PayPal Error:', err);
                        setError('An error occurred with PayPal');
                    }}
                />
            </PayPalScriptProvider>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>
    );
}
