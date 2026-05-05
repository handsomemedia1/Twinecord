import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// This is a stub for the Persona webhook integration.
// When a user completes their ID/Selfie check, Persona hits this endpoint.
export async function POST(req: Request) {
  try {
    // 1. Verify Webhook Signature (Crucial for security so people can't spoof approvals)
    const signature = req.headers.get("persona-signature");
    if (!signature) {
      // In prod, validate this against process.env.PERSONA_WEBHOOK_SECRET
      console.warn("Invalid Persona Webhook signature");
    }

    const payload = await req.json();

    // 2. Process the Event
    if (payload.data?.attributes?.status === "passed") {
      const referenceId = payload.data.attributes.referenceId; // This should be our internal userId

      if (referenceId) {
        await prisma.profile.update({
          where: { userId: referenceId },
          data: { verificationStatus: "VERIFIED" }
        });
        
        console.log(`[VERIFICATION] User ${referenceId} successfully verified via Persona.`);
      }
    } else if (payload.data?.attributes?.status === "failed") {
      const referenceId = payload.data.attributes.referenceId;
      if (referenceId) {
        await prisma.profile.update({
          where: { userId: referenceId },
          data: { verificationStatus: "REJECTED" }
        });
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("Persona Webhook Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
