import { NextResponse } from "next/server";
import Stripe from "stripe";
import pool from "../../../../../config/db.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
    try {
        const userId = req.headers.get("x-user-id");
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        console.log("💳 Payout Setup started for user:", userId);

        // Get tradesperson profile
        const [profiles] = await pool.query(
            "SELECT tp.id, tp.stripe_connect_id, u.email FROM tradesperson_profiles tp JOIN users u ON tp.user_id = u.id WHERE tp.user_id = ?",
            [userId]
        );

        if (profiles.length === 0) {
            console.warn("⚠️ Profile not found for user:", userId);
            return NextResponse.json({ error: "Profile not found" }, { status: 404 });
        }

        const profile = profiles[0];
        let accountId = profile.stripe_connect_id;

        console.log("👤 Profile found:", { profileId: profile.id, existingAccountId: accountId });

        // If no Connect ID, create a new Express account
        if (!accountId) {
            console.log("🆕 Creating new Stripe Express account for:", profile.email);
            const account = await stripe.accounts.create({
                type: "express",
                email: profile.email,
                capabilities: {
                    card_payments: { requested: true },
                    transfers: { requested: true },
                },
                metadata: {
                    userId: userId,
                    profileId: profile.id,
                }
            });
            accountId = account.id;

            console.log("✅ Created Stripe account:", accountId);

            // Save Connect ID to database
            await pool.query(
                "UPDATE tradesperson_profiles SET stripe_connect_id = ? WHERE id = ?",
                [accountId, profile.id]
            );
            console.log("💾 Saved Connect ID to DB");
        }

        // Create Account Link for onboarding
        console.log("🔗 Creating Stripe Account Link for:", accountId);
        const accountLink = await stripe.accountLinks.create({
            account: accountId,
            refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/tradesperson/onboarding?step=bank&refresh=true`,
            return_url: `${process.env.NEXT_PUBLIC_APP_URL}/tradesperson/onboarding?step=bank&complete=true`,
            type: "account_onboarding",
        });

        console.log("🚀 Account Link created:", accountLink.url);

        return NextResponse.json({
            success: true,
            url: accountLink.url
        });

    } catch (error) {
        console.error("❌ Stripe Payout Setup Error:", error);

        if (error.message.includes("signed up for Connect")) {
            return NextResponse.json({
                error: "Stripe Connect is not enabled on your account. Please enable it in your Stripe Dashboard (Settings > Connect).",
                details: error.message
            }, { status: 400 });
        }

        return NextResponse.json({
            error: "Internal server error",
            details: error.message
        }, { status: 500 });
    }
}
