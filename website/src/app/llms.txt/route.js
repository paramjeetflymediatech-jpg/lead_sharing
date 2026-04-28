import { TRADE_SERVICE_LINKS } from "@/constants/locations";
import { Service } from "@/models/Service";

export async function GET() {
    let dynamicServices = [];
    try {
        const services = await Service.find({ isActive: true });
        dynamicServices = services.map(s => s.name);
    } catch (error) {
        console.error("Error fetching services for llms.txt:", error);
    }

    const locations = Object.values(TRADE_SERVICE_LINKS);
    const staticServices = locations.flatMap(loc => loc.services.map(s => typeof s === 'string' ? s : s.name));
    const allServicesList = [...dynamicServices, ...staticServices];
    const uniqueServices = [...new Set(allServicesList)];

    const content = `# Leadsharing - Professional Tradespeople Directory

Leadsharing is a premium platform connecting homeowners with vetted, top-rated tradespeople across Canada.

## Services Offered
We specialize in various roofing and home maintenance services including:
${uniqueServices.map(s => `- ${s}`).join('\n')}

## Locations Served
We serve multiple locations across Canada, including:
${locations.map(l => `- ${l.location}`).join('\n')}

## How it Works
1. Homeowners post a job with details, photos, and budget.
2. Vetted professionals provide free quotes.
3. Homeowners compare quotes and hire the best pro.

## For Professionals
Professionals can join the platform, create a profile, and find leads in their local area.

## Latest Updates
- Dynamically serving over ${allServicesList.length} localized service pages.
- Real-time quote tracking and in-app chat enabled.
`;

    return new Response(content, {
        headers: {
            "Content-Type": "text/plain",
        },
    });
}

