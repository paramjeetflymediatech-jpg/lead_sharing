// import Stripe from "stripe";
// import { NextResponse } from "next/server";
// import { TradespersonProfile } from "@/models/TradespersonProfile";

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// export const PLANS = {
//   starter: {
//     name: "Starter Pack",
//     amount: 499,
//     credits: 10,
//     description: "Perfect for getting started"
//   },
//   pro: {
//     name: "Professional Pack",
//     amount: 999,
//     credits: 25,
//     description: "For growing businesses"
//   },
//   business: {
//     name: "Business Pack",
//     amount: 1999,
//     credits: 60,
//     description: "Maximum value for busy professionals"
//   },
// };

// export async function POST(req) {
//   try {
//     // Get user info from headers (set by middleware)
//     const userId = req.headers.get("x-user-id");
//     const userRole = req.headers.get("x-user-role");

//     if (!userId || !userRole) {
//       return NextResponse.json({ 
//         error: "Unauthorized - No user information" 
//       }, { status: 401 });
//     }

//     // Check if user is a tradesperson
//     if (userRole !== "TRADESPERSON") {
//       return NextResponse.json({ 
//         error: "Only tradespersons can purchase credits" 
//       }, { status: 403 });
//     }

//     const { plan } = await req.json();

//     if (!PLANS[plan]) {
//       return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
//     }

//     const selectedPlan = PLANS[plan];

//     // Get tradesperson profile
//     const profile = await TradespersonProfile.findOne({ user: userId });

//     if (!profile) {
//       return NextResponse.json({ error: "Profile not found" }, { status: 404 });
//     }

//     // Create Stripe Checkout Session
//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ["card"],
//       mode: "payment",
//       line_items: [
//         {
//           price_data: {
//             currency: "inr",
//             product_data: {
//               name: selectedPlan.name,
//               description: `${selectedPlan.credits} Credits`,
//               metadata: {
//                 planType: plan
//               }
//             },
//             unit_amount: selectedPlan.amount * 100, // Convert to paise
//           },
//           quantity: 1,
//         },
//       ],
//       metadata: {
//         tradespersonId: profile._id,
//         userId: userId,
//         credits: selectedPlan.credits,
//         plan: plan,
//       },
//       success_url: `${process.env.NEXT_PUBLIC_APP_URL}/tradesperson?payment=success&session_id={CHECKOUT_SESSION_ID}`,
//       cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/tradesperson/credits?payment=cancelled`,
//     });

//     return NextResponse.json({ 
//       url: session.url,
//       sessionId: session.id 
//     });
//   } catch (error) {
//     console.error("Stripe session creation error:", error);
//     return NextResponse.json({ 
//       error: "Internal server error",
//       message: error.message 
//     }, { status: 500 });
//   }
// }










// import Stripe from "stripe";
// import { NextResponse } from "next/server";
// import { TradespersonProfile } from "@/models/TradespersonProfile";

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// export const PLANS = {
//   starter: {
//     name: "Starter Pack",
//     amount: 9.99, // £9.99
//     credits: 10,
//     description: "Perfect for getting started"
//   },
//   pro: {
//     name: "Professional Pack",
//     amount: 19.99, // £19.99
//     credits: 25,
//     description: "For growing businesses"
//   },
//   business: {
//     name: "Business Pack",
//     amount: 39.99, // £39.99
//     credits: 60,
//     description: "Maximum value for busy professionals"
//   },
// };

// export async function POST(req) {
//   try {
//     // Get user info from headers (set by middleware)
//     const userId = req.headers.get("x-user-id");
//     const userRole = req.headers.get("x-user-role");

//     if (!userId || !userRole) {
//       return NextResponse.json({ 
//         error: "Unauthorized - No user information" 
//       }, { status: 401 });
//     }

//     // Check if user is a tradesperson
//     if (userRole !== "TRADESPERSON") {
//       return NextResponse.json({ 
//         error: "Only tradespersons can purchase credits" 
//       }, { status: 403 });
//     }

//     const { plan } = await req.json();

//     if (!PLANS[plan]) {
//       return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
//     }

