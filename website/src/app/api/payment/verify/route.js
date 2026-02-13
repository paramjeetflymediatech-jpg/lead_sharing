import Stripe from "stripe";
import { NextResponse } from "next/server";
import { TradespersonProfile } from "@/models/TradespersonProfile";
import { Payment } from "@/models/Payment";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
    try {
        const { sessionId } = await req.json();

        if (!sessionId) {
            return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
        }

        console.log("🔍 Verifying payment session:", sessionId);

        // 1. Retrieve the session from Stripe
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (!session) {
            return NextResponse.json({ error: "Session not found" }, { status: 404 });
        }

        if (session.payment_status !== "paid") {
            return NextResponse.json({ error: "Payment not completed" }, { status: 400 });
        }

        // 2. Check internal payment record
        const payment = await Payment.findBySessionId(sessionId);

        if (!payment) {
            return NextResponse.json({ error: "Payment record not found" }, { status: 404 });
        }

        if (payment.status === "completed") {
            return NextResponse.json({ success: true, message: "Payment already verified", credits: payment.credits });
        }

        // 3. Fulfill the order (Idempotent)
        console.log("✅ Payment verified. Fulfilling order for:", payment.tradespersonId);

        // Update payment status
        await Payment.updateStatus(
            sessionId,
            "completed",
            session.payment_intent
        );

        // Add credits
        const updatedProfile = await TradespersonProfile.findOneAndUpdate(
            { id: payment.tradespersonId },
            { $inc: { credits: payment.credits } },
            { new: true }
        );

        return NextResponse.json({
            success: true,
            credits: payment.credits,
            newBalance: updatedProfile?.credits
        });

    } catch (error) {
        console.error("Payment verification error:", error);
        return NextResponse.json({ error: "Verification failed" }, { status: 500 });
    }
}
