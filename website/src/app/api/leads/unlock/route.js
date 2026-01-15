import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getCurrentUser } from '@/lib/serverAuth';
import { TradespersonProfile } from '@/models/TradespersonProfile';
import { Job } from '@/models/Job';
import { Lead } from '@/models/Lead';

const LEAD_COST_CREDITS = 1;

export async function POST(req) {
  await connectToDatabase();

  const user = await getCurrentUser();
  if (!user || user.role !== 'TRADESPERSON') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { jobId, message, priceEstimate } = body;

  if (!jobId || !message) {
    return NextResponse.json({ message: 'Missing jobId or message' }, { status: 400 });
  }

  const job = await Job.findById(jobId);
  if (!job || job.status !== 'OPEN') {
    return NextResponse.json({ message: 'Job not available' }, { status: 400 });
  }

  const profile = await TradespersonProfile.findOne({ user: user.id });
  if (!profile) {
    return NextResponse.json({ message: 'Tradesperson profile not found' }, { status: 400 });
  }

  if (profile.credits < LEAD_COST_CREDITS) {
    return NextResponse.json({ message: 'Not enough credits' }, { status: 400 });
  }

  profile.credits -= LEAD_COST_CREDITS;
  await profile.save();

  const lead = await Lead.create({
    job: jobId,
    tradesperson: profile._id,
    message,
    priceEstimate,
    isUnlocked: true,
  });

  return NextResponse.json(lead, { status: 201 });
}
