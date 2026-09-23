import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://allcarepros.ca';

    return {
        rules: [
            {
                userAgent: '*',
                allow: ['/', '/api/ai-gateway/openapi.json', '/llms.txt'],
                disallow: [
                    '/admin/',
                    '/api/',
                    '/test-route/',
                    '/*?_rsc=',
                    '/*&_rsc=',
                ],
            },
            {
                userAgent: [
                    'GPTBot',
                    'ChatGPT-User',
                    'ClaudeBot',
                    'Google-Extended',
                    'PerplexityBot',
                    'OAI-SearchBot'
                ],
                allow: ['/', '/api/ai-gateway/openapi.json', '/llms.txt'],
                disallow: ['/admin/']
            }
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    }
}
