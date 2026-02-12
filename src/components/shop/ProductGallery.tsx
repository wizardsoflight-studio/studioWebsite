'use client';

import { useState } from 'react';
import { Play, Package } from 'lucide-react';
import type { ProductImage } from '@/types/database';
import styles from './ProductGallery.module.css';

interface ProductGalleryProps {
    images: ProductImage[];
    videoUrl: string | null;
    productName: string;
}

export default function ProductGallery({ images, videoUrl, productName }: ProductGalleryProps) {
    const [selectedIndex, setSelectedIndex] = useState(0);

    // Combine images and video into a single list of media items
    const mediaItems = [
        ...images.sort((a, b) => (a.sort_order - b.sort_order)),
        ...(videoUrl ? [{ type: 'video', url: videoUrl, id: 'video' }] : [])
    ];

    const selectedItem = mediaItems[selectedIndex];

    const getEmbedUrl = (url: string) => {
        // Simple regex for YouTube and Vimeo
        const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
        const vimeoRegex = /(?:vimeo\.com\/)([0-9]+)/;

        const youtubeMatch = url.match(youtubeRegex);
        if (youtubeMatch) {
            return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
        }

        const vimeoMatch = url.match(vimeoRegex);
        if (vimeoMatch) {
            return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
        }

        return null;
    };

    if (mediaItems.length === 0) {
        return (
            <div className={styles.placeholderContainer}>
                <Package size={80} className={styles.placeholderIcon} />
            </div>
        );
    }

    return (
        <div className={styles.gallery}>
            {/* Main Display */}
            <div className={styles.mainDisplay}>
                {/* @ts-ignore - differentiating between image and video object loosely */}
                {selectedItem.type === 'video' ? (
                    <div className={styles.videoWrapper}>
                        {getEmbedUrl(selectedItem.url as string) ? (
                            <iframe
                                src={getEmbedUrl(selectedItem.url as string)!}
                                title={productName}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className={styles.iframe}
                            />
                        ) : (
                            <div className={styles.videoError}>
                                <p>Video unavailable</p>
                                <a href={selectedItem.url as string} target="_blank" rel="noopener noreferrer" className={styles.videoLink}>
                                    Watch on external site
                                </a>
                            </div>
                        )}
                    </div>
                ) : (
                    <img
                        /* @ts-ignore */
                        src={selectedItem.url}
                        /* @ts-ignore */
                        alt={selectedItem.alt || productName}
                        className={styles.mainImage}
                    />
                )}
            </div>

            {/* Thumbnails */}
            {mediaItems.length > 1 && (
                <div className={styles.thumbnailStrip}>
                    {mediaItems.map((item, index) => {
                        /* @ts-ignore */
                        const isVideo = item.type === 'video';
                        return (
                            <button
                                key={index}
                                onClick={() => setSelectedIndex(index)}
                                className={`${styles.thumbnail} ${selectedIndex === index ? styles.selected : ''}`}
                                /* @ts-ignore */
                                aria-label={isVideo ? 'View video' : `View image ${index + 1}`}
                            >
                                {isVideo ? (
                                    <div className={styles.videoThumbnail}>
                                        <Play size={20} fill="currentColor" />
                                    </div>
                                ) : (
                                    <img
                                        /* @ts-ignore */
                                        src={item.url}
                                        /* @ts-ignore */
                                        alt={item.alt || `Thumbnail ${index + 1}`}
                                        className={styles.thumbnailImage}
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
