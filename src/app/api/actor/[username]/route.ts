import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ username: string }> }) {
  try {
    const { username } = await params; // In this demo, username is actually the user ID

    const user = await prisma.user.findUnique({
      where: { id: username },
      include: { profile: true }
    });

    if (!user) {
      return NextResponse.json({ message: "Actor not found" }, { status: 404 });
    }

    // Determine the base URL (for local dev or prod)
    const protocol = req.headers.get("x-forwarded-proto") || "http";
    const host = req.headers.get("host") || "localhost:3000";
    const baseUrl = `${protocol}://${host}`;

    // Standard ActivityPub Actor format
    const actorResponse = {
      "@context": [
        "https://www.w3.org/ns/activitystreams",
        "https://w3id.org/security/v1"
      ],
      id: `${baseUrl}/api/actor/${user.id}`,
      type: "Person",
      preferredUsername: user.email.split("@")[0],
      name: user.profile?.displayName || user.name || "TwineCord User",
      summary: user.profile?.bio || "A user on TwineCord.",
      inbox: `${baseUrl}/api/inbox/${user.id}`,
      outbox: `${baseUrl}/api/outbox/${user.id}`,
      url: `${baseUrl}/discover`,
      icon: {
        type: "Image",
        mediaType: "image/png",
        // Using placeholder for demo
        url: `${baseUrl}/couple-photo.png`
      },
      publicKey: {
        id: `${baseUrl}/api/actor/${user.id}#main-key`,
        owner: `${baseUrl}/api/actor/${user.id}`,
        // Dummy public key for demo, real implementation requires actual RSA generation during signup
        publicKeyPem: user.publicKey || "-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"
      }
    };

    return NextResponse.json(actorResponse, {
      status: 200,
      headers: {
        "Content-Type": "application/activity+json"
      }
    });

  } catch (error) {
    console.error("Actor endpoint error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
