import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const reportSchema = z.object({
  reportedId: z.string(),
  reason: z.string().min(1, "Reason is required"),
  matchId: z.string().optional()
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { reportedId, reason, matchId } = reportSchema.parse(body);

    // Ensure they aren't reporting themselves
    if (session.user.id === reportedId) {
      return NextResponse.json({ message: "You cannot report yourself" }, { status: 400 });
    }

    const report = await prisma.report.create({
      data: {
        reporterId: session.user.id,
        reportedId,
        reason,
        matchId
      }
    });

    return NextResponse.json({ message: "Report submitted successfully.", report }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.errors[0].message }, { status: 400 });
    }
    console.error("Report POST error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
