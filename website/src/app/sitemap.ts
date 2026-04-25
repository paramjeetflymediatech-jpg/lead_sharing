import { MetadataRoute } from 'next'
import { TRADE_SERVICE_LINKS } from '@/constants/locations'

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://leadsharing.socialflymediatech.com';

    const staticPages = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'yearly' as const,
            priority: 1,
        },
        {
            url: `${baseUrl}/about`,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.8,
        },
        {
            url: `${baseUrl}/contact`,
            lastModified: new Date(),
            changeFrequency: 'yearly' as const,
            priority: 0.5,
        },
    ];

    // Generate dynamic pages for each service in each location
    const servicePages = Object.values(TRADE_SERVICE_LINKS).flatMap((entry) => {
        return entry.services.map((service) => ({
            url: `${baseUrl}/local-tradespeople/${service.toLowerCase().replace(/ /g, '-')}`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.7,
        }));
    });

    return [...staticPages, ...servicePages];
}

