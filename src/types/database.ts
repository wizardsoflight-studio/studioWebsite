/**
 * Core database types for Wizard Of Light
 * These will be replaced by auto-generated types from Supabase
 * once the database is set up (npx supabase gen types typescript)
 */

export type UserRole = 'customer' | 'fulfillment' | 'content_editor' | 'manager' | 'owner';

export type OrderStatus =
    | 'pending'
    | 'paid'
    | 'processing'
    | 'shipped'
    | 'delivered'
    | 'refund_requested'
    | 'return_requested'
    | 'return_received'
    | 'refunded'
    | 'cancelled';

export interface Profile {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
    role: UserRole;
    nsfw_enabled: boolean;
    newsletter_subscribed: boolean;
    created_at: string;
    updated_at: string;
}

export interface Product {
    id: string;
    name: string;
    slug: string;
    description: string;
    short_description: string | null;
    is_nsfw: boolean;
    is_custom_order: boolean;
    is_published: boolean;
    category_id: string | null;
    low_stock_threshold: number;
    created_at: string;
    updated_at: string;
    video_url: string | null;
    // Virtual fields (from joins)
    variants?: ProductVariant[];
    images?: ProductImage[];
    categories?: Category[];
    average_rating?: number;
    review_count?: number;
}

export interface ProductVariant {
    id: string;
    product_id: string;
    sku: string;
    name: string; // e.g., "Large / Black / Full-grain"
    price: number; // in cents
    compare_at_price: number | null; // original price if on sale
    stock_count: number;
    weight_grams: number | null;
    sort_order: number;
    options: Record<string, string>; // { size: "L", color: "Black", material: "Full-grain" }
    created_at: string;
}

export interface ProductImage {
    id: string;
    product_id: string;
    url: string;
    alt: string | null;
    sort_order: number;
    is_primary: boolean;
}

export interface Category {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    is_nsfw: boolean;
    sort_order: number;
}

export interface Order {
    id: string;
    user_id: string;
    status: OrderStatus;
    subtotal: number;
    shipping_cost: number;
    tax: number;
    total: number;
    payment_processor: 'stripe' | 'paymentcloud';
    payment_intent_id: string | null;
    shipping_address: ShippingAddress;
    tracking_number: string | null;
    tracking_url: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
    // Virtual
    items?: OrderItem[];
}

export interface OrderItem {
    id: string;
    order_id: string;
    product_id: string;
    variant_id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    product_name: string;
    variant_name: string;
    product_image: string | null;
}

export interface ShippingAddress {
    id?: string;
    user_id?: string;
    full_name: string;
    line1: string;
    line2: string | null;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    phone: string | null;
    is_default?: boolean;
}

export interface CartItem {
    id: string;
    user_id: string;
    variant_id: string;
    quantity: number;
    // Virtual
    variant?: ProductVariant;
    product?: Product;
}

export interface Review {
    id: string;
    product_id: string;
    user_id: string;
    rating: number; // 1-5
    title: string | null;
    body: string | null;
    is_verified_purchase: boolean;
    is_approved: boolean;
    created_at: string;
    // Virtual
    user?: Pick<Profile, 'full_name' | 'avatar_url'>;
}

export interface Event {
    id: string;
    title: string;
    description: string;
    start_date: string;
    end_date: string;
    venue_name: string;
    address: string;
    lat: number | null;
    lng: number | null;
    image_url: string | null;
    is_published: boolean;
    created_at: string;
}

export interface JournalPost {
    id: string;
    title: string;
    slug: string;
    content: string; // HTML from Tiptap
    excerpt: string | null;
    featured_image: string | null;
    category: string | null;
    author_id: string;
    is_published: boolean;
    published_at: string | null;
    created_at: string;
    updated_at: string;
    // Virtual
    author?: Pick<Profile, 'full_name' | 'avatar_url'>;
    tags?: string[];
    comment_count?: number;
}

export interface Comment {
    id: string;
    post_id: string;
    user_id: string;
    body: string;
    is_approved: boolean;
    created_at: string;
    // Virtual
    user?: Pick<Profile, 'full_name' | 'avatar_url'>;
}

export interface ShippingZone {
    id: string;
    name: string;
    countries: string[]; // ISO country codes
    flat_rate: number | null; // in cents
    weight_rate: number | null; // per gram in cents
    free_shipping_threshold: number | null; // in cents
}
