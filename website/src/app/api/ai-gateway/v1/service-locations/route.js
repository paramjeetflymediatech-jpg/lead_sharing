import { NextResponse } from 'next/server';
import { Service } from '@/models/Service';
import { TRADE_SERVICE_LINKS } from '@/constants/locations';
import { authenticateAiGateway } from '@/lib/ai-gateway-auth';

function slugify(text) {
    if (!text) return '';
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-');
}

export async function GET(request) {
    const auth = authenticateAiGateway(request);
    if (!auth.authenticated) return auth.response;

    try {
        const url = new URL(request.url);
        const city = url.searchParams.get('city');
        const serviceQuery = url.searchParams.get('service');

        if (city && TRADE_SERVICE_LINKS[city]) {
            let services = TRADE_SERVICE_LINKS[city].services || [];
            if (serviceQuery) {
                services = services.filter(s => s.name.toLowerCase().includes(serviceQuery.toLowerCase()));
            }
            return NextResponse.json({
                success: true,
                city,
                count: services.length,
                data: services
            });
        }

        // Return summary of all city services count
        const summary = Object.entries(TRADE_SERVICE_LINKS).map(([cityName, data]) => ({
            city: cityName,
            servicesCount: data.services?.length || 0,
            seo: data.seo
        }));

        return NextResponse.json({
            success: true,
            totalCities: summary.length,
            data: summary
        });
    } catch (error) {
        console.error("AI Gateway Service-Locations GET Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    const auth = authenticateAiGateway(request);
    if (!auth.authenticated) return auth.response;

    try {
        const body = await request.json();
        const { city, serviceName, seoTitle, metaDescription, content, faq } = body;

        if (!city || !serviceName) {
            return NextResponse.json({ success: false, error: "city and serviceName are required." }, { status: 400 });
        }

        const fullName = serviceName.includes(' in ') ? serviceName : `${serviceName} in ${city}`;
        const slug = slugify(fullName);

        const serviceData = {
            name: fullName,
            slug,
            description: metaDescription ? [{ tag: 'p', text: metaDescription }] : undefined,
            content: content || "",
            faq: faq || [],
            location: city,
            is_active: 1
        };

        const existing = await Service.findOne({ slug });
        let result;

        if (existing) {
            result = await Service.findByIdAndUpdate(existing._id, serviceData);
            return NextResponse.json({
                success: true,
                message: `Updated service location '${fullName}'`,
                data: result
            });
        } else {
            result = await Service.create(serviceData);
            return NextResponse.json({
                success: true,
                message: `Created service location '${fullName}'`,
                data: result
            }, { status: 201 });
        }
    } catch (error) {
        console.error("AI Gateway Service-Locations POST Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
