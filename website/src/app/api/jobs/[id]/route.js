// import { NextResponse } from "next/server";
// import { connectToDatabase } from "@/lib/mongodb";
// import Job from "@/models/Job";

// export async function GET(req, { params }) {
//   try {
//     await connectToDatabase();
//     const { id } = params;

//     const job = await Job.findById(id)
//       .populate("category", "name")
//       .populate("subCategory", "name")
//       .select("-contactEmail -contactPhone -contactName"); // 🔒 hide

//     if (!job) {
//       return NextResponse.json({ message: "Job not found" }, { status: 404 });
//     }

//     return NextResponse.json(job);
//   } catch (err) {
//     return NextResponse.json({ message: "Invalid job id" }, { status: 400 });
//   }
// }













import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Job from "@/models/Job";
import { Lead } from "@/models/Lead";
import { TradespersonProfile } from "@/models/TradespersonProfile";

export async function GET(req, { params }) {
  try {
    await connectToDatabase();
    const { id } = params;

    const userId = req.headers.get("x-user-id");
    const role = req.headers.get("x-user-role");

    const job = await Job.findById(id)
      .populate("category", "name slug")
      .populate("subCategory", "name slug")
      .populate("homeowner", "name")
      .lean();

    if (!job) {
      return NextResponse.json({ message: "Job not found" }, { status: 404 });
    }

    // Check if this tradesperson has unlocked this job
    let hasUnlocked = false;
    let contactInfo = null;

    if (userId && role === "TRADESPERSON") {
      const profile = await TradespersonProfile.findOne({ user: userId });
      if (profile) {
        const lead = await Lead.findOne({
          job: id,
          tradesperson: profile._id,
          isUnlocked: true,
        });

        if (lead) {
          hasUnlocked = true;
          contactInfo = {
            name: job.contactName,
            email: job.contactEmail,
            phone: job.contactPhone,
          };
        }
      }
    }

    // For homeowners, show contact info if it's their job
    if (role === "HOMEOWNER" && job.homeowner.toString() === userId) {
      hasUnlocked = true;
      contactInfo = {
        name: job.contactName,
        email: job.contactEmail,
        phone: job.contactPhone,
      };
    }

    // Get lead count
    const leadCount = await Lead.countDocuments({
      job: id,
      isUnlocked: true,
    });

    // Return complete job details
    const response = {
      _id: job._id,
      category: job.category,
      subCategory: job.subCategory,
      description: job.description,
      location: job.location,
      startTime: job.startTime,
      jobStage: job.jobStage,
      ownership: job.ownership,
      budgetMin: job.budgetMin,
      budgetMax: job.budgetMax,
      media: job.media,
      status: job.status,
      createdAt: job.createdAt,
      homeowner: {
        name: job.homeowner?.name || "Homeowner",
      },
      leadCount: leadCount,
      maxLeads: 3,
    };

    // Add contact info if unlocked
    if (hasUnlocked && contactInfo) {
      response.contact = contactInfo;
      response.isUnlocked = true;
    }

    return NextResponse.json(response);
  } catch (err) {
    console.error("JOB DETAIL ERROR:", err);
    return NextResponse.json(
      { message: "Invalid job id or server error" },
      { status: 400 }
    );
  }
}