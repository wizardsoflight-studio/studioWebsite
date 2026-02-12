import { createServerClient } from '@supabase/ssr';

/**
 * Creates a Supabase client with the service role key.
 * This bypasses RLS — use only for server-side operations
 * where RLS would block legitimate access (e.g., NSFW product listing
 * after client-side age verification, webhook processing).
 */
export function createServiceClient() {
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            cookies: {
                getAll: () => [],
                setAll: () => { },
            },
        }
    );
}
