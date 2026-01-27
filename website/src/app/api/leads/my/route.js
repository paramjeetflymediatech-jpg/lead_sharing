import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/models/User';
import { TradespersonProfile } from '@/models/TradespersonProfile';
import { Lead } from '@/models/Lead';

export async function POST(req) {
  await connectToDatabase();

  const { userId } = await req.json();

  const user = await User.findById(userId);
  if (!user || user.role !== 'TRADESPERSON') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const profile = await TradespersonProfile.findOne({ user: userId });

  const leads = await Lead.find({ tradesperson: profile._id })
    .populate('job')
    .sort({ createdAt: -1 });

  return NextResponse.json(leads);
}
