import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getUsers } from "@/lib/users";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2026-04-22.dahlia",
});

export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID required" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return NextResponse.json({ error: "Payment not completed" }, { status: 400 });
    }

    const email = session.metadata?.email;
    const credits = parseInt(session.metadata?.credits || "0", 10);

    if (email) {
      const users = await getUsers();
      const user = users[email];
      return NextResponse.json({
        success: true,
        email,
        credits,
        currentCredits: user?.credits || 0,
        plan: session.metadata?.planId,
      });
    }

    return NextResponse.json({ success: true, credits });
  } catch (err) {
    console.error("Verify session error:", err);
    return NextResponse.json({ error: "Failed to verify session" }, { status: 500 });
  }
}