import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/models/User';
import { TradespersonProfile } from '@/models/TradespersonProfile';
import { Job } from '@/models/Job';
import { Lead } from '@/models/Lead';

const LEAD_COST = 1;

export async function POST(req) {
  await connectToDatabase();

  const { userId, jobId, message, priceEstimate } = await req.json();

  if (!userId || !jobId || !message) {
    return NextResponse.json(
      { message: 'userId, jobId, message required' },
      { status: 400 }
    );
  }

  // 1️⃣ check user
  const user = await User.findById(userId);
  if (!user || user.role !== 'TRADESPERSON') {
    return NextResponse.json(
      { message: 'Only tradesperson allowed' },
      { status: 403 }
    );
  }

  // 2️⃣ job check
  const job = await Job.findById(jobId);
  if (!job || job.status !== 'OPEN') {
    return NextResponse.json(
      { message: 'Job not available' },
      { status: 400 }
    );
  }

  // 3️⃣ profile
  const profile = await TradespersonProfile.findOne({ user: userId });
  if (!profile) {
    return NextResponse.json(
      { message: 'Tradesperson profile missing' },
      { status: 400 }
    );
  }

  // 4️⃣ duplicate lead
  const already = await Lead.findOne({
    job: jobId,
    tradesperson: profile._id,
  });

  if (already) {
    return NextResponse.json(
      { message: 'Lead already purchased' },
      { status: 400 }
    );
  }

  // 5️⃣ credit check
  if (profile.credits < LEAD_COST) {
    return NextResponse.json(
      { message: 'Not enough credits' },
      { status: 400 }
    );
  }

  profile.credits -= LEAD_COST;
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
