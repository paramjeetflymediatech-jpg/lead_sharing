
import { NextResponse } from "next/server";
// import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { TradespersonProfile } from "@/models/TradespersonProfile";
import "@/models/User";

export async function GET(req) {
  try {
    // await connectToDatabase();

    // 🔐 Middleware se aaya data
    const userId = req.headers.get("x-user-id");
    const role = req.headers.get("x-user-role");

    if (!userId) {
      return NextResponse.json(
        { success: true, user: null, message: "Guest session" },
        { status: 200 }
      );
    }

    // 👤 User
    const userRaw = await User.findById(userId);

    if (!userRaw) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Clean user object
    const user = { ...userRaw };
    delete user.password;
    if (typeof user.lean === "function") delete user.lean;

    let tradespersonProfile = null;
    let purchasedPlanKeys = [];

    // 🛠️ Extra data for tradesperson
    if (role === "TRADESPERSON") {
      tradespersonProfile = await TradespersonProfile.findOne({
        user: userId,
      });

      if (tradespersonProfile) {
        const { Payment } = await import("@/models/Payment");
        const payments = await Payment.findByTradespersonId(tradespersonProfile.id, 50);
        const completedPayments = payments.filter(p => p.status === 'completed');
        purchasedPlanKeys = [...new Set(completedPayments.map(p => p.plan))];

        // Add to user object for easy consumption by mobile app RootNavigator
        user.verificationStatus = tradespersonProfile.verification_status || tradespersonProfile.verificationStatus;
              }
            }

            user.phoneVerified = !!userRaw.phone_verified;

            // Add mobile-compatible fields for deletion status
            user.accountStatus = userRaw.is_deletion_pending ? 'PENDING_DELETION' : 'ACTIVE';
            user.deleteRequestPending = !!userRaw.is_deletion_pending;
            user.deletionRequestedAt = userRaw.deletion_requested_at;

            return NextResponse.json({
              success: true,
              user,
              tradespersonProfile,
              purchasedPlanKeys,
            });
  } catch (error) {
    console.error("GET ME error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { firstName, lastName, phone, address, profileImage, currentPassword, newPassword } = body;

    const updates = {};
    if (firstName && lastName) {
      updates.name = `${firstName} ${lastName}`;
    } else if (firstName) {
      updates.name = firstName;
    }

    if (phone !== undefined) updates.phone = phone;
    if (profileImage !== undefined) updates.profile_image = profileImage;
    // Address handling
    if (address) {
      if (address.city !== undefined) updates.city = address.city;
      if (address.postcode !== undefined) updates.postcode = address.postcode;
      if (address.line1 !== undefined) updates.address_line1 = address.line1;
    }

    // Password change
    if (newPassword) {
      // In a real app, verify currentPassword first
      // const user = await User.findById(userId);
      // const isValid = await bcrypt.compare(currentPassword, user.password);
      // if (!isValid) throw new Error("Invalid current password");

      const bcrypt = require('bcryptjs'); // Require locally to ensure it exists
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      updates.password = hashedPassword;
    }

    if (Object.keys(updates).length > 0) {
      await User.findByIdAndUpdate(userId, updates);
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully"
    });
  } catch (error) {
    console.error("UPDATE ME error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
