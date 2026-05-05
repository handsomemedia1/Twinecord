import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// Reusable admin check middleware
export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role !== "ADMIN") {
    // Note: For local testing, we might want to bypass this, 
    // but for production this MUST be strict.
    // For now, we will enforce it.
    throw new Error("Unauthorized");
  }
  return session;
}

export async function GET() {
  try {
    await requireAdmin();

    const totalUsers = await prisma.user.count();
    const premiumUsers = await prisma.user.count({ where: { isPremium: true } });
    const totalMatches = await prisma.match.count();
    const totalPosts = await prisma.post.count();
    const activeRequests = await prisma.connectionRequest.count({ where: { status: "PENDING" } });

    // Recent signups
    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: { id: true, email: true, name: true, createdAt: true, isPremium: true }
    });

    return NextResponse.json({
      stats: {
        totalUsers,
        premiumUsers,
        totalMatches,
        totalPosts,
        activeRequests
      },
      recentUsers
    }, { status: 200 });

  } catch (error: any) {
    if (error.message === "Unauthorized") return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
