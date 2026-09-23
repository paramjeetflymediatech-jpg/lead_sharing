import { NextResponse } from 'next/server';

/**
 * Validates AI Gateway incoming request authentication
 * Supports:
 * - Header 'Authorization: Bearer <token>'
 * - Header 'x-api-key: <token>'
 * - Query parameter '?apiKey=<token>'
 */
export function authenticateAiGateway(request) {
    const configuredKey = process.env.AI_GATEWAY_SECRET_KEY || 'leadsharing_ai_gateway_secret_key_2026';

    const authHeader = request.headers.get('authorization');
    const xApiKey = request.headers.get('x-api-key');
    
    const url = new URL(request.url);
    const queryKey = url.searchParams.get('apiKey');

    let providedToken = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        providedToken = authHeader.substring(7).trim();
    } else if (authHeader) {
        providedToken = authHeader.trim();
    } else if (xApiKey) {
        providedToken = xApiKey.trim();
    } else if (queryKey) {
        providedToken = queryKey.trim();
    }

    if (!providedToken || providedToken !== configuredKey) {
        return {
            authenticated: false,
            response: NextResponse.json(
                {
                    error: 'Unauthorized: Invalid or missing AI Gateway API Key.',
                    hint: 'Provide Authorization: Bearer <API_KEY> or x-api-key header.'
                },
                { status: 401 }
            )
        };
    }

    return { authenticated: true };
}
