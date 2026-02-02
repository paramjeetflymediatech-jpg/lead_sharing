import { NextResponse } from "next/server";
import { User } from "@/models/User";
import Job from "@/models/Job";

export async function GET() {
  try {
    const totalUsers = await User.countDocuments();
    const homeowners = await User.countDocuments({ role: "HOMEOWNER" });
    const tradespersons = await User.countDocuments({ role: "TRADESPERSON" });
    const admins = await User.countDocuments({ role: "ADMIN" });

    const totalJobs = await Job.countDocuments();
    const openJobs = await Job.countDocuments({ status: "OPEN" });

    return NextResponse.json(
      {
        users: {
          total: totalUsers,
          homeowners,
          tradespersons,
          admins,
        },
        jobs: {
          total: totalJobs,
          open: openJobs,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("ADMIN DASHBOARD ERROR:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
