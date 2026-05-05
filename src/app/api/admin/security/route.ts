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

    const logs = await prisma.securityLog.findMany({
      include: {
        user: { select: { email: true, name: true } }
      },
      orderBy: { createdAt: "desc" },
      take: 200 // Limit for dashboard performance
    });

    return NextResponse.json({ logs }, { status: 200 });
  } catch (error) {
    console.error("Security Logs fetch error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
