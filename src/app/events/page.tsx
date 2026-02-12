import { MapPin, Calendar, Clock } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import styles from './events.module.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Events',
    description: 'Find Wizard Of Light at conventions, Renaissance faires, and markets near you.',
};

export default async function EventsPage() {
    const supabase = await createClient();
    const { data: events } = await supabase
        .from('events')
        .select('*')
        .eq('is_published', true)
        .gte('end_date', new Date().toISOString())
        .order('start_date', { ascending: true });

    return (
        <div className={styles.eventsPage}>
            <div className="container">
                <header className={styles.pageHeader}>
                    <h1 className={styles.pageTitle}>Upcoming Events</h1>
                    <p className={styles.pageSubtitle}>
                        Come see us in person — try on, try out, and talk leather
                    </p>
                </header>

                {(events && events.length > 0) ? (
                    <div className={styles.eventsList}>
                        {events.map((event) => {
                            const start = new Date(event.start_date);
                            const end = new Date(event.end_date);
                            const month = start.toLocaleDateString('en-US', { month: 'short' });
                            const day = start.getDate();
                            const year = start.getFullYear();
                            const timeRange = `${start.toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                            })} – ${end.toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                            })}`;

                            return (
                                <article key={event.id} className={styles.eventCard}>
                                    <div className={styles.eventDate}>
                                        <span className={styles.eventMonth}>{month}</span>
                                        <span className={styles.eventDay}>{day}</span>
                                        <span className={styles.eventYear}>{year}</span>
                                    </div>
                                    <div className={styles.eventInfo}>
                                        <h3>{event.title}</h3>
                                        <p>{event.description}</p>
                                        <div className={styles.eventMeta}>
                                            <span className={styles.eventMetaItem}>
                                                <Calendar size={16} />
                                                {timeRange}
                                            </span>
                                            {event.venue_name && (
                                                <span className={styles.eventMetaItem}>
                                                    <MapPin size={16} />
                                                    {event.venue_name}
                                                </span>
                                            )}
                                            {event.address && (
                                                <span className={styles.eventMetaItem}>
                                                    <Clock size={16} />
                                                    {event.address}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                ) : (
                    <div className={styles.emptyState}>
                        <h3>No upcoming events</h3>
                        <p>Check back soon — we&apos;re always planning our next appearance!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
