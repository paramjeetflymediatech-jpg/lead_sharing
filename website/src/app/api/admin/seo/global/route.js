import { NextResponse } from 'next/server';
import { Seo } from '@/models/Seo';

export async function GET() {
    try {
        let globalSeo = await Seo.findOne({ pageName: 'global' });
        
        if (!globalSeo) {
            // Return empty structure if not found
            return NextResponse.json({
                pageName: 'global',
                title: 'Global Schema',
                schemaMarkup: '',
                isNew: true
            });
        }
        
        return NextResponse.json(globalSeo);
    } catch (error) {
        console.error('Error fetching global SEO:', error);
        return NextResponse.json({ error: 'Failed to fetch global SEO' }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const body = await req.json();
        const { schemaMarkup, headerScripts, footerScripts } = body;

        let globalSeo = await Seo.findOne({ pageName: 'global' });

        if (globalSeo) {
            // Update existing
            const updated = await Seo.findByIdAndUpdate(globalSeo._id, {
                schemaMarkup,
                headerScripts,
                footerScripts,
                title: 'Global Schema', // Keep it consistent
                updatedAt: new Date()
            }, { new: true });
            return NextResponse.json(updated);
        } else {
            // Create new
            const newSeo = await Seo.create({
                pageName: 'global',
                title: 'Global Schema',
                metaDescription: 'Site-wide global settings and scripts',
                schemaMarkup,
                headerScripts,
                footerScripts,
                metaRobots: 'noindex, nofollow' // It's a virtual page
            });
            return NextResponse.json(newSeo, { status: 201 });
        }
    } catch (error) {
        console.error('Error updating global SEO:', error);
        return NextResponse.json({ error: 'Failed to update global SEO' }, { status: 500 });
    }
}
