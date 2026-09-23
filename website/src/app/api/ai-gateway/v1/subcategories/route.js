import { NextResponse } from 'next/server';
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
        const url = new URL(request.url);
        const categoryId = url.searchParams.get('category_id');

        const query = {};
        if (categoryId) query.category = categoryId;

        const subcategories = await SubCategory.find(query);
        return NextResponse.json({ success: true, count: subcategories.length, data: subcategories });
    } catch (error) {
        console.error("AI Gateway SubCategories GET Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    const auth = authenticateAiGateway(request);
    if (!auth.authenticated) return auth.response;

    try {
        const body = await request.json();
        let { name, slug, category_id, categoryId } = body;

        const parentCatId = category_id || categoryId;
        if (!name || !parentCatId) {
            return NextResponse.json({ success: false, error: "name and category_id are required." }, { status: 400 });
        }

        if (!slug) slug = slugify(name);

        const existing = await SubCategory.findOne({ slug });
        let result;

        if (existing) {
            result = await SubCategory.findByIdAndUpdate(existing._id, { name, slug, category_id: parentCatId });
            return NextResponse.json({ success: true, message: `Updated subcategory '${name}'`, data: result });
        } else {
            result = await SubCategory.create({ name, slug, category_id: parentCatId });
            return NextResponse.json({ success: true, message: `Created subcategory '${name}'`, data: result }, { status: 201 });
        }
    } catch (error) {
        console.error("AI Gateway SubCategories POST Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
