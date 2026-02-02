// import { connectToDatabase } from '@/lib/mongodb';
import { Seo } from '@/models/Seo';

export async function getSeoMetadata(path) {
    try {
        // Ensure DB connection
        // await connectToDatabase();

        // Fetch SEO data for the specific path
        const seoData = await Seo.findOne({ pageName: path });

        // Default metadata if no custom SEO is found
        if (!seoData) {
            return {
                title: 'Lead Sharing',
                description: 'Find and hire trusted tradespeople in the UK',
            };
        }

        // Return properly formatted Next.js metadata object
        return {
            title: seoData.title,
            description: seoData.metaDescription,
            openGraph: {
                title: seoData.ogTitle || seoData.title,
                description: seoData.ogDescription || seoData.metaDescription,
                url: seoData.canonicalUrl || `https://leadsharing.com${path}`,
                images: seoData.ogImage ? [{ url: seoData.ogImage }] : [],
                type: 'website',
            },
            alternates: {
                canonical: seoData.canonicalUrl,
            },
            robots: {
                index: seoData.metaRobots?.includes('noindex') ? false : true,
                follow: seoData.metaRobots?.includes('nofollow') ? false : true,
            },
            // You can inject JSON-LD via a script in the layout or page component if needed, 
            // but metadata API handles standard meta tags.
            // For JSON-LD (Schema), we might need to handle it separately in the page component or layout.
            other: {
                // Any custom tags
            }
        };
    } catch (error) {
        console.error('Error fetching SEO metadata:', error);
        return {
            title: 'Lead Sharing',
            description: 'Find and hire trusted tradespeople in the UK',
        };
    }
}

export async function getSeoSchema(path) {
    try {
        // await connectToDatabase();
        const seoData = await Seo.findOne({ pageName: path });
        return seoData?.schemaMarkup || null;
    } catch (error) {
        return null;
    }
}
