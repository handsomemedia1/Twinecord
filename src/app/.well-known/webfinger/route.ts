import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const resource = searchParams.get("resource");

    if (!resource || !resource.startsWith("acct:")) {
      return NextResponse.json({ message: "Invalid resource format" }, { status: 400 });
    }

    // resource looks like acct:username@domain.com
    const acctParts = resource.replace("acct:", "").split("@");
    if (acctParts.length !== 2) {
      return NextResponse.json({ message: "Invalid resource format" }, { status: 400 });
    }

    const username = acctParts[0];

    // For simplicity in this demo, we'll try to find a user where email starts with the username
    const user = await prisma.user.findFirst({
      where: {
        email: {
          startsWith: username + "@"
        }
      }
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Determine the base URL (for local dev or prod)
    const protocol = req.headers.get("x-forwarded-proto") || "http";
    const host = req.headers.get("host") || "localhost:3000";
    const baseUrl = `${protocol}://${host}`;

    const webfingerResponse = {
      subject: resource,
      links: [
        {
          rel: "self",
          type: "application/activity+json",
          href: `${baseUrl}/api/actor/${user.id}`
        }
      ]
    };

    return NextResponse.json(webfingerResponse, {
      status: 200,
      headers: {
        "Content-Type": "application/jrd+json"
      }
    });
  } catch (error) {
    console.error("Webfinger error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
