import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id }
    });

    if (!profile) return NextResponse.json({ message: "Profile not found" }, { status: 404 });

    return NextResponse.json({ profile }, { status: 200 });
  } catch (error) {
    console.error("Settings GET error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { isPaused, filterMinAge, filterMaxAge, filterDenomination } = body;

    const updatedProfile = await prisma.profile.update({
      where: { userId: session.user.id },
      data: {
        isPaused: isPaused !== undefined ? isPaused : undefined,
        filterMinAge: filterMinAge !== undefined ? parseInt(filterMinAge) : undefined,
        filterMaxAge: filterMaxAge !== undefined ? parseInt(filterMaxAge) : undefined,
        filterDenomination: filterDenomination !== undefined ? filterDenomination : undefined,
      }
    });

    return NextResponse.json({ profile: updatedProfile }, { status: 200 });
  } catch (error) {
    console.error("Settings POST error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
