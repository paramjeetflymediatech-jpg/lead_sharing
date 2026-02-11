// // src/app/api/webhooks/stripe/route.js
// import Stripe from "stripe";
// import { NextResponse } from "next/server";
// import { TradespersonProfile } from "@/models/TradespersonProfile";

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// export async function POST(req) {
//   console.log("=== STRIPE WEBHOOK RECEIVED ===");

//   const body = await req.text();
//   const signature = req.headers.get("stripe-signature");

//   console.log("Webhook signature:", signature ? "Present" : "Missing");
//   console.log("Body received:", body.length, "characters");

//   let event;
//   try {
//     event = stripe.webhooks.constructEvent(
//       body,
//       signature,
//       process.env.STRIPE_WEBHOOK_SECRET
//     );
//     console.log("✅ Webhook verified successfully");
//   } catch (err) {
//     console.error("❌ Webhook verification failed:", err.message);
//     return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
//   }

//   console.log("📦 Event type:", event.type);

//   if (event.type === "checkout.session.completed") {
//     const session = event.data.object;

//     console.log("✅ Checkout session completed!");
//     console.log("💰 Session ID:", session.id);
//     console.log("💳 Payment status:", session.payment_status);
//     console.log("📝 Metadata:", session.metadata);
//     console.log("👤 Customer email:", session.customer_details?.email);

//     try {
//       const tradespersonId = session.metadata?.tradespersonId;
//       const credits = parseInt(session.metadata?.credits || "0");

//       console.log("🔍 Parsed metadata:");
//       console.log("   Tradesperson ID:", tradespersonId);
//       console.log("   Credits to add:", credits);

//       if (!tradespersonId || credits <= 0) {
//         console.error("❌ Invalid metadata - missing tradespersonId or credits");
//         return NextResponse.json({ 
//           received: true, 
//           warning: "Invalid metadata" 
//         });
//       }

//       console.log("🔍 Looking for profile with ID:", tradespersonId);

//       // Check if profile exists
//       const existingProfile = await TradespersonProfile.findOne({ _id: tradespersonId });

//       if (!existingProfile) {
//         console.error("❌ Profile not found for ID:", tradespersonId);
//       } else {
//         console.log("✅ Profile found!");
//         console.log("   Current credits:", existingProfile.credits);
//         console.log("   Adding:", credits, "credits");
//       }

//       // Update credits using $inc operator
//       const updatedProfile = await TradespersonProfile.findOneAndUpdate(
//         { _id: tradespersonId },
//         { $inc: { credits: credits } },
//         { new: true }
//       );

//       if (!updatedProfile) {
//         console.error("❌ Failed to update profile");
//       } else {
//         console.log("🎉 CREDITS UPDATED SUCCESSFULLY!");
//         console.log("   Profile ID:", tradespersonId);
//         console.log("   Credits added:", credits);
//         console.log("   Previous credits:", existingProfile?.credits || 0);
//         console.log("   New total:", updatedProfile.credits);
//         console.log("   Update successful:", updatedProfile ? "Yes" : "No");
//       }

//     } catch (error) {
//       console.error("❌ Error updating credits:", error.message);
//       console.error("Stack trace:", error.stack);
//     }
//   } else {
//     console.log("📨 Other event type:", event.type);
//   }

//   console.log("=== WEBHOOK PROCESSING COMPLETE ===");
//   return NextResponse.json({ received: true });
// }

// export const dynamic = 'force-dynamic';








// import Stripe from "stripe";
// import { NextResponse } from "next/server";
// import { TradespersonProfile } from "@/models/TradespersonProfile";
// import { Payment } from "@/models/Payment";

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// export async function POST(req) {
//   const body = await req.text();
//   const signature = req.headers.get("stripe-signature");

//   let event;
//   try {
//     event = stripe.webhooks.constructEvent(
//       body,
//       signature,
//       process.env.STRIPE_WEBHOOK_SECRET
//     );
//   } catch (err) {
//     console.error("Webhook error:", err.message);
//     return new NextResponse("Webhook Error", { status: 400 });
//   }

//   // ✅ Only handle successful checkout
//   if (event.type === "checkout.session.completed") {
//     const session = event.data.object;

//     const credits = parseInt(session.metadata?.credits || "0");
//     const tradespersonId = session.metadata?.tradespersonId;

//     if (!credits || !tradespersonId) {
//       return NextResponse.json({ received: true });
//     }

//     // 🔐 Idempotency check
//     const payment = await Payment.findBySessionId(session.id);

//     if (!payment || payment.status === "completed") {
//       return NextResponse.json({ received: true });
//     }

//     // ✅ Mark payment completed
//     await Payment.updateStatus(
//       session.id,
//       "completed",
//       session.payment_intent
//     );

//     // ➕ Add credits
//     await TradespersonProfile.findOneAndUpdate(
//       { _id: tradespersonId },
//       { $inc: { credits } }
//     );
//   }

//   return NextResponse.json({ received: true });
// }

// export const dynamic = "force-dynamic";




import Stripe from "stripe";
import { NextResponse } from "next/server";
import { TradespersonProfile } from "@/models/TradespersonProfile";
import { Payment } from "@/models/Payment";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook error:", err.message);
    return new NextResponse("Webhook Error", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    const tradespersonId = Number(session.metadata?.tradespersonId);
    const credits = Number(session.metadata?.credits);

    if (!tradespersonId || !credits) {
      return NextResponse.json({ received: true });
    }

    // 🔐 Idempotency
    const payment = await Payment.findBySessionId(session.id);
    if (!payment || payment.status === "completed") {
      return NextResponse.json({ received: true });
    }

    // ✅ Update payment
    await Payment.updateStatus(
      session.id,
      "completed",
      session.payment_intent
    );

    // ✅ Add credits
    await TradespersonProfile.findOneAndUpdate(
      { id: tradespersonId },
      { $inc: { credits } }
    );
  }

  return NextResponse.json({ received: true });
}

export const dynamic = "force-dynamic";
