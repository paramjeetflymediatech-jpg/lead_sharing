import { NextResponse } from 'next/server';
import { Location } from '@/models/Location';
import { TRADE_SERVICE_LINKS } from '@/constants/locations';
import { authenticateAiGateway } from '@/lib/ai-gateway-auth';

export async function GET(request) {
    const auth = authenticateAiGateway(request);
    if (!auth.authenticated) return auth.response;

    try {
        let dbLocations = [];
        try {
            dbLocations = await Location.find();
        } catch (e) {
            console.warn("Location.find fallback to TRADE_SERVICE_LINKS:", e.message);
        }

        const fallbackCities = Object.keys(TRADE_SERVICE_LINKS || {}).map(city => ({
            name: city,
            slug: city.toLowerCase().replace(/\s+/g, '-')
        }));

        const combined = [
            ...dbLocations,
            ...fallbackCities.filter(f => !dbLocations.some(d => d.name.toLowerCase() === f.name.toLowerCase()))
        ];

        return NextResponse.json({
            success: true,
            count: combined.length,
            data: combined
        });
    } catch (error) {
        console.error("AI Gateway Locations GET Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
