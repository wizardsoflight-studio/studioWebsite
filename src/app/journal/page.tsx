import Link from 'next/link';
import { BookOpen, User, Calendar } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { formatDate } from '@/lib/utils';
import styles from './journal.module.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Journal',
    description: 'Stories from the workshop — behind-the-scenes looks at leatherwork, events, and studio life.',
};

export default async function JournalPage() {
    const supabase = await createClient();
    const { data: posts } = await supabase
        .from('journal_posts')
        .select(`
      id, title, slug, excerpt, featured_image, category,
      published_at, created_at,
      profiles:author_id(full_name)
    `)
        .eq('is_published', true)
        .order('published_at', { ascending: false });

    return (
        <div className={styles.journalPage}>
            <div className="container">
                <header className={styles.pageHeader}>
                    <h1 className={styles.pageTitle}>The Journal</h1>
                    <p className={styles.pageSubtitle}>
                        Stories from the workshop — leather, craft, and everything in between
                    </p>
                </header>

                {(posts && posts.length > 0) ? (
                    <div className={styles.postsGrid}>
                        {posts.map((post) => (
                            <Link
                                key={post.id}
                                href={`/journal/${post.slug}`}
                                className={styles.postCard}
                            >
                                <div className={styles.postImageWrapper}>
                                    {post.featured_image ? (
                                        <img
                                            src={post.featured_image}
                                            alt={post.title}
                                            className={styles.postImage}
                                        />
                                    ) : (
                                        <BookOpen size={48} className={styles.postImagePlaceholder} />
                                    )}
                                </div>
                                <div className={styles.postContent}>
                                    {post.category && (
                                        <span className={styles.postCategory}>{post.category}</span>
                                    )}
                                    <h2 className={styles.postTitle}>{post.title}</h2>
                                    {post.excerpt && (
                                        <p className={styles.postExcerpt}>{post.excerpt}</p>
                                    )}
                                    <div className={styles.postMeta}>
                                        <span className={styles.postAuthor}>
                                            <User size={12} />
                                            {(post.profiles as { full_name: string | null } | null)?.full_name || 'Wizard Of Light'}
                                        </span>
                                        <span className={styles.postAuthor}>
                                            <Calendar size={12} />
                                            {formatDate(post.published_at || post.created_at)}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className={styles.emptyState}>
                        <h3>No journal entries yet</h3>
                        <p>Our first post is in the works — stay tuned!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
