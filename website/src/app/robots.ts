import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://leadsharing.socialflymediatech.com';

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/admin/', '/api/', '/test-route/',
                '/*?_rsc=',
                '/*&_rsc=',
            ],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    }
}
