import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/models/User';
import { Job } from '@/models/Job';
import { Lead } from '@/models/Lead';

export async function POST(req, { params }) {
  await connectToDatabase();

  const { userId } = await req.json();

  const user = await User.findById(userId);
  if (!user || user.role !== 'HOMEOWNER') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const job = await Job.findById(params.id);
  if (!job || job.user.toString() !== userId) {
    return NextResponse.json({ message: 'Not your job' }, { status: 403 });
  }

  const leads = await Lead.find({ job: job._id })
    .populate('tradesperson')
    .sort({ createdAt: -1 });

  return NextResponse.json(leads);
}
