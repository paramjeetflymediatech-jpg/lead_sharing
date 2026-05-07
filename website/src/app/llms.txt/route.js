import { Service } from "@/models/Service";
import { Location } from "@/models/Location";
import { Blog } from "@/models/Blog";

export async function GET() {
    let dynamicServices = [];
    try {
        const services = await Service.find({ isActive: true });
        dynamicServices = services.map(s => s.name);
    } catch (error) {
        console.error("Error fetching services for llms.txt:", error);
    }

    let dbLocations = [];
    try {
        const locs = await Location.find();
        dbLocations = locs.map(l => l.name);
    } catch (error) {
        console.error("Error fetching locations for llms.txt:", error);
    }

    let blogs = [];
    try {
        const blogsResult = await Blog.find({ status: 'published' }).select('title slug');
        blogs = blogsResult.map(b => b.title);
    } catch (error) {
        console.error("Error fetching blogs for llms.txt:", error);
    }

    const uniqueServices = [...new Set(dynamicServices)];
    const uniqueBlogs = [...new Set(blogs)];

    const content = `# Leadsharing - Professional Tradespeople Directory

Leadsharing is a premium platform connecting homeowners with vetted, top-rated tradespeople across Canada.

## Services Offered
We specialize in various roofing and home maintenance services including:
${uniqueServices.map(s => `- ${s}`).join('\n')}

## Locations Served
We serve multiple locations across Canada, including:
${dbLocations.map(l => `- ${l}`).join('\n')}

## Blogs
Here are some of our blogs:
${uniqueBlogs.map(b => `- ${b}`).join('\n')}

## How it Works
1. Homeowners post a job with details, photos, and budget.
2. Vetted professionals provide free quotes.
3. Homeowners compare quotes and hire the best pro.

## For Professionals
Professionals can join the platform, create a profile, and find leads in their local area.

## Latest Updates
- Dynamically serving localized service pages.
- Real-time quote tracking and in-app chat enabled.
`;

    return new Response(content, {
        headers: {
            "Content-Type": "text/plain",
        },
    });
}

