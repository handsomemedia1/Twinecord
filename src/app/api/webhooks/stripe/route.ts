import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import prisma from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia" as any,
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  if (event.type === "checkout.session.completed") {
    // Retrieve the subscription
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    );

    if (!session?.metadata?.userId) {
      return new NextResponse("User ID missing in metadata", { status: 400 });
    }

    // Update user to premium and save stripe details
    await prisma.user.update({
      where: {
        id: session.metadata.userId,
      },
      data: {
        isPremium: true,
        stripeCustomerId: subscription.customer as string,
      },
    });
  }

  if (event.type === "customer.subscription.deleted") {
    // When a subscription is canceled/expires
    const subscription = await stripe.subscriptions.retrieve(
      session.id as string
    );
    
    await prisma.user.updateMany({
      where: {
        stripeCustomerId: subscription.customer as string,
      },
      data: {
        isPremium: false,
      },
    });
  }

  return new NextResponse("OK", { status: 200 });
}
