import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { blockedId } = await req.json();

    if (!blockedId) {
      return NextResponse.json({ message: "Blocked user ID is required" }, { status: 400 });
    }

    if (session.user.id === blockedId) {
      return NextResponse.json({ message: "You cannot block yourself" }, { status: 400 });
    }

    // Upsert to ignore if already blocked
    await prisma.block.upsert({
      where: {
        blockerId_blockedId: { blockerId: session.user.id, blockedId }
      },
      update: {},
      create: {
        blockerId: session.user.id,
        blockedId
      }
    });

    // Also, if there are pending connection requests or matches, those should ideally be deleted or archived.
    // For this demo, we'll delete mutual matches and pending requests to be safe.
    await prisma.match.deleteMany({
      where: {
        OR: [
          { user1Id: session.user.id, user2Id: blockedId },
          { user1Id: blockedId, user2Id: session.user.id }
        ]
      }
    });

    await prisma.connectionRequest.deleteMany({
      where: {
        OR: [
          { senderId: session.user.id, receiverId: blockedId },
          { senderId: blockedId, receiverId: session.user.id }
        ]
      }
    });

    return NextResponse.json({ message: "User blocked successfully." }, { status: 200 });
  } catch (error) {
    console.error("Block POST error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
