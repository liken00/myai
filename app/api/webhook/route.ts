import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getUsers, saveUsers } from "@/lib/users";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2026-04-22.dahlia" as any,
});

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json({ error: "No signature" }, { status: 400 });
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, WEBHOOK_SECRET);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const email = session.metadata?.email;
        const credits = parseInt(session.metadata?.credits || "0", 10);

        if (email && credits > 0) {
          const users = await getUsers();
          if (users[email]) {
            users[email].credits = (users[email].credits || 0) + credits;
            users[email].subscriptionId = session.subscription as string;
            users[email].planId = session.metadata?.planId;
            users[email].updatedAt = new Date().toISOString();
            await saveUsers(users);
            console.log(`Added ${credits} credits to user ${email}`);
          }
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const email = subscription.metadata?.email;
        if (email) {
          const users = await getUsers();
          if (users[email]) {
            users[email].subscriptionStatus = subscription.status;
            users[email].updatedAt = new Date().toISOString();
            await saveUsers(users);
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const email = subscription.metadata?.email;
        if (email) {
          const users = await getUsers();
          if (users[email]) {
            users[email].subscriptionId = null;
            users[email].subscriptionStatus = "canceled";
            users[email].credits = 10;
            users[email].planId = null;
            users[email].updatedAt = new Date().toISOString();
            await saveUsers(users);
            console.log(`Subscription canceled for ${email}, reset to free tier`);
          }
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = (invoice as any).subscription;
        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId as string);
          const email = subscription.metadata?.email;
          const credits = parseInt(subscription.metadata?.credits || "0", 10);
          if (email && credits > 0) {
            const users = await getUsers();
            if (users[email]) {
              users[email].credits = (users[email].credits || 0) + credits;
              users[email].updatedAt = new Date().toISOString();
              await saveUsers(users);
              console.log(`Monthly renewal: Added ${credits} credits to ${email}`);
            }
          }
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        console.log(`Payment failed for invoice ${invoice.id}`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}