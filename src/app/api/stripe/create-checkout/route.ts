import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import Stripe from "stripe";
import prisma from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia" as any, // latest version
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true, stripeCustomerId: true }
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Replace with your actual Stripe Price ID for Premium
    const priceId = process.env.STRIPE_PREMIUM_PRICE_ID; 
    
    if (!priceId) {
      console.warn("STRIPE_PREMIUM_PRICE_ID is not set in env variables.");
      return new NextResponse("Stripe configuration error", { status: 500 });
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: user.stripeCustomerId || undefined,
      customer_email: user.stripeCustomerId ? undefined : user.email,
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/premium?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/premium?canceled=true`,
      metadata: {
        userId: session.user.id,
      },
    });

    return NextResponse.json({ url: checkoutSession.url });

  } catch (error) {
    console.error("[STRIPE_CHECKOUT]", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
