/**
 * General utility functions
 */

/**
 * Format a price in cents to a display string
 */
export function formatPrice(cents: number, currency = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
    }).format(cents / 100);
}

/**
 * Format a date to a locale string
 */
export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        ...options,
    }).format(new Date(date));
}

/**
 * Generate a URL-friendly slug from a string
 */
export function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

/**
 * Truncate text to a max length with ellipsis
 */
export function truncate(text: string, length: number): string {
    if (text.length <= length) return text;
    return text.slice(0, length).trimEnd() + '…';
}

/**
 * Clamp a number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

/**
 * Generate a stock display label from internal count
 */
export function getStockLabel(count: number, threshold = 10): string | null {
    if (count <= 0) return 'Out of Stock';
    if (count <= threshold) return 'Limited Supply';
    return null; // In stock — no label needed
}

/**
 * Check if a product is NSFW
 */
export function isNSFW(product: { is_nsfw: boolean }): boolean {
    return product.is_nsfw;
}

/**
 * Combine class names, filtering out falsy values
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
    return classes.filter(Boolean).join(' ');
}
