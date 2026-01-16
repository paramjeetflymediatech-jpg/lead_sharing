// import { NextResponse } from 'next/server';
// import { connectToDatabase } from '@/lib/mongodb';
// import { Job } from '@/models/Job';
// import { Category } from '@/models/Category';
// import { getCurrentUser } from '@/lib/serverAuth';

// // POST /api/jobs – create job (HOMEOWNER)
// export async function POST(req) {
//   await connectToDatabase();

//   const user = await getCurrentUser();
//   if (!user || user.role !== 'HOMEOWNER') {
//     return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
//   }

//   const body = await req.json();
//   const { title, description, location, categoryId, categoryName, budgetMin, budgetMax } = body;

//   if (!title || !description || !location || (!categoryId && !categoryName)) {
//     return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
//   }

//   let category;
//   if (categoryId) {
//     category = await Category.findById(categoryId);
//     if (!category) {
//       return NextResponse.json({ message: 'Invalid category' }, { status: 400 });
//     }
//   } else {
//     const name = categoryName.trim();
//     const slug = name.toLowerCase().replace(/\s+/g, '-');
//     category = await Category.findOneAndUpdate(
//       { slug },
//       { name, slug },
//       { upsert: true, new: true, setDefaultsOnInsert: true }
//     );
//   }

//   const job = await Job.create({
//     homeowner: user.id,
//     category: category._id,
//     title,
//     description,
//     location,
//     budgetMin,
//     budgetMax,
//   });

//   return NextResponse.json(job, { status: 201 });
// }

// // GET /api/jobs – list open jobs (for TRADESPERSON) with filters
// export async function GET(req) {
//   await connectToDatabase();

//   const { searchParams } = new URL(req.url);
//   const categoryId = searchParams.get('categoryId');
//   const location = searchParams.get('location');

//   const query = { status: 'OPEN' };
//   if (categoryId) query.category = categoryId;
//   if (location) query.location = { $regex: location, $options: 'i' };

//   const jobs = await Job.find(query).sort({ createdAt: -1 }).limit(50).lean();

//   return NextResponse.json(jobs, { status: 200 });
// }




import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Job } from '@/models/Job';
import { Category } from '@/models/Category';
import { getCurrentUser } from '@/lib/serverAuth';
import { pusherServer } from "@/lib/pusher"; // 1. Import Pusher

export async function POST(req) {
  await connectToDatabase();

  const user = await getCurrentUser();
  if (!user || user.role !== 'HOMEOWNER') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { title, description, location, categoryId, categoryName, budgetMin, budgetMax } = body;

  if (!title || !description || !location || (!categoryId && !categoryName)) {
    return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
  }

  let category;
  if (categoryId) {
    category = await Category.findById(categoryId);
    if (!category) {
      return NextResponse.json({ message: 'Invalid category' }, { status: 400 });
    }
  } else {
    const name = categoryName.trim();
    const slug = name.toLowerCase().replace(/\s+/g, '-');
    category = await Category.findOneAndUpdate(
      { slug },
      { name, slug },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  const job = await Job.create({
    homeowner: user.id,
    category: category._id,
    title,
    description,
    location,
    budgetMin,
    budgetMax,
  });

  // 2. Trigger Real-Time Notification
  // We use 'trades-channel' and the event 'new-job'
  try {
    await pusherServer.trigger("trades-channel", "new-job", {
      id: job._id.toString(),
      title: job.title,
      location: job.location,
      category: category.name,
      budgetMax: job.budgetMax
    });
  } catch (pusherError) {
    console.error("Pusher trigger failed:", pusherError);
    // We don't return error here because the job WAS saved to DB successfully
  }

  return NextResponse.json(job, { status: 201 });
}

export async function GET(req) {
  await connectToDatabase();

  const { searchParams } = new URL(req.url);
  const categoryId = searchParams.get('categoryId');
  const location = searchParams.get('location');

  const query = { status: 'OPEN' };
  if (categoryId) query.category = categoryId;
  if (location) query.location = { $regex: location, $options: 'i' };

  const jobs = await Job.find(query).sort({ createdAt: -1 }).limit(50).lean();

  return NextResponse.json(jobs, { status: 200 });
}