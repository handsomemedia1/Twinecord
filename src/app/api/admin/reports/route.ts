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

    const reports = await prisma.report.findMany({
      include: {
        reporter: { select: { email: true, name: true, profile: { select: { displayName: true } } } },
        reported: { select: { email: true, name: true, profile: { select: { displayName: true } } } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ reports }, { status: 200 });
  } catch (error) {
    console.error("Admin Reports fetch error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
