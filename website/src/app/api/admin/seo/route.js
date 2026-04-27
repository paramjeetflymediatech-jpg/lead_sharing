import { NextResponse } from 'next/server';
import { Seo } from '@/models/Seo';

export async function GET() {
    try {
        const seoPages = await Seo.find({});
        // Filter out global schema if it exists in the list
        const filteredPages = seoPages.filter(page => page.pageName !== 'global');
        return NextResponse.json(filteredPages);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch SEO pages' }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const body = await req.json();
        const { pageName } = body;

        // Check if page already exists
        const existing = await Seo.findOne({ pageName });
        if (existing) {
            return NextResponse.json({ error: 'SEO for this page already exists' }, { status: 400 });
        }

        const newSeo = await Seo.create(body);
        return NextResponse.json(newSeo, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to create SEO page' }, { status: 500 });
    }
}
