import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      include: {
        profile: true
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    console.error("Admin Users fetch error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
