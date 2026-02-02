import { NextResponse } from 'next/server';

import { Seo } from '@/models/Seo';

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const page = searchParams.get('page');

        if (!page) {
            return NextResponse.json({ error: 'Page parameter is required' }, { status: 400 });
        }

        // await connectToDatabase();

        // Exact match or fallback? 
        // Usually exact match.
        const seoPage = await Seo.findOne({ pageName: page });

        if (!seoPage) {
            return NextResponse.json({ found: false }, { status: 200 });
        }

        return NextResponse.json(seoPage);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch SEO page' }, { status: 500 });
    }
}
