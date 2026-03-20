'use client';

import { CartProvider } from '@/context/CartContext';

// QueryClientProvider removed — all data fetching is server-side (Supabase Server Components).
// React Query was adding ~40KB to the client bundle without benefit.
export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <CartProvider>
            {children}
        </CartProvider>
    );
}