//     const selectedPlan = PLANS[plan];

//     // Get tradesperson profile
//     const profile = await TradespersonProfile.findOne({ user: userId });

//     if (!profile) {
//       return NextResponse.json({ error: "Profile not found" }, { status: 404 });
//     }

//     // Create Stripe Checkout Session
//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ["card"],
//       mode: "payment",
//       line_items: [
//         {
//           price_data: {
//             currency: "gbp", // Changed from "inr" to "gbp"
//             product_data: {
//               name: selectedPlan.name,
//               description: `${selectedPlan.credits} Credits`,
//               metadata: {
//                 planType: plan
//               }
//             },
//             unit_amount: Math.round(selectedPlan.amount * 100), // Convert to pence
//           },
//           quantity: 1,
//         },
//       ],
//       metadata: {
//         tradespersonId: profile._id,
//         userId: userId,
//         credits: selectedPlan.credits,
//         plan: plan,
//       },
//       success_url: `${process.env.NEXT_PUBLIC_APP_URL}/tradesperson?payment=success&session_id={CHECKOUT_SESSION_ID}`,
//       cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/tradesperson/credits?payment=cancelled`,
//     });

//     return NextResponse.json({ 
//       url: session.url,
//       sessionId: session.id 
//     });
//   } catch (error) {
//     console.error("Stripe session creation error:", error);
//     return NextResponse.json({ 
//       error: "Internal server error",
//       message: error.message 
//     }, { status: 500 });
//   }
// }















// import Stripe from "stripe";
// import { NextResponse } from "next/server";
// import { TradespersonProfile } from "@/models/TradespersonProfile";
// import { Payment } from "@/models/Payment";

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// export const PLANS = {
//   starter: {
//     name: "Starter Pack",
//     amount: 9.99,
//     credits: 10,
//   },
//   pro: {
//     name: "Professional Pack",
//     amount: 19.99,
//     credits: 25,
//   },
//   business: {
//     name: "Business Pack",
//     amount: 39.99,
//     credits: 60,
//   },
// };

// export async function POST(req) {
//   try {
//     const userId = req.headers.get("x-user-id");
//     const userRole = req.headers.get("x-user-role");

//     if (!userId || userRole !== "TRADESPERSON") {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const { plan } = await req.json();
//     if (!PLANS[plan]) {
//       return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
//     }

//     const selectedPlan = PLANS[plan];

//     const profile = await TradespersonProfile.findOne({ user: userId });
//     if (!profile) {
//       return NextResponse.json({ error: "Profile not found" }, { status: 404 });
//     }

//     // 🔹 Create Stripe Checkout Session
//     const session = await stripe.checkout.sessions.create({
//       mode: "payment",
//       payment_method_types: ["card"],
//       line_items: [
//         {
//           price_data: {
//             currency: "gbp",
//             product_data: {
//               name: selectedPlan.name,
//             },
//             unit_amount: Math.round(selectedPlan.amount * 100),
//           },
//           quantity: 1,
//         },
//       ],
//       metadata: {
//         tradespersonId: profile._id.toString(),
//         userId,
//         credits: selectedPlan.credits.toString(),
//         plan,
//       },
//       success_url: `${process.env.NEXT_PUBLIC_APP_URL}/tradesperson?payment=success&session_id={CHECKOUT_SESSION_ID}`,
//       cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/tradesperson?payment=cancel`,
//     });

//     // 🔥🔥 MOST IMPORTANT PART 🔥🔥
//     // 👉 Payment table mein PENDING entry create karo
//     await Payment.create({
//       tradespersonId: profile._id,
//       userId,
//       stripeSessionId: session.id,
//       plan,
//       amount: selectedPlan.amount,
//       currency: "GBP",
//       credits: selectedPlan.credits,
//       status: "pending",
//     });

//     return NextResponse.json({
//       url: session.url,
//       sessionId: session.id,
//     });
//   } catch (err) {
//     console.error("Topup error:", err);
//     return NextResponse.json({ error: "Server error" }, { status: 500 });
//   }
// }


















