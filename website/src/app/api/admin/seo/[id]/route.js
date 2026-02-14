import { NextResponse } from 'next/server';

import { Seo } from '@/models/Seo';

export async function GET(req, { params }) {
    try {
        const { id } = await params;
        const seoPage = await Seo.findById(id);

        if (!seoPage) {
            return NextResponse.json({ error: 'SEO page not found' }, { status: 404 });
        }

        return NextResponse.json(seoPage);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch SEO page' }, { status: 500 });
    }
}

export async function PUT(req, { params }) {
    try {
        const { id } = await params;
        const body = await req.json();

        const updatedSeo = await Seo.findByIdAndUpdate(id, body, { new: true });

        if (!updatedSeo) {
            return NextResponse.json({ error: 'SEO page not found' }, { status: 404 });
        }

        return NextResponse.json(updatedSeo);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update SEO page' }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        const { id } = await params;
        const result = await Seo.findByIdAndDelete(id);

        if (result === false) {
            return NextResponse.json({ error: 'SEO page not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'SEO page deleted successfully' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete SEO page' }, { status: 500 });
    }
}
