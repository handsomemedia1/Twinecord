import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        isBoosted: !user.isBoosted
      }
    });

    return NextResponse.json({ 
      message: `User ${updatedUser.isBoosted ? 'boosted' : 'un-boosted'} successfully.`,
      isBoosted: updatedUser.isBoosted
    }, { status: 200 });

  } catch (error) {
    console.error("Admin Boost error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
