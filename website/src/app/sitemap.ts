import { MetadataRoute } from 'next'
import { Service } from '@/models/Service';
import { Blog } from '@/models/Blog';

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
    let dynamicServicePages: MetadataRoute.Sitemap = [];
    try {
        const services = await Service.find({ isActive: true });
        dynamicServicePages = services.map((s: any) => ({
            url: `${baseUrl}/local-tradespeople/${s.slug}`,
            lastModified: s.updatedAt || new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.7,
        }));
    } catch (error) {
        console.error("Error fetching services for sitemap:", error);
    }
    
    let dynamicBlogPages: MetadataRoute.Sitemap = [];
    try {
        const blogsResult = await Blog.find({ status: 'published' }, { limit: 1000 });
        dynamicBlogPages = blogsResult.blogs.map((b: any) => ({
            url: `${baseUrl}/blog/${b.slug}`,
            lastModified: b.updatedAt || new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.7,
        }));
    } catch (error) {
        console.error("Error fetching blogs for sitemap:", error);
    }

    // Combine all, use a Map to filter duplicates by URL
    const allPages = [...staticPages, ...dynamicServicePages, ...dynamicBlogPages];
    const uniquePagesMap = new Map();
    allPages.forEach(page => uniquePagesMap.set(page.url, page));

    return Array.from(uniquePagesMap.values());
}


