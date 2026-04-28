import { Seo } from '@/models/Seo';

/**
 * Matches a URL path against a pattern like /local-tradespeople/[location]
 * Returns params if matched, null otherwise.
 */
function matchPattern(pattern, path) {
    if (!pattern.includes('[') && !pattern.includes(':')) return null;

    const patternSegments = pattern.split('/').filter(Boolean);
    const pathSegments = path.split('/').filter(Boolean);

    if (patternSegments.length !== pathSegments.length) return null;

    const params = {};
    for (let i = 0; i < patternSegments.length; i++) {
        const patternSeg = patternSegments[i];
        const pathSeg = pathSegments[i];

        if (patternSeg.startsWith('[') && patternSeg.endsWith(']')) {
            const paramName = patternSeg.slice(1, -1);
            params[paramName] = pathSeg;
        } else if (patternSeg.startsWith(':')) {
            const paramName = patternSeg.slice(1);
            params[paramName] = pathSeg;
        } else if (patternSeg !== pathSeg) {
            return null;
        }
    }
    return params;
}

/**
 * Replaces placeholders like [location] or {location} with actual values
 */
function replaceParams(text, params) {
    if (!text) return text;
    let result = text;
    for (const [key, value] of Object.entries(params)) {
        // Format value: "toronto" -> "Toronto"
        const formattedValue = value.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        
        // Handle [key], {key}, and :key
        result = result.replace(new RegExp(`\\[${key}\\]`, 'gi'), formattedValue);
        result = result.replace(new RegExp(`\\{${key}\\}`, 'gi'), formattedValue);
        result = result.replace(new RegExp(`:${key}`, 'gi'), formattedValue);
    }
    return result;
}

export async function getSeoMetadata(path) {
    try {
        // 1. Try exact match first
        let seoData = await Seo.findOne({ pageName: path });
        let params = {};

        // 2. If no exact match, try pattern matching
        if (!seoData) {
            const allSeo = await Seo.find({});
            const patterns = allSeo.filter(s => s.pageName.includes('[') || s.pageName.includes(':'));
            
            for (const p of patterns) {
                const matchedParams = matchPattern(p.pageName, path);
                if (matchedParams) {
                    seoData = p;
                    params = matchedParams;
                    break;
                }
            }
        }

        console.log(`[SEO DEBUG] Fetching metadata for path: ${path}. Found: ${seoData ? 'YES' : 'NO'} (Dynamic: ${Object.keys(params).length > 0})`);

        // Default metadata if no custom SEO is found
        if (!seoData) {
            return {
                title: 'AllCarePros Canada',
                description: 'Find and hire trusted tradespeople in Canada',
            };
        }

        // Apply parameter replacement for dynamic paths
        const title = replaceParams(seoData.title, params);
        const description = replaceParams(seoData.metaDescription, params);
        const ogTitle = replaceParams(seoData.ogTitle, params) || title;
        const ogDescription = replaceParams(seoData.ogDescription, params) || description;

        // Return properly formatted Next.js metadata object
        return {
            title,
            description,
            openGraph: {
                title: ogTitle,
                description: ogDescription,
                url: seoData.canonicalUrl || `https://allcarepros.ca${path}`,
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
            other: {
                // Any custom tags
            }
        };
    } catch (error) {
        console.error('Error fetching SEO metadata:', error);
        return {
            title: 'AllCarePros Canada',
            description: 'Find and hire trusted tradespeople in Canada',
        };
    }
}

export async function getSeoSchema(path) {
    try {
        // Try exact match first
        let seoData = await Seo.findOne({ pageName: path });
        let params = {};

        // Try pattern match
        if (!seoData) {
            const allSeo = await Seo.find({});
            const patterns = allSeo.filter(s => s.pageName.includes('[') || s.pageName.includes(':'));
            for (const p of patterns) {
                const matchedParams = matchPattern(p.pageName, path);
                if (matchedParams) {
                    seoData = p;
                    params = matchedParams;
                    break;
                }
            }
        }

        if (!seoData?.schemaMarkup) return null;

        // Strip any <script> tags to avoid nested tags and hydration mismatch
        const cleanedSchema = seoData.schemaMarkup.replace(/<script[^>]*>/gi, '').replace(/<\/script>/gi, '').trim();

        // Replace params in schema markup
        return replaceParams(cleanedSchema, params);
    } catch (error) {
        return null;
    }
}

export async function getGlobalSeoSchema() {
    try {
        const globalSeo = await Seo.findOne({ pageName: 'global' });
        let schema = globalSeo?.schemaMarkup || null;
        
        if (schema) {
            // Strip any <script> tags to avoid nested tags and hydration mismatch
            schema = schema.replace(/<script[^>]*>/gi, '').replace(/<\/script>/gi, '').trim();
        }
        
        return schema;
    } catch (error) {
        console.error('Error fetching global SEO schema:', error);
        return null;
    }
}

export async function getGlobalScripts() {
    try {
        const globalSeo = await Seo.findOne({ pageName: 'global' });
        return {
            headerScripts: globalSeo?.headerScripts || null,
            footerScripts: globalSeo?.footerScripts || null
        };
    } catch (error) {
        console.error('Error fetching global scripts:', error);
        return { headerScripts: null, footerScripts: null };
    }
}

