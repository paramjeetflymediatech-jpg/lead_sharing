import { MetadataRoute } from 'next'
import { TRADE_SERVICE_LINKS } from '@/constants/locations'
import { Service } from '@/models/Service';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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

    // 1. Get Dynamic Services from DB
    let dynamicServicePages = [];
    try {
        const services = await Service.find({ isActive: true });
        dynamicServicePages = services.map((s) => ({
            url: `${baseUrl}/local-tradespeople/${s.slug}`,
            lastModified: s.updatedAt || new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.7,
        }));
    } catch (error) {
        console.error("Error fetching services for sitemap:", error);
    }

    // 2. Generate pages from static TRADE_SERVICE_LINKS (fallback/legacy)
    const staticServicePages = Object.values(TRADE_SERVICE_LINKS).flatMap((entry) => {
        return entry.services.map((service) => ({
            url: `${baseUrl}/local-tradespeople/${(typeof service === 'string' ? service : service.name).toLowerCase().replace(/ /g, '-')}`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.7,
        }));
    });

    // Combine all, use a Map to filter duplicates by URL
    const allPages = [...staticPages, ...dynamicServicePages, ...staticServicePages];
    const uniquePagesMap = new Map();
    allPages.forEach(page => uniquePagesMap.set(page.url, page));

    return Array.from(uniquePagesMap.values());
}