// import Stripe from "stripe";
// import { NextResponse } from "next/server";
// import { TradespersonProfile } from "@/models/TradespersonProfile";
// import { Payment } from "@/models/Payment";

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// export const PLANS = {
//   starter: { name: "Starter Pack", amount: 9.99, credits: 10 },
//   pro: { name: "Professional Pack", amount: 19.99, credits: 25 },
//   business: { name: "Business Pack", amount: 39.99, credits: 60 },
// };

// export async function POST(req) {
//   try {
//     const userId = req.headers.get("x-user-id");
//     const userRole = req.headers.get("x-user-role");

//     if (!userId || userRole !== "TRADESPERSON") {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const { plan } = await req.json();
//     if (!PLANS[plan]) {
//       return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
//     }

//     const selectedPlan = PLANS[plan];

//     // ✅ 1. Find tradesperson profile
//     const profile = await TradespersonProfile.findOne({ user: userId });
//     if (!profile) {
//       return NextResponse.json({ error: "Profile not found" }, { status: 404 });
//     }

//     // ✅ 2. Stripe Checkout
//     const session = await stripe.checkout.sessions.create({
//       mode: "payment",
//       payment_method_types: ["card"],
//       line_items: [
//         {
//           price_data: {
//             currency: "gbp",
//             product_data: {
//               name: selectedPlan.name,
//             },
//             unit_amount: Math.round(selectedPlan.amount * 100),
//           },
//           quantity: 1,
//         },
//       ],
//       metadata: {
//         tradespersonId: profile._id, // string ok for Stripe
//         userId: userId.toString(),
//         credits: selectedPlan.credits.toString(),
//         plan,
//       },
//       success_url: `${process.env.NEXT_PUBLIC_APP_URL}/tradesperson?payment=success&session_id={CHECKOUT_SESSION_ID}`,
//       cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/tradesperson?payment=cancel`,
//     });

//     // ✅ 3. CREATE PENDING PAYMENT (🔥 FIX HERE)
//     await Payment.create({
//       tradespersonId: profile.id, // ✅ NUMBER (IMPORTANT)
//       userId: Number(userId),
//       stripeSessionId: session.id,
//       plan,
//       amount: selectedPlan.amount,
//       currency: "GBP",
//       credits: selectedPlan.credits,
//       status: "pending",
//     });

//     return NextResponse.json({
//       url: session.url,
//       sessionId: session.id,
//     });
//   } catch (err) {
//     console.error("Topup error:", err);
//     return NextResponse.json({ error: "Server error" }, { status: 500 });
//   }
// }









import Stripe from "stripe";
import { NextResponse } from "next/server";
import { TradespersonProfile } from "@/models/TradespersonProfile";
import { Payment } from "@/models/Payment";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const PLANS = {
  starter: { name: "Starter Pack", amount: 9.99, credits: 10 },
  pro: { name: "Pro Pack", amount: 19.99, credits: 25 },
  business: { name: "Business Pack", amount: 39.99, credits: 60 },
};

export async function POST(req) {
  try {
    const userId = req.headers.get("x-user-id");
    const role = req.headers.get("x-user-role");

    if (!userId || role !== "TRADESPERSON") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { plan } = await req.json();
    if (!PLANS[plan]) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    // ✅ Find tradesperson profile USING USER ID
    const profile = await TradespersonProfile.findOne({ user: userId });
    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const selectedPlan = PLANS[plan];

    // ✅ Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: { name: selectedPlan.name },
            unit_amount: Math.round(selectedPlan.amount * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        tradespersonId: profile.id.toString(), // ⭐ MYSQL ID
        userId: userId.toString(),
        credits: selectedPlan.credits.toString(),
        plan,
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/tradesperson?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/tradesperson?payment=cancel`,
    });

    // ✅ CREATE PENDING PAYMENT
    await Payment.create({
      tradespersonId: profile.id, // ⭐ NUMBER
      userId: Number(userId),
      stripeSessionId: session.id,
      plan,
      amount: selectedPlan.amount,
      currency: "GBP",
      credits: selectedPlan.credits,
      status: "pending",
    });

    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
    });
  } catch (err) {
    console.error("Topup error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
