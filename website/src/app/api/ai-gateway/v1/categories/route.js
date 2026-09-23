import { NextResponse } from 'next/server';
import { Category } from '@/models/Category';
import { SubCategory } from '@/models/SubCategory';
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
        const categories = await Category.find();
        const subcategories = await SubCategory.find();

        const data = categories.map(cat => ({
            id: cat._id || cat.id,
            name: cat.name,
            slug: cat.slug,
            subCategories: subcategories
                .filter(sub => (sub.category?._id || sub.category) === (cat._id || cat.id))
                .map(sub => ({
                    id: sub._id || sub.id,
                    name: sub.name,
                    slug: sub.slug
                }))
        }));

        return NextResponse.json({ success: true, count: data.length, data });
    } catch (error) {
        console.error("AI Gateway Categories GET Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    const auth = authenticateAiGateway(request);
    if (!auth.authenticated) return auth.response;

    try {
        const body = await request.json();
        let { name, slug } = body;

        if (!name) {
            return NextResponse.json({ success: false, error: "name is required." }, { status: 400 });
        }

        if (!slug) slug = slugify(name);

        const existing = await Category.findOne({ slug });
        let result;

        if (existing) {
            result = await Category.findByIdAndUpdate(existing._id, { name, slug });
            return NextResponse.json({ success: true, message: `Updated category '${name}'`, data: result });
        } else {
            result = await Category.create({ name, slug });
            return NextResponse.json({ success: true, message: `Created category '${name}'`, data: result }, { status: 201 });
        }
    } catch (error) {
        console.error("AI Gateway Categories POST Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
