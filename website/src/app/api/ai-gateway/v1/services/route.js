import { NextResponse } from 'next/server';
import { Service } from '@/models/Service';
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
        const slug = url.searchParams.get('slug');
        const location = url.searchParams.get('location');
        const categoryId = url.searchParams.get('category_id');

        if (slug) {
            const service = await Service.findOne({ slug });
            if (!service) {
                return NextResponse.json({ success: false, message: `Service '${slug}' not found` }, { status: 404 });
            }
            return NextResponse.json({ success: true, data: service });
        }

        const query = {};
        if (categoryId) query.category = categoryId;

        let services = await Service.find(query);

        if (location) {
            services = services.filter(s => s.location?.toLowerCase() === location.toLowerCase() || s.name?.toLowerCase().includes(location.toLowerCase()));
        }

        return NextResponse.json({ success: true, count: services.length, data: services });
    } catch (error) {
        console.error("AI Gateway Services GET Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    const auth = authenticateAiGateway(request);
    if (!auth.authenticated) return auth.response;

    try {
        const body = await request.json();
        let { name, slug, description, content, category_id, categoryId, faq, location, is_active, isActive, image } = body;

        if (!name) {
            return NextResponse.json({ success: false, error: "name is required." }, { status: 400 });
        }

        if (!slug) {
            slug = slugify(name);
        }

        const serviceData = {
            name,
            slug,
            description: typeof description === 'string' ? [{ tag: 'p', text: description }] : description,
            content: content || "",
            category_id: category_id || categoryId || null,
            faq: faq || [],
            location: location || null,
            is_active: is_active ?? isActive ?? 1,
            image: image || null
        };

        const existing = await Service.findOne({ slug });
        let result;

        if (existing) {
            result = await Service.findByIdAndUpdate(existing._id, serviceData);
            return NextResponse.json({
                success: true,
                message: `Updated service '${name}'`,
                data: result
            });
        } else {
            result = await Service.create(serviceData);
            return NextResponse.json({
                success: true,
                message: `Created service '${name}'`,
                data: result
            }, { status: 201 });
        }
    } catch (error) {
        console.error("AI Gateway Services POST Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(request) {
    const auth = authenticateAiGateway(request);
    if (!auth.authenticated) return auth.response;

    try {
        const url = new URL(request.url);
        const slug = url.searchParams.get('slug');
        const id = url.searchParams.get('id');

        let targetId = id;
        if (!targetId && slug) {
            const existing = await Service.findOne({ slug });
            if (existing) targetId = existing._id;
        }

        if (!targetId) {
            return NextResponse.json({ success: false, error: "Service not found or slug/id missing." }, { status: 404 });
        }

        await Service.findByIdAndDelete(targetId);
        return NextResponse.json({ success: true, message: `Service deleted successfully.` });
    } catch (error) {
        console.error("AI Gateway Services DELETE Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
