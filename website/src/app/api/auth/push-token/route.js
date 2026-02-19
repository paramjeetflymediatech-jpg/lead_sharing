import { NextResponse } from 'next/server';
import { User } from '@/models/User';

export async function POST(req) {
    try {
        const userId = req.headers.get('x-user-id');
        const role = req.headers.get('x-user-role');

        if (!userId) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { token, platform } = body;

        if (!token) {
            return NextResponse.json({ message: 'Token missing' }, { status: 400 });
        }

        await User.savePushToken(userId, token, platform || 'mobile');

        return NextResponse.json({ success: true, message: 'Push token registered' });
    } catch (error) {
        console.error('Push token registration error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
