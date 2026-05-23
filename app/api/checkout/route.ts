import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getUsers } from "@/lib/users";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2026-04-22.dahlia" as any,
});

const PRICE_IDS: Record<string, string> = {
  price_pro_100: process.env.STRIPE_PRICE_PRO_100 || "price_pro_100",
  price_enterprise_500: process.env.STRIPE_PRICE_ENTERPRISE_500 || "price_enterprise_500",
};

const PLAN_CREDITS: Record<string, number> = {
  price_pro_100: 100,
  price_enterprise_500: 500,
};

export async function POST(req: NextRequest) {
  try {
    const { planId, email } = await req.json();

    if (!planId || !PRICE_IDS[planId]) {
      return NextResponse.json({ error: "Invalid plan ID" }, { status: 400 });
    }

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const users = await getUsers();
    if (!users[email]) {
      return NextResponse.json({ error: "User not found. Please register first." }, { status: 404 });
    }

    const priceId = PRICE_IDS[planId];
    const credits = PLAN_CREDITS[planId];

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/pricing`,
      customer_email: email,
      metadata: {
        email,
        planId,
        credits: credits.toString(),
      },
      subscription_data: {
        metadata: {
          email,
          planId,
          credits: credits.toString(),
        },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}