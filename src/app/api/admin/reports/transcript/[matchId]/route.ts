import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ matchId: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { matchId } = await params;

    // Verify a report actually exists for this match before allowing access
    const reportExists = await prisma.report.findFirst({
      where: { matchId }
    });

    if (!reportExists) {
      return NextResponse.json({ message: "Unauthorized. DM Escrow locked. No report filed for this match." }, { status: 403 });
    }

    const messages = await prisma.message.findMany({
      where: { matchId },
      orderBy: { createdAt: "asc" }
    });

    return NextResponse.json({ messages }, { status: 200 });
  } catch (error) {
    console.error("Admin Transcript fetch error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
