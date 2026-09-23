import { NextResponse } from 'next/server';
import { Seo } from '@/models/Seo';
import { authenticateAiGateway } from '@/lib/ai-gateway-auth';

export async function GET(request) {
    const auth = authenticateAiGateway(request);
    if (!auth.authenticated) return auth.response;

    try {
        const url = new URL(request.url);
        const pageName = url.searchParams.get('pageName');

        if (pageName) {
            const seoPage = await Seo.findOne({ pageName });
            if (!seoPage) {
                return NextResponse.json({ success: false, message: `No SEO settings found for '${pageName}'` }, { status: 404 });
            }
            return NextResponse.json({ success: true, data: seoPage });
        }

        const allSeoPages = await Seo.find({});
        return NextResponse.json({ success: true, count: allSeoPages.length, data: allSeoPages });
    } catch (error) {
        console.error("AI Gateway SEO GET Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    const auth = authenticateAiGateway(request);
    if (!auth.authenticated) return auth.response;

    try {
        const body = await request.json();
        const { pageName, title } = body;

        if (!pageName || !title) {
            return NextResponse.json({ success: false, error: "pageName and title are required fields." }, { status: 400 });
        }

        // Check if exists
        const existing = await Seo.findOne({ pageName });
        let result;

        if (existing) {
            result = await Seo.findByIdAndUpdate(existing._id, body);
            return NextResponse.json({
                success: true,
                message: `Updated SEO settings for '${pageName}'`,
                data: result
            });
        } else {
            result = await Seo.create(body);
            return NextResponse.json({
                success: true,
                message: `Created SEO settings for '${pageName}'`,
                data: result
            }, { status: 201 });
        }
    } catch (error) {
        console.error("AI Gateway SEO POST Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(request) {
    const auth = authenticateAiGateway(request);
    if (!auth.authenticated) return auth.response;

    try {
        const url = new URL(request.url);
        const pageName = url.searchParams.get('pageName');

        if (!pageName) {
            return NextResponse.json({ success: false, error: "pageName is required for deletion." }, { status: 400 });
        }

        const existing = await Seo.findOne({ pageName });
        if (!existing) {
            return NextResponse.json({ success: false, message: `SEO page '${pageName}' not found.` }, { status: 404 });
        }

        await Seo.findByIdAndDelete(existing._id);
        return NextResponse.json({ success: true, message: `Successfully deleted SEO settings for '${pageName}'` });
    } catch (error) {
        console.error("AI Gateway SEO DELETE Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
