import { Heart } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import styles from '../account.module.css';

export default async function WishlistPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const { data: wishlistItems } = await supabase
        .from('wishlists')
        .select(`
      id,
      products:product_id(name, slug, is_published)
    `)
        .eq('user_id', user!.id);

    return (
        <>
            <h2 className={styles.contentTitle}>Wishlist</h2>
            {wishlistItems && wishlistItems.length > 0 ? (
                <div className={styles.ordersList}>
                    {wishlistItems.map((item) => (
                        <div key={item.id} className={styles.orderCard}>
                            <div className={styles.orderNumber}>
                                {(item.products as unknown as { name: string })?.name}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className={styles.emptyState}>
                    <Heart size={48} />
                    <h3>No items saved</h3>
                    <p>Click the heart icon on products to save them for later.</p>
                </div>
            )}
        </>
    );
}
